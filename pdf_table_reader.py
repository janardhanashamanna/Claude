#!/usr/bin/env python3
"""
PDF Table Reader - Journalists Published Media Award Pay Guide
Reads all tables from the PDF and collates data by category.
"""

import json
import sys
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    print("pdfplumber not installed. Run: pip install pdfplumber", file=sys.stderr)
    sys.exit(1)


PDF_PATH = Path(__file__).parent / "pay_guide.pdf"
OUTPUT_PATH = Path(__file__).parent / "pay_guide_data.json"

UPLOAD_PATH = Path(
    "/root/.claude/uploads/4fb408e4-97d0-55fb-9f61-62badeeb1001/"
    "18d6939b-Copy_of_payguidepdf_G00673111.pdf"
)

CATEGORIES = [
    "Magazine or wire service",
    "Country non-daily newspaper",
    "Metropolitan daily newspaper",
    "Regional daily newspaper",
    "Suburban newspaper",
    "Digital publications",
    "Other publications",
]


def normalize(text):
    if text is None:
        return ""
    return " ".join(str(text).replace("\n", " ").split()).strip()


def find_header_end(raw):
    """Index of the first real data row (col[0] has classification text)."""
    for r, row in enumerate(raw):
        v = normalize(row[0]) if row else ""
        if v and v.lower() != "classification":
            return r
    return len(raw)


def build_column_names(raw, header_end):
    """Combine multi-row header fragments into per-column names."""
    if not raw or not raw[0]:
        return []
    ncols = len(raw[0])
    names = []
    for c in range(ncols):
        parts = []
        for r in range(header_end):
            v = normalize(raw[r][c])
            if v:
                parts.append(v)
        names.append(" ".join(parts) if parts else f"_unnamed_{c}")
    return names


def extract_raw_table(raw):
    """
    Parse raw pdfplumber table rows into (column_names, data_rows).
    column_names use '_unnamed_N' for cells that had no header text.
    """
    if not raw or not raw[0]:
        return [], []

    header_end = find_header_end(raw)
    if header_end == 0:
        header_end = 1

    col_names = build_column_names(raw, header_end)

    data = []
    for row in raw[header_end:]:
        if not row:
            continue
        # Build dict: each unnamed column uses its value as-is (no forward fill)
        rd = {}
        for i, cell in enumerate(row):
            if i < len(col_names):
                rd[col_names[i]] = normalize(cell)
        first_val = rd.get(col_names[0], "") if col_names else ""
        if first_val and first_val.lower() != "classification":
            data.append(rd)

    return col_names, data


def clean_columns(col_names, data_rows):
    """
    Fix PDF table extraction artefacts caused by column spanning.

    The PDF renderer sometimes places a cell value one column to the LEFT of
    its header label (or right for N/A cells), creating complementary pairs:
      _unnamed_N  → has dollar values for most rows
      labeled_{N+1} → has 'N/A' for senior classifications

    Strategy:
    1. Find (unnamed_with_data, named_neighbor) pairs where every row has data
       in exactly one of the two (complementary).  Merge into the named column.
    2. Merge _unnamed_N into the immediately preceding named column when they
       are similarly complementary (the Weekly/N/A pattern).
    3. Drop any remaining _unnamed_N columns that are completely empty.
    """
    if not col_names or not data_rows:
        return col_names, data_rows

    ncols = len(col_names)

    def col_values(i):
        return [row.get(col_names[i], "") for row in data_rows]

    def complementary(vals_a, vals_b):
        """True when no row has conflicting (different non-empty) values in both columns."""
        return all(
            not (a.strip() and b.strip() and a.strip() != b.strip())
            for a, b in zip(vals_a, vals_b)
        )

    names = list(col_names)
    drop: set[int] = set()

    # Pass 1: merge complementary pairs (_unnamed_N, named_{N+1})
    for i in range(ncols - 1):
        if i in drop:
            continue
        if not names[i].startswith("_unnamed_"):
            continue
        j = i + 1
        while j < ncols and j in drop:
            j += 1
        if j >= ncols:
            continue
        if names[j].startswith("_unnamed_"):
            continue

        va = col_values(i)
        vb = col_values(j)
        has_a = any(v.strip() for v in va)
        has_b = any(v.strip() for v in vb)

        if (has_a or has_b) and complementary(va, vb):
            # Merge: put the non-empty value into the named column
            target = names[j]
            for row, a_val, b_val in zip(data_rows, va, vb):
                row[target] = a_val if a_val.strip() else b_val
            drop.add(i)  # drop the unnamed column (data moved to named)

    # Pass 2: merge _unnamed_N into the immediately preceding named column
    # when they are complementary (e.g. cadets' N/A weekly rate in _unnamed_2).
    for i in range(1, ncols):
        if i in drop or not names[i].startswith("_unnamed_"):
            continue
        prev = i - 1
        while prev >= 0 and prev in drop:
            prev -= 1
        if prev < 0 or names[prev].startswith("_unnamed_"):
            continue

        va = col_values(prev)
        vb = col_values(i)
        has_b = any(v.strip() for v in vb)

        if has_b and complementary(va, vb):
            target = names[prev]
            for row, a_val, b_val in zip(data_rows, va, vb):
                row[target] = a_val if a_val.strip() else b_val
            drop.add(i)

    # Pass 3: drop remaining unnamed and now-empty named columns
    for i in range(ncols):
        if i in drop:
            continue
        vals = col_values(i)
        if not any(v.strip() for v in vals):
            drop.add(i)

    keep = [i for i in range(ncols) if i not in drop]
    final_names = [names[i] for i in keep]

    # Deduplicate
    seen: dict[str, int] = {}
    deduped = []
    for n in final_names:
        if n in seen:
            seen[n] += 1
            deduped.append(f"{n} ({seen[n]})")
        else:
            seen[n] = 0
            deduped.append(n)

    orig_names_kept = [col_names[i] for i in keep]
    clean_rows = []
    for row in data_rows:
        new_row = {dc: row.get(oc, "") for dc, oc in zip(deduped, orig_names_kept)}
        clean_rows.append(new_row)

    return deduped, clean_rows


def extract_table(raw):
    """Full pipeline: raw rows → cleaned (column_names, data_rows)."""
    col_names, data_rows = extract_raw_table(raw)
    return clean_columns(col_names, data_rows)


def merge_rows(base_rows, new_rows, key_col):
    """Merge new_rows into base_rows by matching on key_col."""
    row_map = {r.get(key_col, ""): r for r in base_rows}
    for new_row in new_rows:
        k = new_row.get(key_col, "")
        if k in row_map:
            # Only update cells that are currently empty
            for col, val in new_row.items():
                if val and not row_map[k].get(col, ""):
                    row_map[k][col] = val
                elif col not in row_map[k]:
                    row_map[k][col] = val
        else:
            base_rows.append(new_row)
    return base_rows


def merge_columns(base_cols, new_cols):
    """Append column names that aren't already present."""
    existing = set(base_cols)
    for c in new_cols:
        if c not in existing:
            base_cols.append(c)
            existing.add(c)
    return base_cols


def is_main_table(tbl):
    return bool(tbl) and len(tbl) > 3 and len(tbl[0]) > 4


def detect_category(lines):
    for line in lines[:5]:
        for cat in CATEGORIES:
            if cat.lower() in line.lower():
                return cat
    return None


def detect_employment_type(lines):
    for line in lines[:5]:
        l = line.lower()
        if "casual" in l:
            return "Casual"
        if "full-time" in l or "part-time" in l:
            return "Full-time & Part-time"
    return None


def get_lines(page):
    return [l.strip() for l in (page.extract_text() or "").split("\n") if l.strip()]


def extract_all(pdf_path):
    """
    Extract all pay-rate tables grouped by category and employment type.
    """
    results = {}
    state = {"cat": None, "emp": None, "cols": None, "rows": []}

    def flush():
        if state["cat"] and state["rows"]:
            cat = state["cat"]
            emp = state["emp"] or "Unknown"
            if cat not in results:
                results[cat] = {}
            results[cat][emp] = {
                "columns": list(state["cols"] or []),
                "rows": list(state["rows"]),
            }
        state["rows"] = []
        state["cols"] = None

    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            lines = get_lines(page)
            page_num = i + 1

            # Allowances page (last page)
            if lines and "allowances" in lines[0].lower():
                flush()
                for tbl in page.extract_tables():
                    if tbl and len(tbl) > 1 and tbl[0] and len(tbl[0]) == 2:
                        c0 = normalize(tbl[0][0])
                        c1 = normalize(tbl[0][1])
                        rows = [
                            {c0: normalize(r[0]), c1: normalize(r[1])}
                            for r in tbl[1:]
                            if r and normalize(r[0])
                        ]
                        if rows:
                            results["Allowances"] = {"columns": [c0, c1], "rows": rows}
                        break
                continue

            cat = detect_category(lines)
            emp = detect_employment_type(lines)

            if cat:
                flush()
                state["cat"] = cat
                state["emp"] = emp

            if not state["cat"]:
                continue

            main_tables = [t for t in page.extract_tables() if is_main_table(t)]
            if not main_tables:
                continue

            for raw_tbl in main_tables:
                cols, rows = extract_table(raw_tbl)
                if not rows:
                    continue
                key_col = cols[0] if cols else "Classification"
                if state["cols"] is None:
                    state["cols"] = cols
                    state["rows"] = rows
                else:
                    state["rows"] = merge_rows(state["rows"], rows, key_col)
                    state["cols"] = merge_columns(state["cols"], cols)

    flush()
    return results


def main():
    path = UPLOAD_PATH if UPLOAD_PATH.exists() else PDF_PATH
    if not path.exists():
        print(f"PDF not found at {path}", file=sys.stderr)
        sys.exit(1)

    print(f"Reading: {path}")
    data = extract_all(path)

    OUTPUT_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    print(f"Written: {OUTPUT_PATH}")

    for cat, emp_types in data.items():
        if cat == "Allowances":
            print(f"\n  Allowances: {len(emp_types.get('rows', []))} items")
        else:
            for emp, d in emp_types.items():
                print(
                    f"\n  {cat} — {emp}: "
                    f"{len(d.get('rows', []))} classifications, "
                    f"{len(d.get('columns', []))} columns"
                )
    return data


if __name__ == "__main__":
    main()
