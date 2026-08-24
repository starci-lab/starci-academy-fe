export type CoreRule = {
    readonly id: string
    readonly concern: "state" | "anatomy" | "layout" | "interaction"
    readonly when: ReadonlyArray<string>
    readonly decide: ReadonlyArray<string>
    readonly refuse: ReadonlyArray<string>
}

export const CORE_RULES = [
    {
        id: "core.anatomy.label-outside-surface",
        concern: "anatomy",
        when: ["one optional label names one bounded surface"],
        decide: ["render the label before and outside the surface shell"],
        refuse: ["placing the label inside surface padding", "duplicating the label in content"],
    },
    {
        id: "core.anatomy.nested-surface",
        concern: "anatomy",
        when: ["one list boundary is nested in a larger surface"],
        decide: ["retain one border", "remove elevation"],
        refuse: ["border and shadow together", "a nested shell used only as decoration"],
    },
    {
        id: "core.anatomy.static-list",
        concern: "anatomy",
        when: ["zero, one or many static peer statements share one boundary"],
        decide: ["render one list shell", "separate adjacent rows", "show one check for an affirmative row"],
        refuse: ["one shell per row", "interactive row behavior", "more than one state mark per row"],
    },
    {
        id: "core.interaction.whole-surface-action",
        concern: "interaction",
        when: ["the entire surface has exactly one destination or action"],
        decide: ["render one transparent control overlay after the content"],
        refuse: ["nesting controls", "moving the visible content into the control"],
    },
    {
        id: "core.state.neutral-input",
        concern: "state",
        when: ["a caller requests generic visual treatment"],
        decide: ["accept one closed neutral presentation state"],
        refuse: ["external semantic input", "copy-driven treatment selection"],
    },
    {
        id: "core.layout.container-response",
        concern: "layout",
        when: ["a surface or rail loses useful inline space"],
        decide: ["reflow owned rows within the component container", "disable sticky positioning on a narrow viewport"],
        refuse: ["content clipping", "hiding the primary body", "caller-authored breakpoint classes"],
    },
] as const satisfies ReadonlyArray<CoreRule>
