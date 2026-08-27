import { Link as HeroLink } from "@heroui/react"
import { Icon, type IconName } from "@/components/leaves/Icon"
import { getNavLinkClassName } from "./classNames"

/**
 * LEAF - `NavLink`: one destination in the bar, or one tab under it.
 *
 * SELECTION IS A FACT ABOUT THE ROUTE, not a style. `isCurrent` drives both the underline and
 * `aria-current`, so what a reader sees and what a screen reader is told cannot disagree - which
 * is exactly what happens when the two are set in different places.
 *
 * TWO SHAPES, ONE LEAF. A route in the bar and a tab under it are the same thing at two weights:
 * the tab carries the underline because it changes what is below it, the bar link does not
 * because it changes the whole page.
 */

/** Whether this names a page or a section of one. */
export type NavLinkKind = "route" | "tab" | "section"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type NavLinkData = {
    /** The already-resolved words. */
    readonly label: string
    /** The meaning drawn before the words, for a tab that carries one. */
    readonly icon?: IconName
    /** Whether the visible words remain drawn; the accessible name is retained when false. */
    readonly showLabel?: boolean
    /** Whether this is where the reader already is. */
    readonly isCurrent?: boolean
    /** A page destination, or a section of the page. */
    readonly kind?: NavLinkKind
    /**
     * How deep inside the page this section sits. Only a `section` reads it.
     *
     * The outline of a document is a TREE, and a flat list of its headings is a list of places
     * with the one fact that orders them thrown away - which of them is inside which. Legacy
     * indents from the third level down for exactly that reason.
     */
    readonly depth?: 1 | 2 | 3
}

/** Internal route choice reported to the connected navigation owner. */
export type NavLinkActions = {
    readonly press?: () => void
}

/** Props for {@link NavLink}. */
export type NavLinkProps = { readonly props: NavLinkData; readonly on?: NavLinkActions; readonly isLoading?: boolean }

/** The set per kind, with the current one carrying its own weight and rule. */
/* moved to classNames.ts
const KIND_CLASSES = {
    route: {
        base: "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm text-muted",
        current: "inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-accent-soft px-3 py-2 text-sm font-semibold text-accent-soft-foreground",
    },
    tab: {
        base: "inline-flex items-center gap-2 border-b-2 border-transparent py-3 text-sm text-muted",
        current: "inline-flex items-center gap-2 border-b-2 border-accent py-3 text-sm font-semibold text-accent",
    },
    //
     * A SECTION WEARS NO CHROME. A route is a pill and a tab is an underline, because each stands
     * in a bar of peers and needs an edge; an outline entry stands in a column of prose-length
     * lines, and a plate around one of them reads as a control rather than as where you are. The
     * words themselves carry the state - the same answer the reference render gives.
     //
    section: {
        base: "flex text-start text-sm text-muted",
        current: "flex text-start text-sm font-medium text-accent-soft-foreground",
    },
} as const */

/** Icon-only route destinations are circles, not text-pill geometry with the words removed. */
/*
const ICON_ONLY_ROUTE_CLASSES = {
    base: "inline-flex size-11 shrink-0 items-center justify-center rounded-full p-0 text-muted",
    current: "inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-soft p-0 text-accent-soft-foreground",
} as const */

/** How far an outline entry is indented for the level it sits at. */
/* const DEPTH_CLASSES = { 1: "", 2: " pl-3", 3: " pl-6" } as const */

/**
 * Draw one destination.
 *
 * @param input - {@link NavLinkProps}
 */
export const NavLink = (props: NavLinkProps) => {
    const data = props.props
    const on = props.on
    const isCurrent = data.isCurrent === true
    const isIconOnlyRoute = data.showLabel === false && (data.kind ?? "route") === "route"
    return (
        <HeroLink
            data-kind={data.kind ?? "route"}
            data-current={isCurrent ? "true" : "false"}
            onPress={on?.press}
            aria-current={isCurrent ? "page" : undefined}
            aria-label={data.showLabel === false ? data.label : undefined}
            className={getNavLinkClassName(data.kind ?? "route", isCurrent, isIconOnlyRoute, data.depth ?? 1)}
        >
            {data.icon === undefined ? null : <Icon props={{ name: data.icon, role: "leading" }} />}
            {data.showLabel === false ? null : data.label}
        </HeroLink>
    )
}
