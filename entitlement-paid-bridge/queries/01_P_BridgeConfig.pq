// Query: P_BridgeConfig
// Engagement parameters for the entitlement-rule <-> paid-category bridge.
// Everything a client would want to change lives here or in the three data
// queries (02-04); the functions (05-07) never need editing.
[
    BridgeVersion   = "1.0",
    BridgeAsAt      = #date(2026, 1, 1),   // default effective date for mapping lookups

    // Column names on the incoming facts, so client renames touch one place.
    RuleCodeCol     = "RuleCategoryCode",
    PaidCodeCol     = "PayCode",

    // Sentinel for a code present in the data but absent from the bridge.
    // Never dropped: it surfaces as a Mapping variance.
    UnmappedToken   = "UNMAPPED",

    // Reconciliation tolerances (methodology skill defaults).
    UnitTolerance   = 0.01,
    DollarTolerance = 0.05,

    // Set to an .xlsx path to maintain the bridge in Excel instead of in the
    // #table literals of queries 02-04. Leave null to use the inline seed.
    // When set, replace each data query's body with:
    //   Excel.Workbook(File.Contents(P_BridgeConfig[BridgeSourcePath]), true)
    //   {[Item = "<SheetName>"]}[Data]
    BridgeSourcePath = null
]
