// Query: bridge_RulePaidPairs
// The human-readable face of the bridge: every entitlement rule category paired
// with every paid category it can legitimately land on, derived by meeting at
// ReconCategoryID.
//
// DERIVED — never hand-edit. To change a pairing, change which spine category a
// side maps to in xw_RuleCategory or xw_PaidCategory and this follows.
//
// Nothing in the reconciliation consumes this; it exists so a client or auditor
// can see the fan-in. RuleFanIn is the count of rule categories sharing the
// landing category, which is the number that explains why the sides cannot be
// compared code-for-code: OT_DAILY_T15 and OT_PERIOD_T15 both pair with OT15,
// so their hours must be summed to OVERTIME before any comparison.
let
    AsAt = P_BridgeConfig[BridgeAsAt],

    EffectiveRows = (t as table) as table =>
        Table.SelectRows(t, each [EffectiveFrom] <= AsAt
            and ([EffectiveTo] = null or [EffectiveTo] >= AsAt)),

    R = Table.SelectColumns(EffectiveRows(xw_RuleCategory),
            {"RuleCategoryCode", "RuleCategoryName", "RuleBasis", "Multiplier",
             "ReconCategoryID"}),
    P = Table.SelectColumns(EffectiveRows(xw_PaidCategory),
            {"PaidCategoryCode", "PaidCategoryName", "UnitType", "ReconCategoryID"}),

    Paired = Table.ExpandTableColumn(
                 Table.NestedJoin(R, {"ReconCategoryID"}, P, {"ReconCategoryID"},
                                  "_p", JoinKind.Inner),
                 "_p", {"PaidCategoryCode", "PaidCategoryName", "UnitType"}),

    WithSpine = Table.ExpandTableColumn(
                    Table.NestedJoin(Paired, {"ReconCategoryID"}, dim_ReconCategory,
                                     {"ReconCategoryID"}, "_s", JoinKind.LeftOuter),
                    "_s", {"ReconCategory", "CategoryGroup", "Reconcilable", "SortOrder"}),

    FanIn = Table.Group(R, {"ReconCategoryID"},
                {{"RuleFanIn", each Table.RowCount(_), Int64.Type}}),

    WithFanIn = Table.ExpandTableColumn(
                    Table.NestedJoin(WithSpine, {"ReconCategoryID"}, FanIn,
                                     {"ReconCategoryID"}, "_f", JoinKind.LeftOuter),
                    "_f", {"RuleFanIn"}),

    Ordered = Table.ReorderColumns(WithFanIn,
                  {"ReconCategoryID", "ReconCategory", "CategoryGroup", "Reconcilable",
                   "RuleCategoryCode", "RuleCategoryName", "RuleBasis", "Multiplier",
                   "PaidCategoryCode", "PaidCategoryName", "UnitType",
                   "RuleFanIn", "SortOrder"}),

    Sorted  = Table.Sort(Ordered, {{"SortOrder", Order.Ascending},
                                   {"RuleCategoryCode", Order.Ascending},
                                   {"PaidCategoryCode", Order.Ascending}}),

    Final   = Table.RemoveColumns(Sorted, {"SortOrder"})
in
    Final
