# Entitlement Rule ↔ Paid Category Bridge

A governed mapping table that lets an award/EA **entitlement rule** result and a
**payroll pay-code** result be reconciled against each other, as Power Query (M)
queries ready to paste into Power BI Desktop.

## The problem it solves

Two systems describe the same event in different vocabularies:

- The **entitlement rule engine** (award interpretation over T&A) emits a *rule
  category* — the reason an entitlement triggered: hours past the daily
  threshold, hours past the fortnightly threshold, work on a rostered day off, a
  short break between shifts.
- **Payroll** emits a *paid category* — the pay-code the money landed on: `OT15`,
  `OT20`, `ORD`.

They never agree one-to-one. The scenario that motivates this:

> An employee works **daily overtime** and **period overtime**. Both are distinct
> entitlement rules with distinct triggers, and both end up paid as **Overtime**.

Compared code-for-code, the daily-overtime rule looks partly unpaid and the
period-overtime rule looks partly unpaid, while the `OT15` pay-code looks
overpaid. All three findings are false. The hours only reconcile once both rules
are summed to a common category first.

## The model: two sides, one spine

Each side maps into a canonical `ReconCategory` **independently**. Nothing wires
a rule category to a pay-code directly.

```
  xw_RuleCategory                dim_ReconCategory              xw_PaidCategory
  ───────────────                ─────────────────              ───────────────
  OT_DAILY_T15   ─┐                                         ┌─  OT15
  OT_DAILY_T20    │                                         │
  OT_PERIOD_T15   ├────────►         OVERTIME        ◄───────┤   OT20
  OT_PERIOD_T20   │                (reconcilable)           │
  OT_RESTDAY      │                                         └─  OT25
  OT_BREAK_BREACH─┘
```

The fan-in falls out of the spine rather than being hand-maintained as pairs, so
a pay-code rename is a one-row edit on one side and nothing on the rule side
moves. The alternative — a flat table of rule/paid pairs — needs 9 rows to say
what the diagram above says in 9 mappings, and every one of them has to be
re-checked when a code changes.

`dim_ReconCategory` is also the **only** place a category is declared
reconcilable-to-hours or dollar-only, which is what keeps flat allowances and
leave loading out of the hours reconciliation.

## Files

Paste into Power BI Desktop's Advanced Editor **in numeric order** — each query
only references lower-numbered ones.

| File | Query | What it is |
|---|---|---|
| `01_P_BridgeConfig.pq` | `P_BridgeConfig` | Parameters: bridge version, effective date, tolerances, source path |
| `02_dim_ReconCategory.pq` | `dim_ReconCategory` | The canonical spine (16 categories) |
| `03_xw_RuleCategory.pq` | `xw_RuleCategory` | Rule side (33 mappings) |
| `04_xw_PaidCategory.pq` | `xw_PaidCategory` | Paid side (27 mappings) |
| `05_fnBridgeLookup.pq` | `fnBridgeLookup` | Effective-dates and alias-expands one side into a lookup |
| `06_fnApplyBridge.pq` | `fnApplyBridge` | Attaches `ReconCategoryID` / `Reconcilable` to a fact |
| `07_fnBridgeValidate.pq` | `fnBridgeValidate` | Integrity checks over the bridge |
| `08_fnBridgeCoverage.pq` | `fnBridgeCoverage` | Codes in the data but missing from the bridge |
| `09_bridge_RulePaidPairs.pq` | `bridge_RulePaidPairs` | Derived rule↔paid pair view for review |
| `10_xw_Bridge_Combined.pq` | `xw_Bridge_Combined` | Flat view for the existing `fnApplyCrosswalk` |

The three data queries (02–04) hold `#table` literals as the editable source of
truth. To hand the bridge to a client as a spreadsheet, set
`P_BridgeConfig[BridgeSourcePath]` and swap each body for an
`Excel.Workbook(...)` read — the functions do not change.

## Using it

```m
// Rule side: map at the work date, so award variations apply from the right day
fct_Entitlement =
    fnApplyBridge(stg_Entitlement, "RuleCategoryCode", xw_RuleCategory,
                  "RuleCategoryCode", [WorkDate], P_BridgeConfig[UnmappedToken])

// Paid side: same function, other table
fct_Pay =
    fnApplyBridge(stg_Pay, "Pay Code", xw_PaidCategory,
                  "PaidCategoryCode", [PayPeriodEnd], P_BridgeConfig[UnmappedToken])
```

Then, and this is the step that makes the fan-in safe:

```m
// Aggregate to the common grain BEFORE joining pay to time
agg_Pay  = fnAggregateToGrain(fct_Pay,  {"EmpKey","PayPeriodID","ReconCategoryID"}, "Units", "Amount")
agg_Time = fnAggregateToGrain(fct_Time, {"EmpKey","PayPeriodID","ReconCategoryID"}, "Hours")
```

Joining at raw code grain double-counts, because several rule rows legitimately
share a landing category. `fnAggregateToGrain`, `fnJoinAudit`, `fnCleanKey` and
`fnEffectiveRate` come from the `payroll-recon-engine` skill's M library; this
bridge is designed to slot into that assembly pattern between steps 3 and 4.

Run both checks before trusting any variance number:

```m
val_BridgeIntegrity = fnBridgeValidate(dim_ReconCategory, xw_RuleCategory,
                                       xw_PaidCategory, P_BridgeConfig[BridgeAsAt])
val_PayCoverage     = fnBridgeCoverage(stg_Pay, "Pay Code", xw_PaidCategory,
                                       "PaidCategoryCode", P_BridgeConfig[BridgeAsAt], "Units")
```

Any `Error` row from `fnBridgeValidate` is blocking. Any row from
`fnBridgeCoverage` is a code the reconciliation will report as `UNMAPPED` — a
mapping defect, never remediation exposure.

## Governance — adding a mapping

1. **Does a spine category already fit?** Almost always yes. Add to
   `dim_ReconCategory` only for a genuinely new *reconciliation concept*, not for
   a new code or a new trigger. Two rules that get paid the same way share a
   category; that is the point.
2. **Add the row to the side that emitted the code**, never to both.
3. **Set `Reconcilable` to match the spine category.** The spine is
   authoritative; a mapping row that disagrees is an error, not an override.
4. **Put the client's literal spellings in `SourceAliases`**, semicolon
   delimited, rather than creating near-duplicate codes. `OT1.5`, `OT 1.5` and
   `OTIME15` are one concept.
5. **Never edit `bridge_RulePaidPairs`** — it is derived.
6. **Re-map, don't overwrite.** When an award variation changes where a code
   lands, close the existing row with an `EffectiveTo` and add a new one. Editing
   in place silently rewrites history for periods already reconciled.
7. Bump `BridgeVersion` and re-run `fnBridgeValidate`.

## Traps this encodes

- **Flat allowances are not hours.** `LAUNDRY`, `MEAL`, `TRAVEL` and flat standby
  carry `Units = 1` per period. Read as hours they produce a variance on every
  employee, every period. They are `EACH`, non-reconcilable, and
  `fnBridgeValidate` rejects any non-hours code marked reconcilable.
- **Leave loading double-counts.** `ALLOAD` is calculated on hours already
  counted under paid leave, so it is dollar-only.
- **Public holiday worked ≠ public holiday not worked.** Separate categories;
  conflating them shows up as a whole-day variance.
- **TOIL breaks the symmetry.** Accrued TOIL is worked hours with no pay line;
  taken TOIL is a pay line with no worked hours. Both are mapped explicitly, or
  each reads as exposure.
- **Back-pay belongs to the period worked.** Mapped to `BACKPAY_ADJUSTMENT` with
  sign preserved, to be netted across the adjustment pair.
- **Minimum engagement and call-out guarantees** legitimately pay more hours than
  were worked. Flagged in the notes so the positive variance is read as
  structural.
- **`OT_GENERIC`** exists for T&A systems that emit undifferentiated overtime. It
  reconciles correctly but cannot split daily from period — worth raising with
  the client when the trigger matters to the remediation.

## Assumptions

- **Grain:** `EmpKey × PayPeriodID × ReconCategoryID`. Both sides aggregate to
  this before comparison.
- **Bridge version:** 1.0 — 16 spine categories, 33 rule mappings, 27 paid
  mappings, 83 rule↔paid pairs.
- **Effective dating:** all mapping rows open from 2000-01-01, `EffectiveTo` null.
  Resolved at the row's own work/period date via `fnApplyBridge`;
  `bridge_RulePaidPairs` and `xw_Bridge_Combined` resolve at
  `P_BridgeConfig[BridgeAsAt]` (default 2026-01-01).
- **Tolerances:** ±0.01 hr units, ±$0.05 dollars — carried in `P_BridgeConfig`,
  not applied by these queries.
- **Seed scope:** award-agnostic starter vocabulary. Client pay-codes and rule
  codes are added per engagement; nothing here is specific to one award or one
  payroll system.
- **Excluded from the unit reconciliation:** `LEAVE_LOADING`, `ALLOWANCE_FLAT`,
  `TERMINATION_PAYMENT`, `UNMAPPED` — dollar-only or exception categories, kept
  visible in dollars.
- **Not covered here:** the reconciliation measures, variance classification and
  exception register. Those are the `payroll-recon-engine` DAX library and the
  methodology skill's exception-report layout; this is step 3 of that method.
