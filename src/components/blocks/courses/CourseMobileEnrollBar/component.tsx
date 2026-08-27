import { Button } from "@/components/leaves/Button"
import { Text } from "@/components/leaves/Text"

/**
 * BLOCK - `CourseMobileEnrollBar`: the buy decision, kept reachable on a narrow viewport.
 *
 * Target path: `src/components/blocks/courses/CourseMobileEnrollBar/component.tsx`.
 *
 * WHY IT EXISTS AS A SECOND OWNER. Below the rail's breakpoint the rail stops being a rail: it
 * stacks into the reading column and scrolls away, so a learner three screens into a twenty-three
 * module curriculum has no way to act without scrolling back. The named render answers that with a
 * separate pinned bar, and that is the answer chosen here.
 *
 * IT IS DELIBERATELY NOT THE RAIL. It carries the payable price and one action and nothing else -
 * no artwork, no ladder, no proof line. A second full buy box would be a second thing to keep in
 * step with the first, and the first is the authoritative one.
 *
 * IT IS NOT AN `aside` EITHER. The rail already claims the complementary region for this page's
 * commerce; a second one would announce two of them for the same decision, on the one viewport
 * where the reader can only reach the pinned copy.
 *
 * THE PRICE IS THE SAME RESOLVED STRING the rail draws, passed in rather than derived here, so the
 * two can never disagree about what the course costs - including while it is pending, when both
 * rest instead of one guessing. It also wears the same `price-discount-line` shape, so the number a
 * reader saw in the rail is the number they see pinned.
 */

/** What the bar draws. */
export type CourseMobileEnrollBarData = {
    /** The already-formatted payable price. */
    readonly price?: string
    /** The already-formatted list price. */
    readonly originalPrice?: string
    /** The already-resolved action label. */
    readonly ctaLabel: string
}

/** What the bar reports. */
export type CourseMobileEnrollBarActions = {
    /** The same action the rail offers. */
    readonly act?: () => void
}

/** The situations the bar can be in - the rail's, because it shows the rail's number. */
export type CourseMobileEnrollBarState = "ready" | "price-pending"

/** Props for {@link CourseMobileEnrollBarBase}. */
export type CourseMobileEnrollBarProps = {
    /** The business situation, which picks the tree. */
    readonly state: CourseMobileEnrollBarState
    /** What that tree says. */
    readonly props: CourseMobileEnrollBarData
    /** What the bar reports. */
    readonly on?: CourseMobileEnrollBarActions
}

/**
 * Draw the narrow-viewport action bar.
 *
 * @param input - {@link CourseMobileEnrollBarProps}
 */
export const CourseMobileEnrollBarBase = (props: CourseMobileEnrollBarProps) => {
    const isPricePending = props.state === "price-pending"
    return <div>
        <div>
            <Text props={{ content: props.props.price, size: "sm", weight: "semibold" }} isLoading={isPricePending} />
            {props.props.originalPrice === undefined || isPricePending ? null : <Text props={{ content: props.props.originalPrice, size: "xs", tone: "muted", isSuperseded: true }} />}
        </div>
        <Button props={{ label: props.props.ctaLabel, variant: "primary", size: "sm" }} on={{ press: props.on?.act }} />
    </div>
}

/** The bar, branded for the slot that holds it. See the rail for why this is a projection. */
export const CourseMobileEnrollBar = (props: CourseMobileEnrollBarProps) =>
    <CourseMobileEnrollBarBase {...props} />
