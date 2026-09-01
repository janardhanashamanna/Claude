// Query: fnBridgeLookup
// Turns one side of the bridge into a flat lookup: one row per literal string
// that should resolve to a mapping, at a given effective date.
//
// Two jobs:
//   1. Effective dating — only mapping rows valid at asAt survive, so a mid-year
//      award variation cannot retro-apply to earlier periods. Same treatment
//      fnEffectiveRate gives the employee master.
//   2. Alias expansion — the governed code plus every string in SourceAliases
//      becomes a MatchCode, upper-cased and trimmed, so the client's actual
//      literals resolve without polluting the vocabulary with near-duplicates.
//
// Returns: MatchCode, SourceCode, ReconCategoryID, Reconcilable.
// Duplicate MatchCodes are NOT resolved here — fnBridgeValidate reports them,
// because silently picking one is how a mapping defect becomes invisible.
(side as table, codeCol as text, asAt as date) as table =>
let
    Effective = Table.SelectRows(side, each
                    [EffectiveFrom] <= asAt
                    and ([EffectiveTo] = null or [EffectiveTo] >= asAt)),

    WithKeys  = Table.AddColumn(Effective, "MatchCode", (r) =>
        let
            Own      = Text.Upper(Text.Trim(Text.From(Record.Field(r, codeCol)))),
            RawAlias = Record.FieldOrDefault(r, "SourceAliases", ""),
            Aliases  = if RawAlias = null or RawAlias = ""
                       then {}
                       else List.Transform(Text.Split(RawAlias, ";"),
                                           each Text.Upper(Text.Trim(_)))
        in
            List.Distinct(List.Select({Own} & Aliases, each _ <> ""))),

    Expanded  = Table.ExpandListColumn(WithKeys, "MatchCode"),
    Renamed   = Table.RenameColumns(Expanded, {{codeCol, "SourceCode"}}),
    Kept      = Table.SelectColumns(Renamed,
                    {"MatchCode", "SourceCode", "ReconCategoryID", "Reconcilable"}),
    Typed     = Table.TransformColumnTypes(Kept, {
                    {"MatchCode", type text}, {"SourceCode", type text},
                    {"ReconCategoryID", type text}, {"Reconcilable", type logical}})
in
    Typed
