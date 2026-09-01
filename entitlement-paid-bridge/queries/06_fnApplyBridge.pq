// Query: fnApplyBridge
// Attaches ReconCategoryID and Reconcilable to a fact table, from either side of
// the bridge. Generalises fnApplyCrosswalk (payroll-recon-engine m-library) with
// effective dating, alias matching and case/whitespace normalisation.
//
// Usage — the two sides, same function:
//   fnApplyBridge(fct_Entitlement, "RuleCategoryCode", xw_RuleCategory,
//                 "RuleCategoryCode", [PeriodEnd], P_BridgeConfig[UnmappedToken])
//   fnApplyBridge(fct_Pay, "Pay Code", xw_PaidCategory,
//                 "PaidCategoryCode", [PeriodEnd], P_BridgeConfig[UnmappedToken])
//
// Pass the period-end (or work date) as asAt so each row is mapped by the rules
// in force when the work happened, not by today's bridge.
//
// An unrecognised code is tagged UNMAPPED and Reconcilable = false, never
// dropped: it must surface as a Mapping variance and be fixed in the bridge, not
// disappear into a silent row loss.
//
// AFTER calling this, aggregate to EmpKey x PayPeriodID x ReconCategoryID BEFORE
// joining pay to time. Joining at raw code grain double-counts the fan-in — the
// daily and period overtime rows both land on OVERTIME by design.
(fact as table, codeCol as text, side as table, sideCodeCol as text,
 asAt as date, unmappedToken as text) as table =>
let
    Lookup   = Table.Buffer(fnBridgeLookup(side, sideCodeCol, asAt)),

    Normed   = Table.AddColumn(fact, "_MatchCode", each
                   Text.Upper(Text.Trim(Text.From(Record.Field(_, codeCol)))), type text),

    Joined   = Table.NestedJoin(Normed, {"_MatchCode"}, Lookup, {"MatchCode"},
                                "_bridge", JoinKind.LeftOuter),

    Expanded = Table.ExpandTableColumn(Joined, "_bridge",
                   {"SourceCode", "ReconCategoryID", "Reconcilable"},
                   {"BridgeSourceCode", "ReconCategoryID", "Reconcilable"}),

    FillCat  = Table.ReplaceValue(Expanded, null, unmappedToken,
                   Replacer.ReplaceValue, {"ReconCategoryID"}),
    FillRec  = Table.ReplaceValue(FillCat, null, false,
                   Replacer.ReplaceValue, {"Reconcilable"}),

    Cleaned  = Table.RemoveColumns(FillRec, {"_MatchCode"})
in
    Cleaned

// Row count in must equal row count out. If it does not, a MatchCode resolves to
// more than one mapping row and every fact on that code has been duplicated.
// Follow every call with fnJoinAudit(fact, <result>, "<name> bridge") and load
// the result to the Validation group.
