import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { CoverImage } from "@/components/leaves/CoverImage"
import { Text } from "@/components/leaves/Text"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/components/contracts/props"

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
 * IT IS AN `aside`, WHICH IS THIS REVISION'S POINT. The entry says so, not this file. Complementary
 * to the narrative and announced as such, so a reader navigating by region can reach the price
 * without reading the curriculum and can skip it without losing their place in it.
 *
 * THE LADDER IS ONE CONTROL, NOT THREE FACTS. The open phase is the price; the phases below it are
 * what waiting costs. The entry makes it an `ol` for the same reason.
 *
 * THE PRICE RESTS ALONE WHILE IT IS PENDING. The legacy rail skeletons its headline rather than
 * showing the phase price and swapping it for the viewer's loyalty price a moment later, because
 * that swap is a number changing under a reader who was already deciding.
 *
 * WHY THE PRICE IS `sm` AND THE DISCOUNT IS A BADGE. `price-discount-line` is LOCKED, and it
 * declares exactly that: `price` at `size: "sm"` with `weight: "semibold"`, `original` at `xs` with
 * `tone: "muted"`, and `discount` as a **badge**. Revision 1.3 drew the price at `md` and the
 * discount as accent-toned text, which the candidate's own shim allowed because it never checked a
 * slot's declared props. Reusing a locked key means accepting what it already says - the alternative
 * is a new key, and a course page that quietly redefines the shared price line is how two pages stop
 * showing prices the same way.
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
    /** The already-formatted list price. */
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
    /** The already-resolved trial action label. Absent hides the trial action. */
    readonly trialLabel?: string
    /** The already-resolved cart action label. Absent hides the cart action. */
    readonly cartLabel?: string
    /** Whether this course is already in the viewer's cart. */
    readonly isInCart?: boolean
    /** The already-formatted enrolment proof sentence. */
    readonly enrolmentLabel?: string
}

/** What the rail reports. */
export type CoursePricingRailActions = {
    /** Continue learning or enter checkout. */
    readonly act?: () => void
    /** Open the course's previewable learning path. */
    readonly trial?: () => void
    /** Add this course to the cart. */
    readonly addToCart?: () => void
}

/** The situations the rail can be in. */
export type CoursePricingRailState = "ready" | "price-pending" | "adding"

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
    const isAdding = input.state === "adding"
    const phases = input.props.phases ?? []
    const activePhase = phases.find((phase) => phase.isActive === true)

    const priceLine = defineContractComponent("price-discount-line", {
        price: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
            <Text props={{ content: input.props.price, size: "sm", weight: "semibold" }} isLoading={isPricePending} />
        )),
        original: input.props.originalPrice === undefined || isPricePending
            ? undefined
            : defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: input.props.originalPrice, size: "xs", tone: "muted", isSuperseded: true }} />
            )),
        discount: input.props.discountLabel === undefined || isPricePending
            ? undefined
            : defineLeafComponent("badge", {}, () => (
                <Badge props={{ content: input.props.discountLabel, tone: "accent" }} />
            )),
    })

    return (
        <SurfaceCard
            contract="course-pricing-rail"
            render={defineContractComponent("course-pricing-rail", {
                cover: defineLeafComponent("cover-image", {}, () => (
                    <CoverImage props={{ src: input.props.coverUrl ?? null, alt: input.props.title, ratio: "wide" }} />
                )),
                price: defineContractComponent("course-price-block", {
                    line: priceLine,
                    savings: input.props.savingsLabel === undefined || isPricePending
                        ? undefined
                        : defineLeafComponent("text", { size: "xs" }, () => (
                            <Text props={{ content: input.props.savingsLabel, size: "xs" }} />
                        )),
                    scarcity: input.props.scarcityLabel === undefined
                        ? undefined
                        : defineLeafComponent("badge", {}, () => (
                            <Badge props={{ content: input.props.scarcityLabel, tone: "warning" }} />
                        )),
                }),
                phase: activePhase === undefined
                    ? undefined
                    : defineLeafComponent("badge", {}, () => (
                        <Badge props={{ content: activePhase.name, tone: "accent" }} />
                    )),
                ladder: phases.length === 0 ? undefined : defineContractComponent("course-pricing-phase-grid", {
                    phase: phases.map((phase) => defineContractComponent("course-pricing-phase-card", {
                        name: phase.isActive === true
                            ? defineLeafComponent("badge", {}, () => (
                                <Badge props={{ content: phase.name, tone: "accent" }} />
                            ))
                            : defineLeafComponent("text", {}, () => (
                                <Text props={{ content: phase.name, size: "sm", weight: "semibold" }} />
                            )),
                        value: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                            <Text props={{ content: phase.value, size: "xs", tone: "muted" }} />
                        )),
                    })),
                }),
                action: defineContractComponent("course-pricing-action-stack", {
                    primary: defineLeafComponent("button", {}, () => (
                        <Button
                            props={{ label: input.props.ctaLabel, variant: "primary", size: "md", icon: "next" }}
                            on={{ press: input.on?.act }}
                        />
                    )),
                    secondary: input.props.trialLabel === undefined && input.props.cartLabel === undefined
                        ? undefined
                        : defineContractComponent("course-pricing-secondary-action-row", {
                            trial: input.props.trialLabel === undefined
                                ? undefined
                                : defineLeafComponent("button", {}, () => (
                                    <Button
                                        props={{ label: input.props.trialLabel ?? "", variant: "secondary", size: "sm" }}
                                        on={{ press: input.on?.trial }}
                                    />
                                )),
                            cart: input.props.cartLabel === undefined
                                ? undefined
                                : defineLeafComponent("button", {}, () => (
                                    <Button
                                        props={{
                                            label: input.props.cartLabel ?? "",
                                            variant: "secondary",
                                            size: "sm",
                                            disabled: input.props.isInCart === true,
                                            isPending: isAdding,
                                        }}
                                        on={{ press: input.on?.addToCart }}
                                    />
                                )),
                        }),
                }),
                proof: input.props.enrolmentLabel === undefined
                    ? undefined
                    : defineLeafComponent("text", { size: "xs" }, () => (
                        <Text props={{ content: input.props.enrolmentLabel, size: "xs" }} />
                    )),
            })}
        />
    )
}

/**
 * The rail, branded for the slot that holds it.
 *
 * A projection rather than bound slots: `SurfaceCard` has already drawn the contract's `Tree`, and
 * `ContractContent` renders a projection without opening a second node around it. Binding slots
 * here instead would inset the rail twice.
 */
export const CoursePricingRail = (input: CoursePricingRailProps) =>
    defineContractProjection("course-pricing-rail", () => <_CoursePricingRail {...input} />)

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "courses" } as const
