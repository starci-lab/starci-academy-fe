export type CoreRule = {
    readonly id: string
    readonly concern: "state" | "anatomy" | "layout" | "interaction"
    readonly when: ReadonlyArray<string>
    readonly decide: ReadonlyArray<string>
    readonly refuse: ReadonlyArray<string>
}

export const CORE_RULES = [
    {
        id: "core.anatomy.leading-number",
        concern: "anatomy",
        when: ["one ordered peer needs a visible ordinal before its authored copy"],
        decide: ["render one muted tabular `N.` prefix through LeadingNumber", "keep the ordinal separate from business copy"],
        refuse: ["badge or chip treatment", "circle or decorative container", "concatenating the ordinal into authored copy", "page-local ordinal styling"],
    },
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
        decide: [
            "render one full-width list shell",
            "keep adjacent row separators full-bleed",
            "put inset on row content",
            "show one check for an affirmative row",
        ],
        refuse: [
            "one shell per row",
            "interactive row behavior",
            "inset row dividers",
            "hover decoration on static rows",
            "more than one state mark per row",
        ],
    },
    {
        id: "core.anatomy.markdown-reading",
        concern: "anatomy",
        when: ["semantic Markdown is presented as a readable document"],
        decide: [
            "retain native document semantics",
            "use fourteen-pixel body copy",
            "render inline code with a neutral chip treatment",
            "contain fenced code and table overflow",
            "keep headings, lists and blockquotes visibly distinct",
        ],
        refuse: [
            "flattening semantic nodes into equal-weight text",
            "product-specific Markdown dialects",
            "page-local reading typography",
            "unbounded horizontal overflow",
        ],
    },
    {
        id: "core.anatomy.interactive-collection",
        concern: "anatomy",
        when: ["peer rows share one boundary and one or more rows own an action"],
        decide: ["render one collection shell", "keep every row action inside its row owner", "place a collection outcome after the shell"],
        refuse: ["claiming the static-row capability", "one surface per row", "moving row actions into the surface owner"],
    },
    {
        id: "core.interaction.disclosure-surface",
        concern: "interaction",
        when: ["one or more disclosure rows share one neutral surface boundary"],
        decide: [
            "fill the content owner",
            "keep row separators full-bleed",
            "put inset on row content",
            "change presentation only for open or closed state",
        ],
        refuse: [
            "inset row dividers",
            "hover decoration",
            "nested elevation",
            "caller-authored geometry",
        ],
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
