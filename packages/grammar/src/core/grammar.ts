import { CORE_NEUTRAL_TREATMENTS, PRESENTATION_STATES } from "./state.js"
import { CORE_RULES } from "./rules.js"
export type CoreGrammar = Readonly<{
    id: "core"
    version: "2.0.0"
    presentationStates: typeof PRESENTATION_STATES
    treatments: typeof CORE_NEUTRAL_TREATMENTS
    rules: typeof CORE_RULES
}>
export const coreGrammar: CoreGrammar = Object.freeze({
    id: "core", version: "2.0.0", presentationStates: PRESENTATION_STATES,
    treatments: CORE_NEUTRAL_TREATMENTS, rules: CORE_RULES,
})
