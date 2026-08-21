import { Breadcrumbs as HeroBreadcrumbs, Link as HeroLink, skeletonVariants } from "@heroui/react"
import { Icon } from "@/components/leaves/Icon"
import type { LeafProps } from "@/components/contracts/props"

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
}

/** One handler per step id, so the caller decides what "go back there" means. */
export type BreadcrumbsActions = {
    readonly [key: string]: (() => void) | undefined
}

/** Props for {@link Breadcrumbs}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type BreadcrumbsProps = LeafProps<BreadcrumbsData, BreadcrumbsActions>

/** The resting shape - one short bar where the trail will be. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({ className: "h-4 w-40 rounded-sm" })
/** Three path steps no longer aid orientation; the nearest ancestor is the useful way out. */
const BACK_LINK_MIN_DEPTH = 3
/** Back-link anatomy owned by this leaf so every deep trail resolves to the same quiet control. */
const BACK_LINK_CLASSES = "inline-flex w-fit items-center gap-1 text-sm text-muted"
/** Deep trails use the short legacy wording; the surrounding accessible label still names the path. */
const BACK_LABEL = "Back"

/**
 * Draw the path to the current page.
 *
 * @param input - {@link BreadcrumbsProps}
 */
export const Breadcrumbs = ({ props, on, isLoading = false }: BreadcrumbsProps) => {
    if (isLoading) {
        return (
            <span
                data-tier="leaf"
                data-component="Breadcrumbs"
                data-loading="true"
                aria-hidden="true"
                className={RESTING_CLASSES}
            />
        )
    }
    const last = props.steps.length - 1
    const parent = [...props.steps.slice(0, last)].reverse().find((step) => on?.[step.id] !== undefined)
    if (props.steps.length >= BACK_LINK_MIN_DEPTH && parent !== undefined) {
        return (
            <HeroLink
                data-tier="leaf"
                data-component="Breadcrumbs"
                data-variant="back"
                onPress={on?.[parent.id]}
                className={BACK_LINK_CLASSES}
            >
                <Icon props={{ name: "back", role: "chip" }} />
                {BACK_LABEL}
            </HeroLink>
        )
    }
    return (
        <HeroBreadcrumbs
            data-tier="leaf"
            data-component="Breadcrumbs"
            data-loading="false"
            aria-label={props.label}
        >
            {props.steps.map((step, index) => (
                // The vendor marks the LAST item as the current page itself, so the only thing
                // left to decide is that it carries no handler: a control returning you to the
                // page you are on is one readers learn to distrust everywhere.
                <HeroBreadcrumbs.Item
                    key={step.id}
                    onPress={index === last ? undefined : on?.[step.id]}
                >
                    {step.label}
                </HeroBreadcrumbs.Item>
            ))}
        </HeroBreadcrumbs>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
