import { Breadcrumbs as HeroBreadcrumbs, Link as HeroLink } from "@heroui/react"
import { Icon } from "@/components/leaves/Icon"
import { breadcrumbsBackLinkClassName, breadcrumbsLoadingClassName, breadcrumbsTrailClassName } from "./classNames"

/**
 * LEAF - `Breadcrumbs`: the path that got the reader here.
 *
 * IT WRAPS THE VENDOR RATHER THAN REBUILDING IT. An earlier version of this trail was assembled by
 * hand out of links and a separator character, which looked like less machinery and was more: the
 * vendor already owns the list semantics, the current-page marking and the keyboard behaviour, and
 * a hand-rolled chain quietly reimplements all three slightly differently on every screen that
 * needs one.
 *
 * THE LAST STEP IS NOT A LINK. It is where the reader already is, and a control that returns you to
 * the page you are on is one readers learn to distrust everywhere, not just here. The vendor marks
 * it as current; this leaf decides which step that is by position, so a caller cannot forget.
 */

/** One place on the path. */
export type BreadcrumbStep = {
    /** Stable identity, and the key a caller's handler is filed under. */
    readonly id: string
    /** What the place is called. */
    readonly label: string
}

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type BreadcrumbsData = {
    /** Earliest place first; the last entry is where the reader is now. */
    readonly steps: ReadonlyArray<BreadcrumbStep>
    /** What the trail is, for assistive technology. Never drawn. */
    readonly label: string
    /** Keep every ancestor visible when each step communicates meaningful journey state. */
    readonly showFullTrail?: boolean
    /** Localized compact label used when a deep trail resolves to its nearest useful ancestor. */
    readonly backLabel?: string
}

/** One handler per step id, so the caller decides what "go back there" means. */
export type BreadcrumbsActions = {
    readonly [key: string]: (() => void) | undefined
}

/** Props for {@link Breadcrumbs}. Three fixed slots, no fourth. */
export type BreadcrumbsProps = { readonly props: BreadcrumbsData; readonly on?: BreadcrumbsActions; readonly isLoading?: boolean }

/** The resting shape - one short bar where the trail will be. */
/** Three path steps no longer aid orientation; the nearest ancestor is the useful way out. */
const BACK_LINK_MIN_DEPTH = 3
/** Back-link anatomy owned by this leaf so every deep trail resolves to the same quiet control. */
/** Deep trails use the short legacy wording; the surrounding accessible label still names the path. */
const BACK_LABEL = "Back"

/**
 * Draw the path to the current page.
 *
 * @param input - {@link BreadcrumbsProps}
 */
export const Breadcrumbs = (props: BreadcrumbsProps) => {
    const data = props.props
    const on = props.on
    const isLoading = props.isLoading ?? false
    if (isLoading) {
        return (
            <span
                data-loading="true"
                aria-hidden="true"
                className={breadcrumbsLoadingClassName}
            />
        )
    }
    const last = data.steps.length - 1
    const parent = [...data.steps.slice(0, last)].reverse().find((step) => on?.[step.id] !== undefined)
    if (data.showFullTrail !== true && data.steps.length >= BACK_LINK_MIN_DEPTH && parent !== undefined) {
        return (
            <HeroLink
                data-variant="back"
                onPress={on?.[parent.id]}
                className={breadcrumbsBackLinkClassName}
            >
                <Icon props={{ name: "back", role: "chip" }} />
                {data.backLabel ?? BACK_LABEL}
            </HeroLink>
        )
    }
    return (
        <HeroBreadcrumbs
            data-loading="false"
            aria-label={data.label}
            className={breadcrumbsTrailClassName}
        >
            {data.steps.map((step, index) => {
                // Do not pass an `onPress` prop at all for the current page. React
                // Aria treats an explicitly present-but-undefined press handler as
                // a changing interactive registration, which can loop during a
                // full four-step Challenge trail in the real browser.
                if (index === last) {
                    return (
                        <HeroBreadcrumbs.Item key={step.id}>
                            {step.label}
                        </HeroBreadcrumbs.Item>
                    )
                }
                return (
                    <HeroBreadcrumbs.Item
                        key={step.id}
                        onPress={on?.[step.id]}
                    >
                        {step.label}
                    </HeroBreadcrumbs.Item>
                )
            })}
        </HeroBreadcrumbs>
    )
}
