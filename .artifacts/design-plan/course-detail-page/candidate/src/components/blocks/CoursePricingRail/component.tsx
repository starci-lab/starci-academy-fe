import { Button } from "@/components/leaves/Button"
import { StatusDot } from "@/components/leaves/StatusDot"
import { Text } from "@/components/leaves/Text"
import { Tree, defineContract } from "~candidate/components/branches/Tree"
import { CoverImage } from "~candidate/components/leaves/CoverImage"

/**
 * BLOCK - `CoursePricingRail`: the one place this page asks for money.
 *
 * Target path: `src/components/blocks/courses/CoursePricingRail/component.tsx`.
 *
 * THE HERO CARRIES NO PRICE, and that is the selected direction's whole shape rather than an
 * oversight. The named render puts every commerce fact here - artwork, the payable price, one
 * discount, one scarcity line, the phase ladder, one action, and the enrolment proof - so a reader
 * never has to decide which of two buy boxes is authoritative.
 *
 * THE LADDER IS ONE CONTROL, NOT THREE FACTS. The open phase is the price; the phases below it are
 * what waiting costs. Rendering them as separate rows of equal weight would turn a sequence into a
 * comparison the learner cannot act on.
 *
 * THE PRICE RESTS ALONE WHILE IT IS PENDING. The legacy rail skeletons its headline rather than
 * showing the phase price and swapping it for the viewer's loyalty price a moment later, because
 * that swap is a number changing under a reader who was already deciding. Everything else in the
 * rail is known before that request settles and renders as itself.
 */

/** One phase in the ladder. */
export type PricingPhase = {
    /** Stable identity. */
    readonly id: string
    /** The already-resolved phase name. */
    readonly name: string
    /** The already-resolved trailing value - a price, or the word for an open phase. */
    readonly value: string
    /** Whether this is the phase currently on sale. */
    readonly isActive?: boolean
}

/** What the rail draws. */
export type CoursePricingRailData = {
    /** Artwork source; `null` draws the leaf's token fallback. */
    readonly coverUrl?: string | null
    /** The course title, used as the artwork's alternative text. */
    readonly title: string
    /** The already-formatted payable price. Absent while the viewer's price is still pending. */
    readonly price?: string
    /** The already-formatted list price, struck through. */
    readonly originalPrice?: string
    /** The already-formatted discount. */
    readonly discountLabel?: string
    /** The already-formatted savings sentence. */
    readonly savingsLabel?: string
    /** One scarcity line, e.g. remaining slots in the open phase. */
    readonly scarcityLabel?: string
    /** The ladder. An empty run renders no ladder at all. */
    readonly phases?: ReadonlyArray<PricingPhase>
    /** The already-resolved action label. */
    readonly ctaLabel: string
    /** The already-formatted enrolment proof sentence. */
    readonly enrolmentLabel?: string
}

/** What the rail reports. */
export type CoursePricingRailActions = {
    /** The single action this page offers. */
    readonly act?: () => void
}

/** The situations the rail can be in. */
export type CoursePricingRailState = "ready" | "price-pending"

/** Props for {@link _CoursePricingRail}. */
export type CoursePricingRailProps = {
    /** The business situation, which picks the tree. */
    readonly state: CoursePricingRailState
    /** What that tree says. */
    readonly props: CoursePricingRailData
    /** What the rail reports. */
    readonly on?: CoursePricingRailActions
}

/**
 * Draw the buy box.
 *
 * @param input - {@link CoursePricingRailProps}
 */
export const _CoursePricingRail = (input: CoursePricingRailProps) => {
    const isPricePending = input.state === "price-pending"
    const phases = input.props.phases ?? []

    const priceLine = defineContract("price-discount-line", [
        <Text
            key="price"
            props={{ content: input.props.price, size: "md", weight: "semibold" }}
            isLoading={isPricePending}
        />,
        input.props.originalPrice === undefined || isPricePending
            ? null
            : <Text key="original" props={{ content: input.props.originalPrice, size: "xs" }} />,
        input.props.discountLabel === undefined || isPricePending
            ? null
            : <Text key="discount" props={{ content: input.props.discountLabel, size: "sm", tone: "accent", weight: "semibold" }} />,
    ])

    const priceBlock = defineContract("course-price-block", [
        <Tree key="line" contract="price-discount-line" render={priceLine} />,
        input.props.savingsLabel === undefined || isPricePending
            ? null
            : <Text key="savings" props={{ content: input.props.savingsLabel, size: "xs" }} />,
        input.props.scarcityLabel === undefined
            ? null
            : <Text key="scarcity" props={{ content: input.props.scarcityLabel, size: "xs" }} />,
    ])

    const ladder = phases.length === 0 ? null : (
        <Tree
            key="ladder"
            contract="pricing-phase-ladder"
            render={defineContract("pricing-phase-ladder", phases.map((phase) => (
                <Tree
                    key={phase.id}
                    contract="pricing-phase-row"
                    render={defineContract("pricing-phase-row", [
                        // The mark means "this is the open phase", so only the open phase carries
                        // one. StatusDot's tones are all affirmative and it requires an accessible
                        // name, so there is no honest way to draw a dot for a phase that is not
                        // open. The slot stays occupied by a resting line, which is what keeps the
                        // names aligned down the ladder.
                        phase.isActive === true
                            ? <StatusDot key="mark" props={{ tone: "accent", label: phase.value }} />
                            : <Text key="mark" props={{ content: "", size: "xs" }} />,
                        phase.isActive === true
                            ? <Text key="name" props={{ content: phase.name, size: "sm", tone: "accent", weight: "semibold" }} />
                            : <Text key="name" props={{ content: phase.name, size: "sm" }} />,
                        <Text key="value" props={{ content: phase.value, size: "xs" }} />,
                    ])}
                />
            )))}
        />
    )

    return (
        <Tree
            contract="course-pricing-rail"
            render={defineContract("course-pricing-rail", [
                <CoverImage
                    key="cover"
                    props={{ src: input.props.coverUrl ?? null, alt: input.props.title, ratio: "wide" }}
                />,
                <Tree key="price" contract="course-price-block" render={priceBlock} />,
                ladder,
                <Button
                    key="action"
                    props={{ label: input.props.ctaLabel, variant: "primary", size: "md", icon: "next" }}
                    on={{ press: input.on?.act }}
                />,
                input.props.enrolmentLabel === undefined
                    ? null
                    : <Text key="proof" props={{ content: input.props.enrolmentLabel, size: "xs" }} />,
            ])}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "courses" } as const
