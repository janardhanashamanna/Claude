// Query: xw_PaidCategory
// Payroll side of the bridge: the pay-codes money actually landed on, and which
// canonical category each belongs to.
//
// Mapped into the SAME spine as xw_RuleCategory, independently. That is what
// produces the fan-in: several rule categories and one pay-code meet at
// ReconCategoryID rather than being wired to each other. A pay-code rename is a
// one-row edit here and nothing on the rule side moves.
//
// UnitType is the payroll system's unit, which is NOT always hours — a flat
// allowance carries Units = 1. Any code whose UnitType is EACH or DOLLARS must
// be non-reconcilable, or it manufactures a fake hours variance.
let
    Source = #table(
        type table [
            PaidCategoryCode = text,
            PaidCategoryName = text,
            SourceAliases    = text,
            ReconCategoryID  = text,
            UnitType         = text,
            Reconcilable     = logical,
            EffectiveFrom    = date,
            EffectiveTo      = nullable date,
            Notes            = text
        ],
        {
            // ---- Ordinary -------------------------------------------------
            {"ORD",      "Ordinary hours",             "ORDINARY HOURS;BASE;NORM",
             "ORDINARY",            "HOURS",   true,  #date(2000,1,1), null,
             "Base worked hours."},
            {"ORD_SAL",  "Salaried ordinary",          "SALARY;SAL",
             "ORDINARY",            "HOURS",   true,  #date(2000,1,1), null,
             "Annualised staff. Reconcile against FTE x standard period hours from the "
             & "employee master, not against clocked time."},

            // ---- Overtime: the landing zone -------------------------------
            {"OT15",     "Overtime at 1.5x",           "OT1.5;OT 1.5;OTIME15",
             "OVERTIME",            "HOURS",   true,  #date(2000,1,1), null,
             "Receives daily, period, recall and break-breach overtime alike. Aggregate the "
             & "rule side to OVERTIME before comparing, or each trigger reads as a shortfall."},
            {"OT20",     "Overtime at 2.0x",           "OT2.0;OT 2.0;OTIME20",
             "OVERTIME",            "HOURS",   true,  #date(2000,1,1), null,
             "Second-tier and rostered-day-off overtime."},
            {"OT25",     "Overtime at 2.5x",           "OT2.5;OT 2.5",
             "OVERTIME",            "HOURS",   true,  #date(2000,1,1), null,
             "Public holiday overtime, where the client codes it separately."},

            // ---- Penalties ------------------------------------------------
            {"PEN_AFT",  "Afternoon shift loading",    "AFTSHIFT;SHIFT_PM",
             "PENALTY_SHIFT",       "HOURS",   true,  #date(2000,1,1), null,
             "Loading paid on worked shift hours."},
            {"PEN_NGT",  "Night shift loading",        "NGTSHIFT;SHIFT_NIGHT",
             "PENALTY_SHIFT",       "HOURS",   true,  #date(2000,1,1), null,
             "Loading paid on worked shift hours."},
            {"PEN_SAT",  "Saturday loading",           "SAT;SATURDAY",
             "PENALTY_WEEKEND",     "HOURS",   true,  #date(2000,1,1), null,
             "Ordinary weekend hours."},
            {"PEN_SUN",  "Sunday loading",             "SUN;SUNDAY",
             "PENALTY_WEEKEND",     "HOURS",   true,  #date(2000,1,1), null,
             "Ordinary weekend hours."},
            {"PH_WRK",   "Public holiday worked",      "PHWORK;PUBHOL_WORKED",
             "PENALTY_PUBHOL",      "HOURS",   true,  #date(2000,1,1), null,
             "Worked public holiday hours."},
            {"STDBY_HR", "Standby (hourly)",           "STANDBY_HOURS;ONCALL_HR",
             "ONCALL_STANDBY",      "HOURS",   true,  #date(2000,1,1), null,
             "Only reconcilable where T&A records standby hours."},

            // ---- Leave ----------------------------------------------------
            {"AL",       "Annual leave",               "ANNUAL;ANN LEAVE;ANNUAL LEAVE",
             "PAID_LEAVE",          "HOURS",   true,  #date(2000,1,1), null,
             "Paid leave hours. Reconciles to rostered/expected hours."},
            {"PL",       "Personal / sick leave",      "SICK;PERSONAL;CARERS",
             "PAID_LEAVE",          "HOURS",   true,  #date(2000,1,1), null,
             "As above."},
            {"LSL",      "Long service leave",         "LONG SERVICE",
             "PAID_LEAVE",          "HOURS",   true,  #date(2000,1,1), null,
             "As above."},
            {"PH_NWRK",  "Public holiday not worked",  "PHNOTWORKED;PUBHOL",
             "PAID_LEAVE",          "HOURS",   true,  #date(2000,1,1), null,
             "Paid, not worked. Keep separate from PH_WRK."},
            {"LWOP",     "Leave without pay",          "UNPAID;NOPAY",
             "UNPAID_LEAVE",        "HOURS",   true,  #date(2000,1,1), null,
             "Zero-dollar hours. Explains a short period."},
            {"ALLOAD",   "Annual leave loading",       "AL LOADING;LEAVE LOADING;LOADING",
             "LEAVE_LOADING",       "DOLLARS", false, #date(2000,1,1), null,
             "17.5% loading, dollars only. Excluded from the unit recon: the hours it is "
             & "calculated on are already counted under AL."},

            // ---- TOIL -----------------------------------------------------
            {"TOIL_ACC", "TOIL accrued (unpaid)",      "TOILACCRUE;LIEU_ACCRUED",
             "TOIL_ACCRUED",        "HOURS",   true,  #date(2000,1,1), null,
             "Zero-dollar line recording banked hours. If the client records TOIL only in the "
             & "leave system, expect no pay line at all and treat the rule side as structural."},
            {"TOIL_TKN", "TOIL taken",                 "TOILTAKE;LIEU_TAKEN",
             "TOIL_TAKEN",          "HOURS",   true,  #date(2000,1,1), null,
             "Paid absence drawing down the TOIL bank."},

            // ---- Allowances -----------------------------------------------
            {"ALW_TOOL", "Tool allowance",             "TOOL;TOOLALW",
             "ALLOWANCE_HOURLY",    "HOURS",   true,  #date(2000,1,1), null,
             "Paid per hour worked."},
            {"MEAL",     "Meal allowance",             "MEALALW;MEAL_ALLOW",
             "ALLOWANCE_FLAT",      "EACH",    false, #date(2000,1,1), null,
             "Flat amount, Units = occurrence count."},
            {"TRAVEL",   "Travel allowance",           "TRAVELALW;DISTANT",
             "ALLOWANCE_FLAT",      "EACH",    false, #date(2000,1,1), null,
             "Flat amount, Units = occurrence count."},
            {"LAUNDRY",  "Laundry allowance",          "LAUNDRYALW;UNIFORM",
             "ALLOWANCE_FLAT",      "EACH",    false, #date(2000,1,1), null,
             "Flat per-period amount with Units = 1. The classic trap: read as hours it "
             & "produces a variance on every employee, every period."},
            {"STDBY_FL", "Standby allowance (flat)",   "STANDBYALW;ONCALL_FLAT",
             "ALLOWANCE_FLAT",      "EACH",    false, #date(2000,1,1), null,
             "Flat per-shift amount."},

            // ---- Adjustments ----------------------------------------------
            {"BACKPAY",  "Back-pay",                   "RETRO;BACK PAY;ARREARS",
             "BACKPAY_ADJUSTMENT",  "HOURS",   true,  #date(2000,1,1), null,
             "Posted in a later period than worked. Reconcile net across the pair; report gross."},
            {"REVERSAL", "Reversal / correction",      "ADJ;CORRECTION",
             "BACKPAY_ADJUSTMENT",  "HOURS",   true,  #date(2000,1,1), null,
             "Negative units. Preserve sign."},
            {"TERM",     "Termination payment",        "REDUNDANCY;NOTICE;TERMPAY",
             "TERMINATION_PAYMENT", "DOLLARS", false, #date(2000,1,1), null,
             "Dollar-only final payment."}
        })
in
    Source
