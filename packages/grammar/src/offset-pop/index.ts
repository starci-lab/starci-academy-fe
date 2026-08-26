import { extendGrammarContract } from "../common/index.js"
import {
    CORE_COMPONENT_CONTRACTS,
    visualTreatmentContract,
} from "../core/index.js"

/** The complete visual delta observed in the reference, expressed only on Core's open axes. */
export const offsetPopVisualTreatmentContract = extendGrammarContract(
    "offset-pop.visual-treatment",
    visualTreatmentContract,
    {
        id: "offset-pop.visual-treatment",
        version: "1.0.0",
        base: {
            key: visualTreatmentContract.key,
            version: visualTreatmentContract.version,
        },
        axes: ["palette", "display-type", "outline-shadow", "floating-composition", "motion"],
        values: {
            palette: {
                field: "warm-paper",
                ink: "near-black",
                accents: ["hot-pink", "sun-yellow", "mint", "blush"],
                rule: "one-dominant-accent-per-region",
            },
            "display-type": {
                weight: "extra-heavy",
                measure: "compact",
                body: "plain-readable",
            },
            "outline-shadow": {
                outline: "thick-near-black",
                shadow: "hard-down-right-zero-blur",
                nested: "outline-only",
            },
            "floating-composition": {
                rotation: "bounded",
                overlap: "declared-z-order",
                narrow: "reduce-rotation-before-removing-overlap",
            },
            motion: {
                hover: "lift-interactive-only",
                pressed: "collapse-offset",
                reduced: "no-geometric-interpolation",
            },
        },
    },
)

/** Business-neutral complex cases that consumers must preserve when composing the extension. */
export const OFFSET_POP_COMPLEX_CASES = Object.freeze([
    "nested-surface-keeps-one-outline-and-no-second-shadow",
    "static-list-keeps-one-shell-with-dividers-and-optional-state-mark",
    "floating-items-declare-z-order-and-collision-bounds",
    "long-copy-reduces-rotation-before-truncation",
    "whole-surface-action-keeps-inner-actions-reachable",
    "focus-and-selection-remain-distinct-from-hard-shadow",
    "pending-negative-and-empty-states-keep-the-same-anatomy",
    "dense-primary-content-may-span-two-columns-while-sparse-data-stays-one",
    "sticky-rail-returns-to-flow-on-narrow-containers",
    "dark-high-contrast-and-reduced-motion-keep-legibility",
] as const)

/** One installable Grammar bundle: Core owns anatomy; Offset Pop owns only visual treatment. */
export const offsetPopGrammar = Object.freeze({
    id: "offset-pop",
    version: "1.1.0",
    extends: Object.freeze([{ id: "core", version: "1.1.0" }]),
    contracts: Object.freeze({
        ...CORE_COMPONENT_CONTRACTS,
        [offsetPopVisualTreatmentContract.key]: offsetPopVisualTreatmentContract,
    }),
    contractList: Object.freeze([
        ...Object.values(CORE_COMPONENT_CONTRACTS),
        offsetPopVisualTreatmentContract,
    ]),
    complexCases: OFFSET_POP_COMPLEX_CASES,
})

export type OffsetPopGrammar = typeof offsetPopGrammar
