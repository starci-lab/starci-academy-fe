import type { GrammarContract } from "../common/index.js"
import {
    CORE_COMPONENT_CONTRACTS,
    markdownArticleContract,
    railContract,
    surfaceAccordionCardContract,
    surfaceCardContract,
    surfaceListCardContract,
    visualTreatmentContract,
} from "./contracts.js"
import { CORE_RULES } from "./rules.js"
import { CORE_NEUTRAL_TREATMENTS, PRESENTATION_STATES } from "./state.js"

export type CoreGrammar = Readonly<{
    id: "core"
    version: "1.4.0"
    extends: ReadonlyArray<string>
    presentationStates: typeof PRESENTATION_STATES
    treatments: typeof CORE_NEUTRAL_TREATMENTS
    contracts: typeof CORE_COMPONENT_CONTRACTS
    contractList: ReadonlyArray<GrammarContract>
    rules: typeof CORE_RULES
    invariants: ReadonlyArray<string>
}>

/** Business-neutral default Grammar assembled entirely from common-kernel contracts. */
export const coreGrammar: CoreGrammar = Object.freeze({
    id: "core",
    version: "1.4.0",
    extends: Object.freeze([]),
    presentationStates: PRESENTATION_STATES,
    treatments: CORE_NEUTRAL_TREATMENTS,
    contracts: CORE_COMPONENT_CONTRACTS,
    contractList: Object.freeze([
        surfaceCardContract,
        surfaceListCardContract,
        surfaceAccordionCardContract,
        markdownArticleContract,
        railContract,
        visualTreatmentContract,
    ]),
    rules: CORE_RULES,
    invariants: Object.freeze([
        "business-neutral",
        "closed-public-props",
        "no-caller-class-name",
        "no-anatomy-changing-extension",
        "container-owned-responsive-behavior",
    ]),
})
