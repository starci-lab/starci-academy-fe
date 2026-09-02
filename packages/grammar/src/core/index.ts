"use client"

import {
    COMMON_GRAMMAR_COMPONENTS,
    COMMON_UI_RULE_IDS,
    defineGrammarFamily,
    defineGrammarRuleConformance,
    type GrammarComponentRenderer,
    type GrammarRootProps,
} from "../common/index.js"
import { createElement } from "react"

export type { PresentationState } from "./state.js"
export {
    STARCI_CORE_DARK_TOKEN_DEFAULTS,
    STARCI_CORE_DNA,
    STARCI_CORE_SPACING_SCALE,
    STARCI_CORE_TOKEN_DEFAULTS,
    STARCI_CORE_TOKEN_NAMES,
    type StarCiCoreDna,
    type StarCiCoreSpacingStep,
    type StarCiCoreSpacingValue,
    type StarCiCoreTokenDefaults,
    type StarCiCoreTokenName,
} from "./dna.js"

/** @deprecated Use COMMON_GRAMMAR_COMPONENTS from `@starci/grammar/common`. */
export const CORE_GRAMMAR_COMPONENTS = COMMON_GRAMMAR_COMPONENTS

export type CoreGrammarComponentName = keyof typeof CORE_GRAMMAR_COMPONENTS

/** StarCi Core is one visual family implementing the Common contract. */
const CoreGrammarRootRenderer: GrammarComponentRenderer<GrammarRootProps> = (props) => {
    const CommonGrammarRoot = COMMON_GRAMMAR_COMPONENTS.GrammarRoot
    return createElement(CommonGrammarRoot, { ...props, "data-grammar-family": "core" })
}

export const coreGrammar = defineGrammarFamily({
    id: "core",
    styles: {
        entrypoint: "@starci/grammar/core/styles.css",
        scope: { attribute: "data-grammar-family", value: "core" },
    },
    components: { replacements: { GrammarRoot: CoreGrammarRootRenderer }, extensions: {} },
})

export const CoreGrammarRoot = coreGrammar.components.GrammarRoot

export const coreRuleConformance = defineGrammarRuleConformance({
    familyId: "core",
    inheritedCommonRules: COMMON_UI_RULE_IDS,
    familyEvidence: {},
})

// Compatibility re-exports; Common is the canonical family-base authority.
export { defineGrammarFamily }
export type {
    GrammarComponentRenderer,
    GrammarFamilyContract,
    GrammarFamilyStyles,
} from "../common/index.js"
