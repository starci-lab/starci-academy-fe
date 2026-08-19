import { Badge } from "@/components/leaves/Badge"
import { CoverImage } from "@/components/leaves/CoverImage"
import { IconButton } from "@/components/leaves/IconButton"
import { Text } from "@/components/leaves/Text"
import { Tree } from "@/components/branches/Tree"
import {
    defineContractComponent,
    defineLeafComponent,
    type BlockProps,
} from "@/components/contracts/props"

/**
 * BLOCK - `CartLine`: one course already in the basket, and the one way to change your mind.
 *
 * Target path: `src/components/blocks/commerce/CartLine/component.tsx`.
 *
 * THE PRICE LINE IS THE LOCKED CONTRACT, not a copy of it. `price-discount-line` already owns
 * "the payable price leads while original price and discount qualify that same commerce fact",
 * which is exactly this line, and `CoursePricingRail` records that the entry is locked and that a
 * caller accepts its declared slot props rather than redrawing them.
 *
 * THE IDENTITY STACK IS `evidence-title-over-subtitle`, the same entry the leaderboard row and the
 * livestream row already reach for. Five name-over-subtitle stacks exist in the registry; a sixth
 * for a basket would be the same relationship under a sixth name.
 *
 * THE REMOVAL IS A GLYPH, and that is the one product decision this block makes on its own. It is
 * the only destructive control on the row, its name repeated down a list would give the loudest
 * reading to the action nobody came for, and `IconButton` is the leaf that exists precisely so a
 * glyph-only control cannot ship nameless.
 */

/** The situations one basket line can be in. */
export type CartLineState = "pending" | "ready" | "removing"

/** What the line draws once resolved. */
export type CartLineData = {
    /** Stable row identity, and the id the removal reports. */
    readonly courseId: string
    /** The course name, already resolved. */
    readonly title?: string
    /** The tier line beneath the name, already resolved. */
    readonly tier?: string
    /** Course artwork; `null` draws the leaf's token fallback. */
    readonly cover?: string | null
    /** The already-formatted payable price. */
    readonly price?: string
    /** The already-formatted list price, when a discount applies. */
    readonly originalPrice?: string
    /** The already-formatted discount. */
    readonly discountLabel?: string
    /** The already-resolved accessible name of the removal. Read, never seen. */
    readonly removeLabel: string
}

/** What the line reports. */
export type CartLineActions = {
    /** Called when the reader takes this course out of the basket. */
    readonly remove?: () => void
}

/** Props for {@link CartLineBase}. */
export type CartLineProps = BlockProps<CartLineState, CartLineData> & {
    readonly on?: CartLineActions
}

/**
 * Draw one basket line.
 *
 * @param input - {@link CartLineProps}
 */
export const CartLineBase = (input: CartLineProps) => {
    const isLoading = input.state === "pending"

    return (
        <Tree
            contract="cart-line-row"
            render={defineContractComponent("cart-line-row", {
                cover: defineLeafComponent("cover-image", {}, () => (
                    <CoverImage
                        props={{ src: input.props.cover ?? null, alt: "", ratio: "wide" }}
                        isLoading={isLoading}
                    />
                )),
                identity: defineContractComponent("evidence-title-over-subtitle", {
                    title: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                        <Text
                            props={{ content: input.props.title, size: "sm", weight: "semibold" }}
                            isLoading={isLoading}
                        />
                    )),
                    ...(input.props.tier === undefined ? {} : {
                        subtitle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                            <Text
                                props={{ content: input.props.tier, size: "xs", tone: "muted" }}
                                isLoading={isLoading}
                            />
                        )),
                    }),
                }),
                price: defineContractComponent("price-discount-line", {
                    price: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                        <Text
                            props={{ content: input.props.price, size: "sm", weight: "semibold" }}
                            isLoading={isLoading}
                        />
                    )),
                    // THE OPTIONAL SLOTS ARE OMITTED, NOT EMPTIED. A course at list price has no
                    // original price and no discount, and a struck price beside the payable one
                    // with nothing struck out of it is a rule through a number that is still true.
                    ...(input.props.originalPrice === undefined ? {} : {
                        original: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                            <Text
                                props={{
                                    content: input.props.originalPrice,
                                    size: "xs",
                                    tone: "muted",
                                    // Two prices on one line without a rule through the dead one is
                                    // two live numbers, and the reader has to work out which of
                                    // them they owe.
                                    isSuperseded: true,
                                }}
                                isLoading={isLoading}
                            />
                        )),
                    }),
                    ...(input.props.discountLabel === undefined ? {} : {
                        discount: defineLeafComponent("badge", {}, () => (
                            <Badge
                                props={{ content: input.props.discountLabel, tone: "success" }}
                                isLoading={isLoading}
                            />
                        )),
                    }),
                }),
                // THE CONTROL IS DISABLED WHILE ITS OWN REMOVAL IS IN FLIGHT, not while any line's
                // is. A basket where removing one course froze every other row would report a
                // whole-list operation for a single-row one.
                remove: defineLeafComponent("icon-button", {}, () => (
                    <IconButton
                        props={{ icon: "close", label: input.props.removeLabel }}
                        on={{ press: input.state === "removing" ? undefined : input.on?.remove }}
                    />
                )),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "commerce" } as const
