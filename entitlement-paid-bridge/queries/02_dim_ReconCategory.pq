// Query: dim_ReconCategory
// The canonical spine. Both sides of the bridge — entitlement rule categories
// and payroll paid categories — map into this one vocabulary, which is what
// makes them comparable.
//
// This is the ONLY place a category is declared reconcilable-to-hours or
// dollar-only. Never set Reconcilable on a mapping row that disagrees with its
// spine category; fnBridgeValidate reports that as a finding.
let
    Source = #table(
        type table [
            ReconCategoryID = text,
            ReconCategory   = text,
            CategoryGroup   = text,
            Reconcilable    = logical,
            UnitBasis       = text,
            SortOrder       = number,
            Notes           = text
        ],
        {
            {"ORDINARY",            "Ordinary",              "Ordinary",   true,  "HOURS",   10,
             "Base worked hours at ordinary rates."},
            {"OVERTIME",            "Overtime",              "Overtime",   true,  "HOURS",   20,
             "All overtime regardless of trigger — daily, period, rest-day, recall, break breach."},
            {"PENALTY_SHIFT",       "Shift Penalty",         "Penalty",    true,  "HOURS",   30,
             "Afternoon/night shift loadings paid on worked hours."},
            {"PENALTY_WEEKEND",     "Weekend Penalty",       "Penalty",    true,  "HOURS",   40,
             "Saturday/Sunday loadings paid on worked hours."},
            {"PENALTY_PUBHOL",      "Public Holiday",        "Penalty",    true,  "HOURS",   50,
             "Worked public holiday. Public holiday NOT worked is PAID_LEAVE."},
            {"ONCALL_STANDBY",      "On-call / Standby",     "Penalty",    true,  "HOURS",   60,
             "Availability hours. Reconcilable only where T&A records standby hours; "
             & "flat per-shift standby is ALLOWANCE_FLAT."},
            {"PAID_LEAVE",          "Paid Leave",            "Leave",      true,  "HOURS",   70,
             "Annual, personal, long service, paid public holiday not worked. Reconciles to "
             & "rostered/expected hours, not to zero worked hours."},
            {"UNPAID_LEAVE",        "Unpaid Leave",          "Leave",      true,  "HOURS",   80,
             "Absence with zero pay units. Explains a short period without being exposure."},
            {"LEAVE_LOADING",       "Leave Loading",         "Leave",      false, "DOLLARS", 90,
             "17.5% loading. Dollar-only: paid against leave already counted in PAID_LEAVE, "
             & "so including it in the unit recon double-counts."},
            {"TOIL_ACCRUED",        "TOIL Accrued",          "Adjustment", true,  "HOURS",  100,
             "Time off in lieu banked instead of paid. Hours worked with no matching pay line — "
             & "map explicitly or it reads as an underpayment."},
            {"TOIL_TAKEN",          "TOIL Taken",            "Adjustment", true,  "HOURS",  110,
             "TOIL drawn down. Pay line with no matching worked hours."},
            {"ALLOWANCE_HOURLY",    "Allowance (hourly)",    "Allowance",  true,  "HOURS",  120,
             "Allowances paid per hour worked (e.g. tool, height). Reconcilable to hours."},
            {"ALLOWANCE_FLAT",      "Allowance (flat)",      "Allowance",  false, "EACH",   130,
             "Flat per-shift/per-period amounts (laundry, meal, travel). Units are a count of 1, "
             & "NOT hours — the classic fake-variance trap."},
            {"BACKPAY_ADJUSTMENT",  "Back-pay / Adjustment", "Adjustment", true,  "HOURS",  140,
             "Corrections and reversals posted to a later period. Preserve sign; reconcile net "
             & "across the adjustment pair, report gross."},
            {"TERMINATION_PAYMENT", "Termination Payment",   "Adjustment", false, "DOLLARS",150,
             "Notice, redundancy, leave payout on termination. Dollar-only, no worked-hours "
             & "equivalent."},
            {"UNMAPPED",            "Unmapped",              "Exception",  false, "HOURS",  999,
             "Sentinel for codes seen in data but absent from the bridge. Always investigate: "
             & "an unmapped code is a mapping defect, never remediation exposure."}
        })
in
    Source
