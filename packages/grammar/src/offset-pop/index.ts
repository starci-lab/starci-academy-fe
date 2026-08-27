/** Offset Pop visual vocabulary layered over traditional Grammar components. */
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
export const offsetPopGrammar = Object.freeze({ id: "offset-pop", version: "2.0.0", complexCases: OFFSET_POP_COMPLEX_CASES })
export type OffsetPopGrammar = typeof offsetPopGrammar
