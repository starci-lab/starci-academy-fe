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
        id: "core.anatomy.interactive-collection",
        concern: "anatomy",
        when: ["peer rows share one boundary and one or more rows own an action"],
        decide: ["render one collection shell", "keep every row action inside its row owner", "place a collection outcome after the shell"],
        refuse: ["claiming the static-row capability", "one surface per row", "moving row actions into the surface owner"],
    },
    {
        id: "core.anatomy.frameless-surface",
        concern: "anatomy",
        when: ["the content already owns its visible surface boundaries"],
        decide: ["retain the external label", "remove the redundant surface shell"],
        refuse: ["dropping the accessible name", "drawing a transparent decorative shell"],
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
    {
        id: "core.layout.collapsible-navigation-rail",
        concern: "layout",
        when: ["one persistent navigation rail changes between expanded and compact modes"],
        decide: ["keep one mounted rail owner", "retain accessible destination names", "remove interpolation for reduced motion"],
        refuse: ["nesting navigation landmarks", "hiding destinations in compact mode", "removing the state change with the animation"],
    },
] as const satisfies ReadonlyArray<CoreRule>
