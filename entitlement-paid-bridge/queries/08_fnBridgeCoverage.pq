// Query: fnBridgeCoverage
// Codes present in the actual extracts but absent from the bridge — checked
// BEFORE the reconciliation runs, not discovered afterwards as a pile of
// UNMAPPED variances.
//
// Call once per source:
//   fnBridgeCoverage(stg_Entitlement, "RuleCategoryCode", xw_RuleCategory,
//                    "RuleCategoryCode", P_BridgeConfig[BridgeAsAt], "Hours")
//   fnBridgeCoverage(stg_Pay, "Pay Code", xw_PaidCategory,
//                    "PaidCategoryCode", P_BridgeConfig[BridgeAsAt], "Units")
//
// Returns one row per unmapped code with the rows and units riding on it, worst
// first, so the size of the mapping gap is visible before anyone reads a
// variance number. An empty result is the precondition for a trustworthy run.
//
// The reverse direction — bridge rows never seen in the data — is not an error
// (a seeded vocabulary is deliberately broader than one client), so it is not
// reported here. Check it by eye when trimming the bridge for an engagement.
(fact as table, codeCol as text, side as table, sideCodeCol as text,
 asAt as date, optional unitCol as nullable text) as table =>
let
    Known   = List.Buffer(List.Distinct(Table.Column(
                  fnBridgeLookup(side, sideCodeCol, asAt), "MatchCode"))),

    Normed  = Table.AddColumn(fact, "_MatchCode", each
                  Text.Upper(Text.Trim(Text.From(Record.Field(_, codeCol)))), type text),

    Missing = Table.SelectRows(Normed, each not List.Contains(Known, [_MatchCode])),

    Grouped = if unitCol = null
              then Table.Group(Missing, {"_MatchCode"}, {
                       {"Rows", each Table.RowCount(_), Int64.Type}})
              else Table.Group(Missing, {"_MatchCode"}, {
                       {"Rows",  each Table.RowCount(_), Int64.Type},
                       {"Units", each List.Sum(Table.Column(_, unitCol)), type number}}),

    Renamed = Table.RenameColumns(Grouped, {{"_MatchCode", "UnmappedCode"}}),
    Sorted  = Table.Sort(Renamed, {{"Rows", Order.Descending}})
in
    Sorted
