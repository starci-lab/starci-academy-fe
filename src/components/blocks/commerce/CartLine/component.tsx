import { Badge } from "@/components/leaves/Badge"
import { CoverImage } from "@/components/leaves/CoverImage"
import { IconButton } from "@/components/leaves/IconButton"
import { Text } from "@/components/leaves/Text"
import {
    cartLineClassName,
    cartLineCoverClassName,
    cartLineIdentityClassName,
    cartLinePriceClassName,
    cartLineRemoveClassName,
} from "./classNames"

/**
 * BLOCK - `CartLine`: one course already in the basket, and the one way to change your mind.
 *
 * Target path: `src/components/blocks/commerce/CartLine/component.tsx`.
 *
 * THE PRICE LINE keeps the payable price first, with the original price and discount qualifying
 * that same commerce fact.
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
export type CartLineProps = {
    readonly state: CartLineState
    readonly props: CartLineData
    readonly on?: CartLineActions
}

/**
 * Draw one basket line.
 *
 * @param input - {@link CartLineProps}
 */
export const CartLineBase = (props: CartLineProps) => {
    const isLoading = props.state === "pending"

    return (
        <div className={cartLineClassName}>
            <div className={cartLineCoverClassName}>
                <CoverImage props={{ src: props.props.cover ?? null, alt: "", ratio: "wide" }} isLoading={isLoading} />
            </div>
            <div className={cartLineIdentityClassName}>
                <Text props={{ content: props.props.title, size: "sm", weight: "semibold" }} isLoading={isLoading} />
                {props.props.tier === undefined ? null : <Text props={{ content: props.props.tier, size: "xs", tone: "muted" }} isLoading={isLoading} />}
            </div>
            <div className={cartLinePriceClassName}>
                <Text props={{ content: props.props.price, size: "sm", weight: "semibold" }} isLoading={isLoading} />
                {props.props.originalPrice === undefined ? null : <Text props={{ content: props.props.originalPrice, size: "xs", tone: "muted", isSuperseded: true }} isLoading={isLoading} />}
                {props.props.discountLabel === undefined ? null : <Badge props={{ content: props.props.discountLabel, tone: "success" }} isLoading={isLoading} />}
            </div>
            <div className={cartLineRemoveClassName}>
                <IconButton props={{ icon: "close", label: props.props.removeLabel }} on={{ press: props.state === "removing" ? undefined : props.on?.remove }} />
            </div>
        </div>
    )
}
