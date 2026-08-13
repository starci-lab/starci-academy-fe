import { Button } from "@/components/leaves/Button"
import { Text } from "@/components/leaves/Text"
import { Tree, defineContract } from "~candidate/components/branches/Tree"

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
 * THE PRICE IS THE SAME RESOLVED STRING the rail draws. It is passed in rather than derived here,
 * so the two can never disagree about what the course costs.
 */

/** What the bar draws. */
export type CourseMobileEnrollBarData = {
    /** The already-formatted payable price. */
    readonly price?: string
    /** The already-formatted list price, struck through. */
    readonly originalPrice?: string
    /** The already-resolved action label. */
    readonly ctaLabel: string
}

/** What the bar reports. */
export type CourseMobileEnrollBarActions = {
    /** The same action the rail offers. */
    readonly act?: () => void
}

/** Props for {@link _CourseMobileEnrollBar}. */
export type CourseMobileEnrollBarProps = {
    /** What the bar draws. */
    readonly props: CourseMobileEnrollBarData
    /** What the bar reports. */
    readonly on?: CourseMobileEnrollBarActions
}

/**
 * Draw the narrow-viewport action bar.
 *
 * @param input - {@link CourseMobileEnrollBarProps}
 */
export const _CourseMobileEnrollBar = (input: CourseMobileEnrollBarProps) => {
    const priceLine = defineContract("price-discount-line", [
        <Text key="price" props={{ content: input.props.price, size: "sm", weight: "semibold" }} />,
        input.props.originalPrice === undefined
            ? null
            : <Text key="original" props={{ content: input.props.originalPrice, size: "xs" }} />,
        null,
    ])

    return (
        <Tree
            contract="course-mobile-action-bar"
            render={defineContract("course-mobile-action-bar", [
                <Tree key="price" contract="price-discount-line" render={priceLine} />,
                <Button
                    key="action"
                    props={{ label: input.props.ctaLabel, variant: "primary", size: "sm" }}
                    on={{ press: input.on?.act }}
                />,
            ])}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "courses" } as const
