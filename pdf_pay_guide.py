#!/usr/bin/env python3
"""
pdf_pay_guide.py — Journalists Published Media Award pay guide reader

Reads the Fair Work Ombudsman PDF pay guide, extracts all rate tables,
collates them by publication category and employment type, and writes a
self-contained interactive HTML viewer.

Usage:
    python3 pdf_pay_guide.py pay_guide.pdf
    python3 pdf_pay_guide.py pay_guide.pdf --output pay_guide.html
    python3 pdf_pay_guide.py pay_guide.pdf --open        # open in browser after writing

Requires: pip install pdfplumber
"""

import argparse
import json
import sys
import webbrowser
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    print("pdfplumber is required.  Install it with:  pip install pdfplumber", file=sys.stderr)
    sys.exit(1)


# ── Known publication categories ──────────────────────────────────────────────

CATEGORIES = [
    "Magazine or wire service",
    "Country non-daily newspaper",
    "Metropolitan daily newspaper",
    "Regional daily newspaper",
    "Suburban newspaper",
    "Digital publications",
    "Other publications",
]


# ── Text helpers ──────────────────────────────────────────────────────────────

def normalize(text):
    if text is None:
        return ""
    return " ".join(str(text).replace("\n", " ").split()).strip()


# ── Table extraction ──────────────────────────────────────────────────────────

def find_header_end(raw):
    """Return the index of the first real data row (col[0] has classification text)."""
    for r, row in enumerate(raw):
        v = normalize(row[0]) if row else ""
        if v and v.lower() != "classification":
            return r
    return len(raw)


def build_column_names(raw, header_end):
    """Combine multi-row header fragments into per-column names."""
    if not raw or not raw[0]:
        return []
    names = []
    for c in range(len(raw[0])):
        parts = [normalize(raw[r][c]) for r in range(header_end) if normalize(raw[r][c])]
        names.append(" ".join(parts) if parts else f"_unnamed_{c}")
    return names


def extract_raw_table(raw):
    """Parse raw pdfplumber rows → (column_names, data_rows) with _unnamed_N placeholders."""
    if not raw or not raw[0]:
        return [], []
    header_end = find_header_end(raw) or 1
    col_names = build_column_names(raw, header_end)
    data = []
    for row in raw[header_end:]:
        if not row:
            continue
        rd = {col_names[i]: normalize(cell) for i, cell in enumerate(row) if i < len(col_names)}
        first = rd.get(col_names[0], "") if col_names else ""
        if first and first.lower() != "classification":
            data.append(rd)
    return col_names, data


def clean_columns(col_names, data_rows):
    """
    Resolve PDF column-spanning artefacts.

    pdfplumber sometimes places a cell's value one column to the LEFT of its
    header label (and N/A markers at the header position), creating
    "complementary pairs":
        _unnamed_N  — holds dollar values for most rows
        labeled_{N+1} — holds 'N/A' for senior/exempt classifications

    Three passes:
      1. Merge each complementary (_unnamed, named) pair into the named column.
      2. Merge _unnamed_N into the preceding named column when complementary
         (covers the cadets' 'N/A' weekly-rate pattern).
      3. Drop every remaining _unnamed_N that is completely empty.
    """
    if not col_names or not data_rows:
        return col_names, data_rows

    ncols = len(col_names)

    def col_values(i):
        return [row.get(col_names[i], "") for row in data_rows]

    def complementary(va, vb):
        """True when no row has two different non-empty values."""
        return all(
            not (a.strip() and b.strip() and a.strip() != b.strip())
            for a, b in zip(va, vb)
        )

    names = list(col_names)
    drop: set[int] = set()

    # Pass 1 — unnamed before a named neighbor
    for i in range(ncols - 1):
        if i in drop or not names[i].startswith("_unnamed_"):
            continue
        j = next((k for k in range(i + 1, ncols) if k not in drop), None)
        if j is None or names[j].startswith("_unnamed_"):
            continue
        va, vb = col_values(i), col_values(j)
        if (any(v.strip() for v in va) or any(v.strip() for v in vb)) and complementary(va, vb):
            target = names[j]
            for row, a, b in zip(data_rows, va, vb):
                row[target] = a if a.strip() else b
            drop.add(i)

    # Pass 2 — unnamed after a named neighbor
    for i in range(1, ncols):
        if i in drop or not names[i].startswith("_unnamed_"):
            continue
        prev = next((k for k in range(i - 1, -1, -1) if k not in drop), None)
        if prev is None or names[prev].startswith("_unnamed_"):
            continue
        va, vb = col_values(prev), col_values(i)
        if any(v.strip() for v in vb) and complementary(va, vb):
            target = names[prev]
            for row, a, b in zip(data_rows, va, vb):
                row[target] = a if a.strip() else b
            drop.add(i)

    # Pass 3 — drop empties
    for i in range(ncols):
        if i not in drop and not any(v.strip() for v in col_values(i)):
            drop.add(i)

    keep = [i for i in range(ncols) if i not in drop]
    final_names = [names[i] for i in keep]

    # Deduplicate
    seen: dict[str, int] = {}
    deduped = []
    for n in final_names:
        seen[n] = seen.get(n, 0)
        deduped.append(n if seen[n] == 0 else f"{n} ({seen[n]})")
        seen[n] += 1

    orig_kept = [col_names[i] for i in keep]
    clean_rows = [{dc: row.get(oc, "") for dc, oc in zip(deduped, orig_kept)} for row in data_rows]
    return deduped, clean_rows


def extract_table(raw):
    col_names, data_rows = extract_raw_table(raw)
    return clean_columns(col_names, data_rows)


def merge_rows(base, new_rows, key):
    row_map = {r.get(key, ""): r for r in base}
    for nr in new_rows:
        k = nr.get(key, "")
        if k in row_map:
            for col, val in nr.items():
                if val and not row_map[k].get(col, ""):
                    row_map[k][col] = val
                elif col not in row_map[k]:
                    row_map[k][col] = val
        else:
            base.append(nr)
    return base


def merge_columns(base, new):
    existing = set(base)
    for c in new:
        if c not in existing:
            base.append(c)
            existing.add(c)
    return base


def is_main_table(tbl):
    return bool(tbl) and len(tbl) > 3 and len(tbl[0]) > 4


def get_lines(page):
    return [l.strip() for l in (page.extract_text() or "").split("\n") if l.strip()]


# ── Main extraction driver ────────────────────────────────────────────────────

def extract_all(pdf_path: Path) -> dict:
    """
    Walk every page of the PDF, detect category headings, extract all rate
    tables, merge continuation tables by matching 'Classification', and return
    a nested dict:
        { category: { employment_type: { columns, rows } }, "Allowances": {...} }
    """
    results: dict = {}
    state: dict = {"cat": None, "emp": None, "cols": None, "rows": []}

    def flush():
        if state["cat"] and state["rows"]:
            cat, emp = state["cat"], state["emp"] or "Unknown"
            results.setdefault(cat, {})[emp] = {
                "columns": list(state["cols"] or []),
                "rows": list(state["rows"]),
            }
        state["rows"] = []
        state["cols"] = None

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            lines = get_lines(page)

            # ── Allowances (always the last page) ─────────────────────────
            if lines and "allowances" in lines[0].lower():
                flush()
                for tbl in page.extract_tables():
                    if tbl and len(tbl) > 1 and tbl[0] and len(tbl[0]) == 2:
                        c0, c1 = normalize(tbl[0][0]), normalize(tbl[0][1])
                        rows = [
                            {c0: normalize(r[0]), c1: normalize(r[1])}
                            for r in tbl[1:] if r and normalize(r[0])
                        ]
                        if rows:
                            results["Allowances"] = {"columns": [c0, c1], "rows": rows}
                        break
                continue

            # ── Detect category / employment-type heading ──────────────────
            cat = next((c for l in lines[:5] for c in CATEGORIES if c.lower() in l.lower()), None)
            emp = next(
                ("Casual" if "casual" in l.lower()
                 else "Full-time & Part-time" if "full-time" in l.lower() or "part-time" in l.lower()
                 else None
                 for l in lines[:5] if l),
                None,
            )

            if cat:
                flush()
                state["cat"] = cat
                state["emp"] = emp

            if not state["cat"]:
                continue

            # ── Extract tables from this page ──────────────────────────────
            for raw_tbl in [t for t in page.extract_tables() if is_main_table(t)]:
                cols, rows = extract_table(raw_tbl)
                if not rows:
                    continue
                key = cols[0] if cols else "Classification"
                if state["cols"] is None:
                    state["cols"], state["rows"] = cols, rows
                else:
                    state["rows"] = merge_rows(state["rows"], rows, key)
                    state["cols"] = merge_columns(state["cols"], cols)

    flush()
    return results


# ── HTML generation ───────────────────────────────────────────────────────────

HTML_TEMPLATE = r"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pay Guide — Journalists Published Media Award</title>
<style>
/* ── Design tokens ─────────────────────────────────── */
:root {
  --bg:            #F5F5F2;
  --surface:       #FFFFFF;
  --surface2:      #EFEFE9;
  --text:          #14141A;
  --text-sub:      #5C5C6A;
  --border:        #D2D2C8;
  --accent:        #0046B0;
  --accent-bg:     #E5EDF8;
  --accent-text:   #FFFFFF;
  --money:         #125628;
  --money-bg:      #EAF5EE;
  --na:            #9090A0;
  --th-bg:         #EBEBЕ5;
  --row-alt:       #F9F9F6;
  --sticky-shadow: 4px 0 10px rgba(0,0,0,.07);
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg:            #10101A;
    --surface:       #18181F;
    --surface2:      #202028;
    --text:          #E5E5EE;
    --text-sub:      #72728A;
    --border:        #2C2C3A;
    --accent:        #4D8FFF;
    --accent-bg:     #142040;
    --accent-text:   #FFFFFF;
    --money:         #3DC96C;
    --money-bg:      #0D2218;
    --na:            #50506A;
    --th-bg:         #1E1E28;
    --row-alt:       #1B1B22;
    --sticky-shadow: 4px 0 10px rgba(0,0,0,.35);
  }
}
:root[data-theme="dark"]  {
  --bg:#10101A; --surface:#18181F; --surface2:#202028; --text:#E5E5EE;
  --text-sub:#72728A; --border:#2C2C3A; --accent:#4D8FFF; --accent-bg:#142040;
  --accent-text:#FFFFFF; --money:#3DC96C; --money-bg:#0D2218; --na:#50506A;
  --th-bg:#1E1E28; --row-alt:#1B1B22; --sticky-shadow:4px 0 10px rgba(0,0,0,.35);
}
:root[data-theme="light"] {
  --bg:#F5F5F2; --surface:#FFFFFF; --surface2:#EFEFE9; --text:#14141A;
  --text-sub:#5C5C6A; --border:#D2D2C8; --accent:#0046B0; --accent-bg:#E5EDF8;
  --accent-text:#FFFFFF; --money:#125628; --money-bg:#EAF5EE; --na:#9090A0;
  --th-bg:#EBEBЕ5; --row-alt:#F9F9F6; --sticky-shadow:4px 0 10px rgba(0,0,0,.07);
}

/* ── Base ──────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 14px; }
body {
  background: var(--bg);
  color: var(--text);
  display: flex;
  flex-direction: column;
  font-family: system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
  line-height: 1.45;
  min-height: 100vh;
}

/* ── Top bar ───────────────────────────────────────── */
.topbar {
  align-items: center;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-wrap: wrap;
  gap: .5rem 1.5rem;
  min-height: 3rem;
  padding: .5rem 1.25rem;
}
.topbar-title { font-size: .88rem; font-weight: 700; letter-spacing: -.01em; }
.topbar-meta  { color: var(--text-sub); font-size: .7rem; letter-spacing: .04em; text-transform: uppercase; }
.topbar-right { margin-left: auto; }
.theme-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-sub);
  cursor: pointer;
  font-size: .72rem;
  padding: .25rem .65rem;
}
.theme-btn:hover { border-color: var(--accent); color: var(--text); }
.theme-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* ── Category tabs ─────────────────────────────────── */
.cat-tabs {
  background: var(--surface);
  border-bottom: 2px solid var(--border);
  display: flex;
  overflow-x: auto;
  padding: 0 1.25rem;
  scrollbar-width: none;
}
.cat-tabs::-webkit-scrollbar { display: none; }
.cat-tab {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-sub);
  cursor: pointer;
  flex-shrink: 0;
  font-size: .79rem;
  font-weight: 500;
  margin-bottom: -2px;
  padding: .65rem 1rem;
  transition: color .1s, border-color .1s;
  white-space: nowrap;
}
.cat-tab:hover { color: var(--text); }
.cat-tab.active { border-bottom-color: var(--accent); color: var(--accent); font-weight: 700; }
.cat-tab:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }

/* ── Controls bar ──────────────────────────────────── */
.controls {
  align-items: center;
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-wrap: wrap;
  gap: .5rem .75rem;
  padding: .5rem 1.25rem;
}
.emp-toggle {
  border: 1px solid var(--border);
  border-radius: 4px;
  display: flex;
  flex-shrink: 0;
  overflow: hidden;
}
.emp-btn {
  background: none;
  border: none;
  border-right: 1px solid var(--border);
  color: var(--text-sub);
  cursor: pointer;
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .04em;
  padding: .28rem .75rem;
  text-transform: uppercase;
  transition: background .1s, color .1s;
  white-space: nowrap;
}
.emp-btn:last-child { border-right: none; }
.emp-btn:hover     { background: var(--surface); color: var(--text); }
.emp-btn.active    { background: var(--accent); color: var(--accent-text); }
.emp-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }

.search-wrap { flex: 0 1 210px; min-width: 130px; position: relative; }
.search-icon { color: var(--text-sub); left: .5rem; pointer-events: none; position: absolute; top: 50%; transform: translateY(-50%); }
.search-input {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  font-size: .79rem;
  outline: none;
  padding: .28rem .5rem .28rem 1.85rem;
  width: 100%;
}
.search-input:focus        { border-color: var(--accent); }
.search-input::placeholder { color: var(--na); }

.filter-label { color: var(--text-sub); font-size: .65rem; letter-spacing: .07em; text-transform: uppercase; }
.chip {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--text-sub);
  cursor: pointer;
  font-size: .69rem;
  padding: .2rem .55rem;
  transition: background .1s, border-color .1s, color .1s;
  white-space: nowrap;
}
.chip:hover  { border-color: var(--accent); color: var(--text); }
.chip.active { background: var(--accent-bg); border-color: var(--accent); color: var(--accent); font-weight: 600; }
.chip:focus-visible { outline: 2px solid var(--accent); }

/* ── Notice bar ────────────────────────────────────── */
.notice {
  background: var(--accent-bg);
  border-bottom: 1px solid var(--border);
  color: var(--accent);
  display: none;
  font-size: .72rem;
  padding: .38rem 1.25rem;
}
.notice.on { display: block; }

/* ── Table container ───────────────────────────────── */
.main   { flex: 1; overflow: hidden; }
.t-wrap { max-height: calc(100vh - 11.5rem); overflow: auto; -webkit-overflow-scrolling: touch; }
.data-table { border-collapse: collapse; font-size: .8rem; min-width: 100%; width: max-content; }

/* ── Header rows ───────────────────────────────────── */
.th-group {
  background: var(--th-bg);
  border-bottom: 1px solid var(--border);
  border-right: 1px solid var(--border);
  color: var(--text-sub);
  font-size: .63rem;
  font-weight: 700;
  letter-spacing: .1em;
  padding: .3rem .75rem;
  position: sticky;
  text-align: center;
  text-transform: uppercase;
  top: 0;
  white-space: nowrap;
  z-index: 3;
}
.th-group.cls { background: var(--surface); border-right: 2px solid var(--border); left: 0; min-width: 11rem; text-align: left; z-index: 5; }
.th-col {
  background: var(--th-bg);
  border-bottom: 2px solid var(--border);
  border-right: 1px solid var(--border);
  color: var(--text-sub);
  font-size: .67rem;
  font-weight: 600;
  letter-spacing: .02em;
  padding: .35rem .75rem;
  position: sticky;
  text-align: right;
  top: 1.5rem;
  white-space: nowrap;
  z-index: 3;
}
.th-col.cls { background: var(--surface); border-right: 2px solid var(--border); left: 0; text-align: left; z-index: 5; }

/* ── Data cells ────────────────────────────────────── */
.td-cls {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  border-right: 2px solid var(--border);
  font-size: .82rem;
  left: 0;
  padding: .38rem .75rem;
  position: sticky;
  white-space: nowrap;
  z-index: 2;
  box-shadow: var(--sticky-shadow);
}
.td-val {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  border-right: 1px solid var(--border);
  font-variant-numeric: tabular-nums;
  padding: .38rem .75rem;
  text-align: right;
  white-space: nowrap;
}
tr:nth-child(even) .td-cls { background: var(--row-alt); }
tr:nth-child(even) .td-val { background: var(--row-alt); }
.v-money { color: var(--money); font-weight: 500; }
.v-na    { color: var(--na); font-style: italic; font-size: .72rem; }
.v-empty { color: var(--border); }
.group-start { border-left: 2px solid var(--border); }

/* ── Allowances ────────────────────────────────────── */
.allow-wrap { margin: 1.5rem auto; max-width: 820px; padding: 0 1.25rem; }
.allow-heading { color: var(--text-sub); font-size: .72rem; font-weight: 700; letter-spacing: .09em; margin-bottom: .75rem; text-transform: uppercase; }
.allow-table   { border-collapse: collapse; font-size: .83rem; width: 100%; }
.allow-table th {
  background: var(--th-bg);
  border-bottom: 2px solid var(--border);
  color: var(--text-sub);
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .08em;
  padding: .5rem .75rem;
  text-align: left;
  text-transform: uppercase;
}
.allow-table td { border-bottom: 1px solid var(--border); padding: .5rem .75rem; vertical-align: top; }
.allow-table td:first-child { font-weight: 600; width: 38%; }
.allow-table td:last-child  { color: var(--text-sub); font-size: .79rem; line-height: 1.45; }
.allow-table tr:hover td    { background: var(--row-alt); }
.star { color: var(--accent); }

/* ── Empty state ───────────────────────────────────── */
.empty { color: var(--text-sub); font-size: .85rem; padding: 3rem 1.25rem; text-align: center; }

/* ── Footer ────────────────────────────────────────── */
footer {
  background: var(--surface);
  border-top: 1px solid var(--border);
  color: var(--text-sub);
  font-size: .69rem;
  line-height: 1.6;
  padding: .6rem 1.25rem;
}

@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; } }
</style>
</head>
<body>

<header class="topbar">
  <div>
    <div class="topbar-title">Pay Guide — Journalists Published Media Award</div>
    <div class="topbar-meta" id="topbarMeta"></div>
  </div>
  <div class="topbar-right">
    <button class="theme-btn" id="themeBtn">☀ / ☾</button>
  </div>
</header>

<nav class="cat-tabs" id="catTabs" role="tablist" aria-label="Publication category"></nav>

<div class="controls">
  <div class="emp-toggle" id="empToggle" role="group" aria-label="Employment type"></div>
  <div class="search-wrap">
    <svg class="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.5"/>
      <line x1="10.5" y1="10.5" x2="15" y2="15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <input class="search-input" id="searchInput" type="search" placeholder="Filter classifications…" aria-label="Filter by classification">
  </div>
  <span class="filter-label">Show:</span>
  <div id="chips" style="display:flex;gap:.375rem;flex-wrap:wrap"></div>
</div>

<div class="notice" id="notice"></div>

<main class="main" id="mount"></main>

<footer id="footer">
  Data sourced from the Fair Work Ombudsman Pay Guide, Journalists Published Media Award [MA000067].
  Rates apply from the first full pay period on or after 1&nbsp;July&nbsp;2026.
  This viewer is a summary only — visit <strong>fairwork.gov.au</strong> for authoritative information.
</footer>

<script>
// ── Embedded pay data ───────────────────────────────────────────────────────
const DATA = __PAYLOAD__;

// ── Column metadata ─────────────────────────────────────────────────────────
function shortLabel(col) {
  const c = col.toLowerCase();
  if (c === 'classification')   return 'Classification';
  if (c === 'weekly pay rate')  return 'Weekly';
  if (c === 'hourly pay rate')  return 'Hourly';
  const monFri = c.includes('monday to friday') || (c.includes('mon') && c.includes('fri') && !c.includes('saturday'));
  if (monFri) {
    if (c.includes('6am and 7am')   || (c.includes('includes') && c.includes('6am'))) return 'M–F · 6am–7am';
    if (c.includes('6pm and 8.30pm')|| c.includes('finishes between 6pm'))             return 'M–F · 6pm–8:30pm';
    if (c.includes('8.30pm and 6am'))                                                  return 'M–F · 8:30pm–6am';
    return 'M–F shift';
  }
  const satSun = c.includes('saturday') || c.includes('sunday');
  if (satSun) {
    if (c.includes('starts after 7am') || c.includes('finishes before 6pm') ||
        (c.includes('7am') && c.includes('6pm') && !c.includes('shiftwork'))) return 'Sat–Sun · Day';
    if (c.includes('6am and 7am'))   return 'Sat–Sun · 6am–7am';
    if (c.includes('6pm and 8.30pm'))return 'Sat–Sun · 6pm–8:30pm';
    if (c.includes('8.30pm and 6am'))return 'Sat–Sun · 8:30pm–6am';
    return 'Sat–Sun shift';
  }
  if (c === 'public holiday') return 'Public Hol.';
  if (c.includes('overtime') || c.startsWith('overtime')) {
    if (c.includes('day off'))                          return 'OT · Day Off';
    if (c.includes('distant') && c.includes('first 8'))return 'Distant · 1st 8h';
    if (c.includes('distant') && c.includes('after 8'))return 'Distant · 8h+';
    if (c.includes('first 2')  && c.includes('full'))  return 'OT · 1st 2h (FT)';
    if (c.includes('after 2')  && c.includes('full'))  return 'OT · 2h+ (FT)';
    if (c.includes('first 2'))                         return 'OT · 1st 2h';
    if (c.includes('after 2'))                         return 'OT · 2h+';
    if (c.includes('first 3'))                         return 'OT · 1st 3h (PT)';
    if (c.includes('after 3'))                         return 'OT · 3h+ (PT)';
    return 'Overtime';
  }
  if (c.includes('12 hour break') || c.includes('12-hour')) return 'Break < 12h';
  if (c.includes('8 hour break')  && c.includes('less'))    return 'Break < 8h';
  if (c.includes('8 hours')       && c.includes('11 hours'))return 'Break 8–11h';
  if (c.includes('break'))                                   return 'Break';
  return col;
}

function groupId(s) {
  if (s === 'Classification' || s === 'Weekly' || s === 'Hourly') return 'base';
  if (s.startsWith('M–F'))    return 'monFri';
  if (s.startsWith('Sat–Sun'))return 'satSun';
  if (s.startsWith('OT') || s.startsWith('Distant') || s === 'Public Hol.') return 'ot';
  if (s.startsWith('Break'))  return 'break';
  return 'base';
}

const GROUPS = [
  { id: 'base',   label: 'Base Rates' },
  { id: 'monFri', label: 'Mon–Fri Shiftwork' },
  { id: 'satSun', label: 'Sat–Sun Shiftwork' },
  { id: 'ot',     label: 'Overtime & Penalty' },
  { id: 'break',  label: 'Break Penalties' },
];

// ── State ───────────────────────────────────────────────────────────────────
const cats    = Object.keys(DATA).filter(k => k !== 'Allowances');
let activeCat = cats[0];
let activeEmp = 'Full-time & Part-time';
let query     = '';
let shown     = new Set(['base','monFri','satSun','ot','break']);

// ── DOM refs ────────────────────────────────────────────────────────────────
const $catTabs = document.getElementById('catTabs');
const $emp     = document.getElementById('empToggle');
const $search  = document.getElementById('searchInput');
const $chips   = document.getElementById('chips');
const $notice  = document.getElementById('notice');
const $mount   = document.getElementById('mount');
const $meta    = document.getElementById('topbarMeta');

// ── Builders ────────────────────────────────────────────────────────────────
function buildCatTabs() {
  $catTabs.innerHTML = '';
  [...cats, 'Allowances'].forEach(cat => {
    const b = document.createElement('button');
    b.className  = 'cat-tab' + (cat === activeCat ? ' active' : '');
    b.textContent = cat;
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', String(cat === activeCat));
    b.addEventListener('click', () => {
      activeCat = cat;
      if (cat !== 'Allowances') {
        const types = Object.keys(DATA[cat] || {});
        if (!types.includes(activeEmp)) activeEmp = types[0] || activeEmp;
      }
      render();
    });
    $catTabs.appendChild(b);
  });
}

function buildEmpToggle() {
  $emp.innerHTML = '';
  if (activeCat === 'Allowances') { $emp.style.display = 'none'; return; }
  $emp.style.display = '';
  Object.keys(DATA[activeCat] || {}).forEach(emp => {
    const b = document.createElement('button');
    b.className   = 'emp-btn' + (emp === activeEmp ? ' active' : '');
    b.textContent = emp;
    b.addEventListener('click', () => { activeEmp = emp; render(); });
    $emp.appendChild(b);
  });
}

function buildChips(availGroups) {
  $chips.innerHTML = '';
  if (activeCat === 'Allowances') return;
  GROUPS.filter(g => availGroups.has(g.id) && g.id !== 'base').forEach(g => {
    const b = document.createElement('button');
    b.className   = 'chip' + (shown.has(g.id) ? ' active' : '');
    b.textContent = g.label;
    b.setAttribute('aria-pressed', String(shown.has(g.id)));
    b.addEventListener('click', () => {
      shown.has(g.id) ? shown.delete(g.id) : shown.add(g.id);
      render();
    });
    $chips.appendChild(b);
  });
}

function buildNotice() {
  const subEditCats = ['Country non-daily newspaper', 'Regional daily newspaper'];
  const msg = subEditCats.includes(activeCat)
    ? '★  Sub-editing allowance applies: use the Pay and Conditions Tool — do not apply these rates directly.'
    : '';
  $notice.textContent = msg;
  $notice.classList.toggle('on', !!msg);
}

// ── Table rendering ─────────────────────────────────────────────────────────
function renderTable() {
  if (activeCat === 'Allowances') { renderAllowances(); return; }

  const empData = DATA[activeCat];
  if (!empData || !empData[activeEmp]) {
    $mount.innerHTML = '<div class="empty">No data available.</div>';
    return;
  }
  const { columns, rows } = empData[activeEmp];
  $meta.textContent = `MA000067 · Rates from 1 July 2026 · ${activeCat} · ${activeEmp}`;

  const colMeta = columns.map(col => ({ col, short: shortLabel(col), gid: groupId(shortLabel(col)) }));
  const availGroups = new Set(colMeta.map(m => m.gid));
  buildChips(availGroups);

  const visCols = colMeta.filter(m => shown.has(m.gid));
  const q = query.toLowerCase();
  const visRows = q ? rows.filter(r => (r['Classification'] || '').toLowerCase().includes(q)) : rows;

  if (!visRows.length) { $mount.innerHTML = '<div class="empty">No classifications match your search.</div>'; return; }

  // Track first column of each group
  const groupStart = new Set();
  let prevGid = null;
  visCols.forEach((m, i) => { if (m.gid !== prevGid) { groupStart.add(i); prevGid = m.gid; } });

  // Build group spans (skip 'base' — it spans via rowspan on classification)
  const groupSpans = [];
  prevGid = null; let span = null;
  visCols.forEach(m => {
    if (m.gid !== prevGid) {
      span = { gid: m.gid, label: GROUPS.find(g => g.id === m.gid)?.label || m.gid, count: 0 };
      groupSpans.push(span); prevGid = m.gid;
    }
    span.count++;
  });

  // Create table
  const wrap  = document.createElement('div');
  wrap.className = 't-wrap';
  const table = document.createElement('table');
  table.className = 'data-table';
  const thead = document.createElement('thead');

  // Row 1 — group headers
  const gr = document.createElement('tr');
  groupSpans.forEach(g => {
    const th = document.createElement('th');
    if (g.gid === 'base') {
      th.className = 'th-group cls';
      th.textContent = 'Classification';
      th.setAttribute('rowspan', '2');
      th.style.verticalAlign = 'middle';
    } else {
      th.className = 'th-group';
      th.textContent = g.label;
      th.setAttribute('colspan', String(g.count));
    }
    gr.appendChild(th);
  });
  thead.appendChild(gr);

  // Row 2 — column headers (skip Classification — rowspan covers it)
  const cr = document.createElement('tr');
  visCols.forEach((m, i) => {
    if (m.col === 'Classification') return;
    const th = document.createElement('th');
    th.className = 'th-col' + (groupStart.has(i) ? ' group-start' : '');
    th.textContent = m.short;
    th.title       = m.col;
    cr.appendChild(th);
  });
  thead.appendChild(cr);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  visRows.forEach(row => {
    const tr = document.createElement('tr');
    visCols.forEach((m, i) => {
      if (m.col === 'Classification') {
        const td = document.createElement('td');
        td.className   = 'td-cls';
        td.textContent = row[m.col] || '';
        tr.appendChild(td); return;
      }
      const td  = document.createElement('td');
      td.className = 'td-val' + (groupStart.has(i) ? ' group-start' : '');
      const val = row[m.col] || '';
      if      (val === 'N/A')      td.innerHTML = '<span class="v-na">N/A</span>';
      else if (val.startsWith('$'))td.innerHTML = `<span class="v-money">${val}</span>`;
      else if (!val)               td.innerHTML = '<span class="v-empty">—</span>';
      else                         td.textContent = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  $mount.innerHTML = '';
  $mount.appendChild(wrap);
}

function renderAllowances() {
  $meta.textContent = 'MA000067 · Allowances';
  const { columns: cols, rows } = DATA['Allowances'];
  const wrap = document.createElement('div');
  wrap.className = 'allow-wrap';

  const heading = document.createElement('div');
  heading.className = 'allow-heading';
  heading.textContent = 'Allowances';
  wrap.appendChild(heading);

  const tbl  = document.createElement('table');
  tbl.className = 'allow-table';
  const head = document.createElement('thead');
  const hr   = document.createElement('tr');
  cols.forEach(c => { const th = document.createElement('th'); th.textContent = c; hr.appendChild(th); });
  head.appendChild(hr); tbl.appendChild(head);

  const body = document.createElement('tbody');
  rows.forEach(row => {
    const tr   = document.createElement('tr');
    const name = row[cols[0]] || '';
    const rate = row[cols[1]] || '';
    const td0  = document.createElement('td');
    const star = name.startsWith('*');
    td0.innerHTML = star
      ? `<span class="star">★</span> ${escHtml(name.slice(1).trim())}`
      : escHtml(name);
    const td1 = document.createElement('td');
    td1.textContent = rate;
    tr.appendChild(td0); tr.appendChild(td1);
    body.appendChild(tr);
  });
  tbl.appendChild(body);
  wrap.appendChild(tbl);
  $mount.innerHTML = '';
  $mount.appendChild(wrap);
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Main render cycle ───────────────────────────────────────────────────────
function render() {
  buildCatTabs();
  buildEmpToggle();
  buildNotice();
  renderTable();
}

// ── Events ──────────────────────────────────────────────────────────────────
$search.addEventListener('input', e => { query = e.target.value.trim(); renderTable(); });

let theme = null;
document.getElementById('themeBtn').addEventListener('click', () => {
  if (!theme) theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark';
  else theme = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
});

// ── Boot ────────────────────────────────────────────────────────────────────
render();
</script>
</body>
</html>"""


def generate_html(data: dict, pdf_path: Path) -> str:
    """Inject extracted data as a JSON payload into the HTML template."""
    payload = json.dumps(data, separators=(",", ":"), ensure_ascii=False)
    # Escape closing script tags that might appear inside string values
    payload = payload.replace("</script>", r"<\/script>")
    return HTML_TEMPLATE.replace("__PAYLOAD__", payload)


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Extract pay-rate tables from a Fair Work Ombudsman PDF pay guide "
                    "and write a self-contained interactive HTML viewer.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__.split("Requires:")[0].strip(),
    )
    parser.add_argument("pdf", type=Path, help="Path to the PDF pay guide")
    parser.add_argument(
        "-o", "--output", type=Path, default=None,
        help="Output HTML file (default: same directory as PDF, <stem>.html)",
    )
    parser.add_argument(
        "--open", action="store_true", dest="open_browser",
        help="Open the generated HTML in the default browser",
    )
    parser.add_argument(
        "--json", type=Path, default=None, metavar="FILE",
        help="Also save the extracted data as JSON to FILE",
    )
    args = parser.parse_args()

    pdf_path: Path = args.pdf.resolve()
    if not pdf_path.exists():
        parser.error(f"PDF not found: {pdf_path}")

    out_path: Path = (args.output or pdf_path.with_suffix(".html")).resolve()

    # ── Extract ───────────────────────────────────────────────────────────────
    print(f"Reading  : {pdf_path}")
    data = extract_all(pdf_path)

    # ── Summary ───────────────────────────────────────────────────────────────
    for cat, emp_types in data.items():
        if cat == "Allowances":
            print(f"  Allowances             : {len(emp_types.get('rows', []))} items")
        else:
            for emp, d in emp_types.items():
                print(f"  {cat[:32]:32s} / {emp[:22]:22s}: "
                      f"{len(d['rows']):2d} rows × {len(d['columns']):2d} cols")

    # ── Optional JSON output ──────────────────────────────────────────────────
    if args.json:
        args.json.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"JSON     : {args.json}")

    # ── Generate HTML ─────────────────────────────────────────────────────────
    html = generate_html(data, pdf_path)
    out_path.write_text(html, encoding="utf-8")
    print(f"HTML     : {out_path}  ({len(html):,} bytes)")

    if args.open_browser:
        webbrowser.open(out_path.as_uri())


if __name__ == "__main__":
    main()
