// Query: xw_Bridge_Combined
// Compatibility view. Flattens both sides of the bridge into the
// PayCode / ReconCategory / Reconcilable / Notes shape that the
// payroll-recon-engine library's fnApplyCrosswalk expects, so an existing recon
// model built to that assembly pattern picks the bridge up without any
// downstream change.
//
// Prefer fnApplyBridge for new work — it keeps the two sides distinct and maps
// at the row's own work date. This view resolves everything at one BridgeAsAt.
//
// Codes and aliases are included, so the client's literal strings resolve. Where
// both sides use the same literal (PEN_SAT appears on both, as do plain-English
// aliases like "ANNUAL LEAVE"), the rows collapse to one as long as they agree.
// Where they disagree the row is kept and flagged Conflict = true rather than
// silently picked — a disagreement is a bridge defect, not a tie to break.
let
    AsAt  = P_BridgeConfig[BridgeAsAt],

    RuleL = Table.AddColumn(fnBridgeLookup(xw_RuleCategory, "RuleCategoryCode", AsAt),
                "Side", each "Rule", type text),
    PaidL = Table.AddColumn(fnBridgeLookup(xw_PaidCategory, "PaidCategoryCode", AsAt),
                "Side", each "Paid", type text),
    Both  = Table.Combine({RuleL, PaidL}),

    WithSpine = Table.ExpandTableColumn(
                    Table.NestedJoin(Both, {"ReconCategoryID"}, dim_ReconCategory,
                                     {"ReconCategoryID"}, "_s", JoinKind.LeftOuter),
                    "_s", {"ReconCategory", "CategoryGroup"}),

    Renamed = Table.RenameColumns(WithSpine, {{"MatchCode", "PayCode"}}),

    // Collapse identical mappings arriving from both sides.
    Slim    = Table.Distinct(Table.SelectColumns(Renamed,
                  {"PayCode", "ReconCategoryID", "ReconCategory", "CategoryGroup",
                   "Reconcilable"})),

    Counts  = Table.Group(Slim, {"PayCode"},
                  {{"N", each Table.RowCount(_), Int64.Type}}),

    WithN   = Table.ExpandTableColumn(
                  Table.NestedJoin(Slim, {"PayCode"}, Counts, {"PayCode"},
                                   "_c", JoinKind.LeftOuter),
                  "_c", {"N"}),

    Flagged = Table.AddColumn(WithN, "Conflict", each [N] > 1, type logical),

    Noted   = Table.AddColumn(Flagged, "Notes", each
                  if [Conflict]
                  then "CONFLICT: this literal maps to more than one category — "
                       & "fix in xw_RuleCategory / xw_PaidCategory before running the recon."
                  else [CategoryGroup] & " / " & [ReconCategoryID], type text),

    Out     = Table.Sort(
                  Table.SelectColumns(Noted,
                      {"PayCode", "ReconCategory", "Reconcilable", "Notes",
                       "ReconCategoryID", "CategoryGroup", "Conflict"}),
                  {{"PayCode", Order.Ascending}})
in
    Out
