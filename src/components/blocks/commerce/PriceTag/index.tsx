import { Text } from "@/components/atoms/Text"
import { Tree } from "@/components/frames/Tree"
import type { ContractSlotProps } from "@/components/contracts"

/**
 * BLOCK - `PriceTag`: what a course costs, and what it used to cost.
 *
 * PORTED FROM THE LIVE PRODUCT, where the family was a base component, two members, a shared
 * label hook and a currency formatter - three hundred lines whose largest single piece was a
 * breakdown POPOVER explaining how the discount was arrived at: a list price, a launch phase, a
 * loyalty percentage and the total. None of that arithmetic crosses, and not because it is hard:
 * every figure in it comes from pricing rules that live behind a request this repository does
 * not have. A breakdown assembled here would be a persuasive number with nothing behind it,
 * which is the one thing a price is never allowed to be.
 *
 * SO THE TAG SAYS ONLY WHAT IT WAS TOLD. Both figures arrive already formatted, because the
 * currency, the grouping and the symbol position are the locale's business rather than this
 * block's - the original's own formatter had a currency union with exactly two members in it,
 * which is how a formatter announces that it is in the wrong layer.
 *
 * THE FORMER PRICE IS `del` AND NOT A STRUCK STYLE. It is content that has been REMOVED, which
 * is what the element means, so assistive technology says so rather than a reader having to see
 * a line to know. The atom inside it still owns the type.
 *
 * WHAT IS NOT HERE: THE SAVING LINE. The original could put "save thirty per cent" beside the
 * former price. Two facts sharing one slot is a shape no key in this registry describes, and a
 * saving is the part of a price a reader is most entitled to have stated accurately - so it
 * waits for a key rather than being smuggled into a role that means something else.
 */

/**
 * How loudly the price is said.
 *
 * - `prominent` - the price IS the thing being read, on a pricing card or a checkout line.
 * - `inline` - the price is a fact about something else, in a row or beside a title.
 */
export type PriceEmphasis = "prominent" | "inline"

/** Props for {@link PriceTag}. */
export interface PriceTagProps {
    /** The already-formatted price actually being charged, including its currency. */
    price: string
    /**
     * The already-formatted price before any discount. Omitted, nothing is struck through - a
     * former price invented to make the current one look better is the oldest lie in retail.
     */
    listPrice?: string
    /** How loudly the price is said - see {@link PriceEmphasis}. */
    emphasis?: PriceEmphasis
    /** Nothing to show yet - the figures rest as themselves. */
    isLoading?: boolean
}

/**
 * Draw what something costs.
 *
 * @param props - {@link PriceTagProps}
 */
export const PriceTag = ({ price, listPrice, emphasis = "prominent", isLoading = false }: PriceTagProps) => {
    /** The `heading` role: the figure actually being charged. */
    const Price = ({ isLoading: resting }: ContractSlotProps) => (
        <Text
            size={emphasis === "prominent" ? "md" : "sm"}
            weight="medium"
            isLoading={resting}
        >
            {price}
        </Text>
    )

    /** The `meta` role: what it used to cost, marked up as content that has been removed. */
    const Former = ({ isLoading: resting }: ContractSlotProps) => (
        <del>
            <Text tone="muted" size="sm" isLoading={resting}>
                {listPrice ?? ""}
            </Text>
        </del>
    )

    if (listPrice === undefined) {
        return <Price isLoading={isLoading} />
    }
    return <Tree contract="key-value-row" isLoading={isLoading} slots={{ heading: Price, meta: Former }} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "block", name: "PriceTag" } as const
