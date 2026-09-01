// Query: xw_RuleCategory
// Entitlement-rule side of the bridge: what the award/EA interpretation engine
// emitted, and which canonical category it lands on.
//
// RuleBasis records WHY the rule fired; ReconCategoryID records WHERE it lands.
// The two are deliberately independent — daily overtime and period overtime are
// different triggers that both land on OVERTIME, which is exactly the fan-in the
// reconciliation needs.
//
// SourceAliases holds the literal strings the client's system actually emits for
// this concept (semicolon-delimited, matched case-insensitively). One governed
// row per concept, however many spellings the source uses.
//
// Effective-dated: award variations re-map rules over time, so each row carries
// a validity window and is resolved at the work/period date. EffectiveTo = null
// means open-ended.
//
// Multiplier is documentation of the rule's rate treatment, not a driver of the
// unit reconciliation — units reconcile at 1:1 hours regardless of penalty rate.
let
    Source = #table(
        type table [
            RuleCategoryCode = text,
            RuleCategoryName = text,
            SourceAliases    = text,
            ReconCategoryID  = text,
            RuleBasis        = text,
            Multiplier       = number,
            Reconcilable     = logical,
            EffectiveFrom    = date,
            EffectiveTo      = nullable date,
            MapConfidence    = text,
            Notes            = text
        ],
        {
            // ---- Ordinary -------------------------------------------------
            {"ORD_STD",          "Ordinary hours worked",             "Ordinary;Normal;Base",
             "ORDINARY",           "DAILY",  1.0,   true,  #date(2000,1,1), null, "High",
             "Worked hours within the daily and period ordinary thresholds."},
            {"ORD_MIN_ENGAGE",   "Minimum engagement top-up",         "Minimum Engagement;Min Shift",
             "ORDINARY",           "EVENT",  1.0,   true,  #date(2000,1,1), null, "Medium",
             "Hours paid to reach the minimum shift length but not physically worked. "
             & "Expect a positive pay-vs-time variance here; it is structural, not exposure."},

            // ---- Overtime: the fan-in -------------------------------------
            {"OT_DAILY_T15",     "Daily overtime - first tier",       "Daily OT;OT Daily 1.5",
             "OVERTIME",           "DAILY",  1.5,   true,  #date(2000,1,1), null, "High",
             "Hours past the daily ordinary threshold, first tier (commonly first 2 or 3 hours)."},
            {"OT_DAILY_T20",     "Daily overtime - second tier",      "Daily OT 2.0;OT Daily 2.0",
             "OVERTIME",           "DAILY",  2.0,   true,  #date(2000,1,1), null, "High",
             "Hours past the daily first-tier threshold."},
            {"OT_PERIOD_T15",    "Period overtime - first tier",      "Period OT;Weekly OT;OT Period 1.5",
             "OVERTIME",           "PERIOD", 1.5,   true,  #date(2000,1,1), null, "High",
             "Hours past the weekly/fortnightly ordinary threshold. Lands on the same paid "
             & "category as daily overtime — the two must be netted before comparison, never "
             & "reconciled against separate pay-codes."},
            {"OT_PERIOD_T20",    "Period overtime - second tier",     "Period OT 2.0;Weekly OT 2.0",
             "OVERTIME",           "PERIOD", 2.0,   true,  #date(2000,1,1), null, "High",
             "Hours past the period first-tier threshold."},
            {"OT_GENERIC",       "Overtime (trigger not identified)", "Overtime;OT",
             "OVERTIME",           "EVENT",  1.5,   true,  #date(2000,1,1), null, "Low",
             "For T&A systems that emit undifferentiated overtime. Lands on OVERTIME like the "
             & "rest, so the reconciliation still works, but daily-vs-period cannot be split — "
             & "raise with the client if the trigger matters to the remediation."},
            {"OT_RESTDAY",       "Work on a rostered day off",        "RDO Worked;Day Off Worked",
             "OVERTIME",           "EVENT",  2.0,   true,  #date(2000,1,1), null, "High",
             "All hours worked on a non-rostered day."},
            {"OT_RECALL",        "Recall to work / call-out",         "Call Out;Recall;Callback",
             "OVERTIME",           "EVENT",  2.0,   true,  #date(2000,1,1), null, "Medium",
             "Call-back after finishing a shift, usually with a minimum-hours guarantee. Paid "
             & "hours can exceed worked hours by the guarantee."},
            {"OT_BREAK_BREACH",  "Insufficient break between shifts", "Break Breach;Short Break;Fatigue Penalty",
             "OVERTIME",           "EVENT",  2.0,   true,  #date(2000,1,1), null, "Medium",
             "Penalty hours where the rest break between shifts fell short. Paid at overtime "
             & "rates on hours already worked — verify the client does not double-count."},
            {"OT_PUBHOL",        "Overtime on a public holiday",      "PH Overtime;Public Holiday OT",
             "OVERTIME",           "EVENT",  2.5,   true,  #date(2000,1,1), null, "Medium",
             "Overtime hours falling on a public holiday. Splits differently by award: some "
             & "clients code these to the public-holiday pay-code instead — check before mapping."},

            // ---- Penalties ------------------------------------------------
            {"PEN_AFTERNOON",    "Afternoon shift loading",           "Afternoon Shift;PM Shift",
             "PENALTY_SHIFT",      "SHIFT",  1.15,  true,  #date(2000,1,1), null, "High",
             "Shift qualifying for the afternoon loading."},
            {"PEN_NIGHT",        "Night shift loading",               "Night Shift;Nightshift",
             "PENALTY_SHIFT",      "SHIFT",  1.30,  true,  #date(2000,1,1), null, "High",
             "Shift qualifying for the night loading."},
            {"PEN_SAT",          "Saturday penalty",                  "Saturday;Sat",
             "PENALTY_WEEKEND",    "DAILY",  1.5,   true,  #date(2000,1,1), null, "High",
             "Ordinary hours worked on a Saturday."},
            {"PEN_SUN",          "Sunday penalty",                    "Sunday;Sun",
             "PENALTY_WEEKEND",    "DAILY",  2.0,   true,  #date(2000,1,1), null, "High",
             "Ordinary hours worked on a Sunday."},
            {"PEN_PUBHOL_WORKED","Public holiday worked",             "Public Holiday Worked;PH Worked",
             "PENALTY_PUBHOL",     "DAILY",  2.5,   true,  #date(2000,1,1), null, "High",
             "Hours worked on a gazetted public holiday."},
            {"STANDBY_HOURLY",   "On-call / standby (hourly)",        "Standby;On Call",
             "ONCALL_STANDBY",     "SHIFT",  0.5,   true,  #date(2000,1,1), null, "Medium",
             "Availability paid per hour. Where the client pays a flat per-shift standby amount, "
             & "map to ALW_STANDBY_FLAT instead."},

            // ---- Leave ----------------------------------------------------
            {"LV_ANNUAL",        "Annual leave taken",                "Annual Leave;AL;Holiday",
             "PAID_LEAVE",         "DAILY",  1.0,   true,  #date(2000,1,1), null, "High",
             "Reconciles to rostered/expected hours for the day, not to zero worked hours."},
            {"LV_PERSONAL",      "Personal / carer's leave taken",    "Personal Leave;Sick Leave;Carers Leave",
             "PAID_LEAVE",         "DAILY",  1.0,   true,  #date(2000,1,1), null, "High",
             "As above."},
            {"LV_LSL",           "Long service leave taken",          "Long Service Leave;LSL",
             "PAID_LEAVE",         "DAILY",  1.0,   true,  #date(2000,1,1), null, "High",
             "As above."},
            {"LV_PUBHOL_NOTWORKED","Public holiday not worked",       "Public Holiday;PH Not Worked",
             "PAID_LEAVE",         "DAILY",  1.0,   true,  #date(2000,1,1), null, "High",
             "Paid but not worked. Distinct from PEN_PUBHOL_WORKED — conflating them is a "
             & "common source of a whole-day variance."},
            {"LV_UNPAID",        "Unpaid leave",                      "Unpaid Leave;LWOP",
             "UNPAID_LEAVE",       "DAILY",  0.0,   true,  #date(2000,1,1), null, "High",
             "Zero pay units. Explains a short period without being exposure."},
            {"LV_LOADING",       "Annual leave loading entitlement",  "Leave Loading;AL Loading",
             "LEAVE_LOADING",      "EVENT",  0.175, false, #date(2000,1,1), null, "High",
             "Dollar-only. Excluded from the unit reconciliation — the underlying hours are "
             & "already counted under PAID_LEAVE."},

            // ---- TOIL -----------------------------------------------------
            {"TOIL_ACCRUE",      "TOIL accrued in lieu of overtime",  "TOIL Accrued;Time in Lieu Accrued",
             "TOIL_ACCRUED",       "EVENT",  1.0,   true,  #date(2000,1,1), null, "Medium",
             "Overtime banked rather than paid: worked hours with no pay line. Without this "
             & "mapping it reads as an underpayment."},
            {"TOIL_TAKE",        "TOIL taken",                        "TOIL Taken;Time in Lieu Taken",
             "TOIL_TAKEN",         "DAILY",  1.0,   true,  #date(2000,1,1), null, "Medium",
             "TOIL drawn down: a paid absence with no worked hours."},

            // ---- Allowances -----------------------------------------------
            {"ALW_TOOL_HOURLY",  "Tool allowance (per hour)",         "Tool Allowance;Height Allowance",
             "ALLOWANCE_HOURLY",   "DAILY",  1.0,   true,  #date(2000,1,1), null, "Medium",
             "Paid per hour worked, so it reconciles to hours."},
            {"ALW_MEAL",         "Meal allowance",                    "Meal Allowance;Meal",
             "ALLOWANCE_FLAT",     "EVENT",  1.0,   false, #date(2000,1,1), null, "High",
             "Flat amount per qualifying occasion. Units are a count, not hours."},
            {"ALW_TRAVEL",       "Travel / distant engagement",       "Travel Allowance;Distant Engagement",
             "ALLOWANCE_FLAT",     "EVENT",  1.0,   false, #date(2000,1,1), null, "High",
             "Flat amount. Where the award pays distant-engagement HOURS at overtime rates, "
             & "map those hours to OT_RESTDAY instead and keep only the flat amount here."},
            {"ALW_LAUNDRY",      "Laundry / uniform allowance",       "Laundry;Uniform Allowance",
             "ALLOWANCE_FLAT",     "PERIOD", 1.0,   false, #date(2000,1,1), null, "High",
             "Flat per-period amount, units = 1. Including it in the unit recon manufactures a "
             & "large fake variance."},
            {"ALW_STANDBY_FLAT", "Standby allowance (flat)",          "Standby Allowance",
             "ALLOWANCE_FLAT",     "SHIFT",  1.0,   false, #date(2000,1,1), null, "Medium",
             "Flat per-shift availability amount."},

            // ---- Adjustments ----------------------------------------------
            {"ADJ_BACKPAY",      "Back-pay for a prior period",       "Back Pay;Backpay;Retro",
             "BACKPAY_ADJUSTMENT", "PERIOD", 1.0,   true,  #date(2000,1,1), null, "Medium",
             "Belongs to the period WORKED, not the period paid. Reconcile net across the pair "
             & "or it presents as offsetting timing variances."},
            {"ADJ_REVERSAL",     "Correction / reversal",             "Reversal;Correction",
             "BACKPAY_ADJUSTMENT", "PERIOD", -1.0,  true,  #date(2000,1,1), null, "Medium",
             "Negative units. Preserve sign."},
            {"TERM_PAYOUT",      "Termination payout",                "Termination;Redundancy;Notice",
             "TERMINATION_PAYMENT","EVENT",  1.0,   false, #date(2000,1,1), null, "High",
             "Dollar-only. Exclude the terminating employee's final period from unit exposure "
             & "totals or proration reads as underpayment."}
        })
in
    Source
