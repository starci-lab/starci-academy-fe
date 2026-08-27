import {
    defineGrammarContract,
    type GrammarContract,
    type GrammarContractSpec,
} from "../common/index.js"
import { PRESENTATION_STATES } from "./state.js"

const CLOSED_EXTENSION_BOUNDARIES = [
    "anatomy",
    "closed-invariant",
    "owner-substitution",
] as const

const surfaceCardSpec = {
    version: "1.1.0",
    layer: "branch",
    slots: ["external-label", "content", "whole-action"],
    stateInputs: PRESENTATION_STATES,
    variableAxes: [
        "surface-depth",
        "state-treatment",
        "action-mode",
        "label-end",
        "frame-mode",
        "scroll-mode",
        "container-response",
    ],
    extensionPolicy: {
        allowedAxes: [
            "surface-depth",
            "state-treatment",
            "label-end",
            "frame-mode",
            "scroll-mode",
            "container-response",
        ],
        forbiddenChanges: CLOSED_EXTENSION_BOUNDARIES,
    },
    closedInvariants: [
        "label-outside-surface",
        "nested-border-xor-shadow",
        "one-content-owner",
        "whole-action-is-overlay",
        "frameless-has-no-surface-shell",
        "contained-scroll-has-one-scroll-owner",
        "neutral-state-only",
    ],
} as const satisfies GrammarContractSpec

const surfaceListCardSpec = {
    version: "1.2.0",
    layer: "branch",
    slots: ["external-label", "single-list-shell", "single-collection-shell", "static-row", "interactive-row", "footer"],
    stateInputs: PRESENTATION_STATES,
    variableAxes: [
        "surface-depth",
        "state-treatment",
        "row-count",
        "row-mode",
        "label-visibility",
        "footer-mode",
        "container-response",
    ],
    extensionPolicy: {
        allowedAxes: [
            "surface-depth",
            "state-treatment",
            "row-mode",
            "label-visibility",
            "footer-mode",
            "container-response",
        ],
        forbiddenChanges: CLOSED_EXTENSION_BOUNDARIES,
    },
    closedInvariants: [
        "one-list-one-shell",
        "one-collection-one-shell",
        "fills-content-owner",
        "row-separators-full-bleed",
        "row-content-owns-inset",
        "affirmative-row-uses-one-check",
        "nested-border-xor-shadow",
        "static-rows-have-no-action",
        "static-row-hover-invariant",
        "interactive-rows-own-their-actions",
        "hidden-label-retains-accessible-name",
        "footer-follows-collection",
        "neutral-state-only",
    ],
} as const satisfies GrammarContractSpec

const markdownArticleSpec = {
    version: "1.0.0",
    layer: "branch",
    slots: [
        "semantic-content",
        "heading",
        "paragraph",
        "ordered-list",
        "unordered-list",
        "inline-code-chip",
        "fenced-code-block",
        "blockquote",
        "table",
        "link",
        "code-action",
    ],
    stateInputs: PRESENTATION_STATES,
    variableAxes: ["content-measure", "container-response"],
    extensionPolicy: {
        allowedAxes: ["content-measure", "container-response"],
        forbiddenChanges: CLOSED_EXTENSION_BOUNDARIES,
    },
    closedInvariants: [
        "semantic-markdown-retained",
        "body-copy-fourteen-pixels",
        "inline-code-uses-neutral-chip-treatment",
        "fenced-code-has-bounded-overflow",
        "table-has-bounded-overflow",
        "blockquote-remains-distinct",
        "links-retain-destination-semantics",
        "business-content-is-not-transformed",
        "neutral-state-only",
    ],
} as const satisfies GrammarContractSpec

const surfaceAccordionCardSpec = {
    version: "1.0.0",
    layer: "branch",
    slots: ["single-disclosure-shell", "disclosure-row", "summary-trigger", "body-panel"],
    stateInputs: PRESENTATION_STATES,
    variableAxes: [
        "surface-depth",
        "row-count",
        "disclosure-state",
        "container-response",
    ],
    extensionPolicy: {
        allowedAxes: [
            "surface-depth",
            "row-count",
            "disclosure-state",
            "container-response",
        ],
        forbiddenChanges: CLOSED_EXTENSION_BOUNDARIES,
    },
    closedInvariants: [
        "one-disclosure-one-shell",
        "fills-content-owner",
        "row-separators-full-bleed",
        "row-content-owns-inset",
        "nested-border-xor-shadow",
        "neutral-trigger-hover-invariant",
        "open-closed-only-presentation-state",
        "keyboard-operable-trigger",
        "neutral-state-only",
    ],
} as const satisfies GrammarContractSpec

const railSpec = {
    version: "1.1.0",
    layer: "branch",
    slots: ["heading", "body", "footer", "content-landmark"],
    stateInputs: PRESENTATION_STATES,
    variableAxes: [
        "landmark-mode",
        "rail-mode",
        "rail-width",
        "collapse-mode",
        "motion-mode",
        "state-treatment",
        "container-response",
    ],
    extensionPolicy: {
        allowedAxes: [
            "landmark-mode",
            "rail-width",
            "collapse-mode",
            "motion-mode",
            "state-treatment",
            "container-response",
        ],
        forbiddenChanges: CLOSED_EXTENSION_BOUNDARIES,
    },
    closedInvariants: [
        "one-rail-landmark",
        "sticky-disabled-on-narrow-viewport",
        "body-remains-reachable",
        "footer-follows-body",
        "content-landmark-is-not-wrapped-by-a-second-landmark",
        "collapsed-navigation-retains-accessible-names",
        "reduced-motion-removes-interpolation-not-state-change",
        "neutral-state-only",
    ],
} as const satisfies GrammarContractSpec

const visualTreatmentSpec = {
    version: "1.0.0",
    layer: "composites",
    slots: ["field", "surface", "display-copy", "floating-cluster"],
    stateInputs: PRESENTATION_STATES,
    variableAxes: ["palette", "display-type", "outline-shadow", "floating-composition", "motion"],
    extensionPolicy: {
        allowedAxes: ["palette", "display-type", "outline-shadow", "floating-composition", "motion"],
        forbiddenChanges: CLOSED_EXTENSION_BOUNDARIES,
    },
    closedInvariants: [
        "business-neutral",
        "semantic-html-unchanged",
        "component-anatomy-unchanged",
        "state-vocabulary-unchanged",
        "content-remains-readable-without-decoration",
    ],
} as const satisfies GrammarContractSpec

export const surfaceCardContract = defineGrammarContract("core.surface-card", surfaceCardSpec)
export const surfaceListCardContract = defineGrammarContract("core.surface-list-card", surfaceListCardSpec)
export const surfaceAccordionCardContract = defineGrammarContract("core.surface-accordion-card", surfaceAccordionCardSpec)
export const markdownArticleContract = defineGrammarContract("core.markdown-article", markdownArticleSpec)
export const railContract = defineGrammarContract("core.rail", railSpec)
export const visualTreatmentContract = defineGrammarContract("core.visual-treatment", visualTreatmentSpec)

export const CORE_COMPONENT_CONTRACTS = Object.freeze({
    "core.surface-card": surfaceCardContract,
    "core.surface-list-card": surfaceListCardContract,
    "core.surface-accordion-card": surfaceAccordionCardContract,
    "core.markdown-article": markdownArticleContract,
    "core.rail": railContract,
    "core.visual-treatment": visualTreatmentContract,
})

export type CoreComponentContract = GrammarContract<string, GrammarContractSpec>
export type CoreComponentContractId = keyof typeof CORE_COMPONENT_CONTRACTS
