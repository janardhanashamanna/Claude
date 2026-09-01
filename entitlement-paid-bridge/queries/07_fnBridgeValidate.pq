// Query: fnBridgeValidate
// Integrity checks over the bridge itself. Load the result to the Validation
// group and treat any Error row as blocking: a reconciliation run on a broken
// bridge produces confident, wrong numbers.
//
// Call: fnBridgeValidate(dim_ReconCategory, xw_RuleCategory, xw_PaidCategory,
//                        P_BridgeConfig[BridgeAsAt])
//
// Checks, in order of how badly they corrupt the recon:
//   1. Orphan ReconCategoryID        — mapping points at a category that isn't in the spine
//   2. Duplicate match code          — one literal resolves to 2+ rows; fact rows get duplicated
//   3. Reconcilable disagrees        — mapping row contradicts its spine category
//   4. Non-hours code reconcilable   — an EACH/DOLLARS code inside the hours recon
//   5. Category unreachable          — a spine category only one side can reach
//   6. Inverted effective window     — EffectiveTo before EffectiveFrom
(spine as table, ruleSide as table, paidSide as table, asAt as date) as table =>
let
    SpineIDs = List.Buffer(Table.Column(spine, "ReconCategoryID")),
    SpineRec = Table.Buffer(Table.SelectColumns(spine,
                   {"ReconCategoryID", "Reconcilable", "UnitBasis"})),

    Finding = (severity as text, check as text, sideName as text,
               code as text, detail as text) as record =>
        [Severity = severity, Check = check, Side = sideName, Code = code, Detail = detail],

    // --- 1. orphan ReconCategoryID -----------------------------------------
    OrphansFor = (t as table, codeCol as text, sideName as text) as list =>
        List.Transform(
            Table.ToRecords(Table.SelectRows(t,
                each not List.Contains(SpineIDs, [ReconCategoryID]))),
            (r) => Finding("Error", "Orphan ReconCategoryID", sideName,
                       Record.Field(r, codeCol),
                       "'" & Record.Field(r, "ReconCategoryID")
                       & "' is not a row in dim_ReconCategory.")),

    Orphans = OrphansFor(ruleSide, "RuleCategoryCode", "Rule")
            & OrphansFor(paidSide, "PaidCategoryCode", "Paid"),

    // --- 2. duplicate match codes (code + alias collisions) -----------------
    DupsFor = (t as table, codeCol as text, sideName as text) as list =>
        let
            L = fnBridgeLookup(t, codeCol, asAt),
            G = Table.Group(L, {"MatchCode"}, {
                    {"N",     each Table.RowCount(_), Int64.Type},
                    {"Codes", each Text.Combine(List.Distinct([SourceCode]), ", "), type text}}),
            D = Table.SelectRows(G, each [N] > 1)
        in
            List.Transform(Table.ToRecords(D), (r) =>
                Finding("Error", "Duplicate match code", sideName, r[MatchCode],
                    "Resolves to " & Text.From(r[N]) & " mapping rows (" & r[Codes]
                    & ") at " & Date.ToText(asAt)
                    & ". Every fact row on this code would be duplicated by the join.")),

    Dups = DupsFor(ruleSide, "RuleCategoryCode", "Rule")
         & DupsFor(paidSide, "PaidCategoryCode", "Paid"),

    // --- 3. Reconcilable disagrees with the spine --------------------------
    MismatchFor = (t as table, codeCol as text, sideName as text) as list =>
        let
            J = Table.NestedJoin(t, {"ReconCategoryID"}, SpineRec, {"ReconCategoryID"},
                                 "_s", JoinKind.Inner),
            E = Table.ExpandTableColumn(J, "_s", {"Reconcilable", "UnitBasis"},
                                        {"SpineReconcilable", "SpineUnitBasis"}),
            M = Table.SelectRows(E, each [Reconcilable] <> [SpineReconcilable])
        in
            List.Transform(Table.ToRecords(M), (r) =>
                Finding("Error", "Reconcilable disagrees with spine", sideName,
                    Record.Field(r, codeCol),
                    "Mapping row says " & Text.From(r[Reconcilable]) & " but "
                    & r[ReconCategoryID] & " says " & Text.From(r[SpineReconcilable])
                    & ". dim_ReconCategory is authoritative — fix the mapping row.")),

    Mismatches = MismatchFor(ruleSide, "RuleCategoryCode", "Rule")
               & MismatchFor(paidSide, "PaidCategoryCode", "Paid"),

    // --- 4. non-hours pay-codes inside the unit reconciliation -------------
    UnitConflict =
        List.Transform(
            Table.ToRecords(Table.SelectRows(paidSide, each
                [Reconcilable] = true
                and List.Contains({"EACH", "DOLLARS"}, Text.Upper([UnitType])))),
            (r) => Finding("Error", "Non-hours code marked reconcilable", "Paid",
                       r[PaidCategoryCode],
                       "UnitType is " & r[UnitType]
                       & " but the code is in the hours reconciliation. Units here are "
                       & "amounts or counts, not hours — this manufactures variance on "
                       & "every employee that receives it.")),

    // --- 5. categories only one side can reach -----------------------------
    Live     = (t as table) as list =>
                   List.Distinct(Table.Column(
                       Table.SelectRows(t, each [EffectiveFrom] <= asAt
                           and ([EffectiveTo] = null or [EffectiveTo] >= asAt)),
                       "ReconCategoryID")),
    RuleCats = Live(ruleSide),
    PaidCats = Live(paidSide),

    Unreachable =
        List.Transform(List.Difference(RuleCats, PaidCats), (c) =>
            Finding("Warning", "Category unreachable from paid side", "Rule", c,
                "Rule categories land on '" & c & "' but no pay-code does: the entitlement "
                & "will always present as never paid."))
      & List.Transform(List.Difference(PaidCats, RuleCats), (c) =>
            Finding("Warning", "Category unreachable from rule side", "Paid", c,
                "Pay-codes land on '" & c & "' but no rule category does: the payment "
                & "will always present as never earned.")),

    // --- 6. inverted effective windows -------------------------------------
    WindowFor = (t as table, codeCol as text, sideName as text) as list =>
        List.Transform(
            Table.ToRecords(Table.SelectRows(t, each
                [EffectiveTo] <> null and [EffectiveTo] < [EffectiveFrom])),
            (r) => Finding("Error", "Inverted effective window", sideName,
                       Record.Field(r, codeCol),
                       "EffectiveTo precedes EffectiveFrom; the row can never match.")),

    Windows = WindowFor(ruleSide, "RuleCategoryCode", "Rule")
            & WindowFor(paidSide, "PaidCategoryCode", "Paid"),

    // --- output -------------------------------------------------------------
    Schema = type table [Severity = text, Check = text, Side = text,
                         Code = text, Detail = text],
    All    = Orphans & Dups & Mismatches & UnitConflict & Unreachable & Windows,
    Out    = if List.IsEmpty(All)
             then #table(Schema, {})
             else Table.FromRecords(All, Schema)
in
    Out
