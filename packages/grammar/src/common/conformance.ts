const RULE_FAMILY_COUNTS = Object.freeze({
    ACCENT: 5, ACCESSIBILITY: 4, ACTION: 4, BOUNDARY: 5, COLOR: 5,
    "CONTROL-STATE": 4, CTA: 5, FEEDBACK: 4, FIELD: 4, FOCUS: 4,
    FONT: 5, GAP: 5, HIERARCHY: 5, ICON: 6, INTERACTION: 4,
    LAYOUT: 5, MARGIN: 5, MEDIA: 6, MOTION: 4, PADDING: 5,
    "RENDER-TRUTH": 4, RESPONSIVE: 5, SIZING: 5, STATE: 4, SURFACE: 5,
} as const)

export const COMMON_UI_RULE_IDS = Object.freeze(
    Object.entries(RULE_FAMILY_COUNTS).flatMap(([family, count]) =>
        Array.from({ length: count }, (_, index) => `${family}-${index + 1}`),
    ),
)

export type GrammarRuleConformance = {
    readonly familyId: string
    readonly inheritedCommonRules: ReadonlyArray<string>
    readonly familyEvidence: Readonly<Record<string, ReadonlyArray<string>>>
}

/** Machine-checkable family coverage against the canonical knowledge/ui X-n catalog. */
export const defineGrammarRuleConformance = (definition: GrammarRuleConformance) => {
    const inherited = new Set(definition.inheritedCommonRules)
    const evidence = new Set(Object.keys(definition.familyEvidence))
    const missing = COMMON_UI_RULE_IDS.filter((rule) => !inherited.has(rule) && !evidence.has(rule))
    const unknown = [...inherited, ...evidence].filter((rule) => !COMMON_UI_RULE_IDS.includes(rule))
    if (missing.length > 0 || unknown.length > 0) {
        throw new TypeError(`Invalid ${definition.familyId} Grammar conformance: missing=[${missing.join(", ")}], unknown=[${unknown.join(", ")}]`)
    }
    return Object.freeze({
        familyId: definition.familyId,
        inheritedCommonRules: Object.freeze([...definition.inheritedCommonRules]),
        familyEvidence: Object.freeze({ ...definition.familyEvidence }),
    })
}
