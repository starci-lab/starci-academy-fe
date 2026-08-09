import { Heading, type HeadingLevel } from "@/components/atoms/Heading"
import { Text } from "@/components/atoms/Text"
import { Tree } from "@/components/frames/Tree"
import type { ContractSlot, ContractSlotProps } from "@/components/contracts"

/**
 * BLOCK - `LabeledCard`: a named region whose NAME SITS OUTSIDE the content it names.
 *
 * PORTED FROM THE LIVE PRODUCT, where this component carried thirteen props - `frameless`,
 * `flushContent`, `fillHeight`, `subtleLabel`, `bordered`, `labelEnd`, a deprecation notice on
 * one of them and a `cn()` picking between two gap steps. Eleven of the thirteen were CSS
 * wearing a boolean, and every one of them is a shape this tree names with a key instead. What
 * survives the crossing is the only thing the component was ever really for: a title that
 * belongs to a region without being drawn inside it, with something optional at the far end of
 * the title line.
 *
 * WHY `section` AND NOT A SURFACE KEY. That is the whole distinction from `SurfaceCard`. There
 * the title is INSIDE the bounded surface and reads as part of it; here it is a sibling of the
 * body, so the body can be a surface of its own - or several - without the label becoming a
 * card inside a card. The original spelled that with a `frameless` boolean and a comment
 * warning callers not to nest; the key says it structurally, and a nested surface is now
 * whatever the caller puts in `body`.
 *
 * THE FAR END OF THE TITLE LINE IS ONE THING, NOT THREE. The original resolved a precedence
 * chain there - an action slot beat a see-more link, which beat a passive label - which meant
 * a caller could pass all three and silently get one. Here a title line carries a FACT or a
 * CONTROL, because those are two different keys (`section-header` and `page-header`), and the
 * two cannot be passed at once.
 */

/** Props for {@link LabeledCard}. */
export interface LabeledCardProps {
    /** The already-resolved name of the region. Copy is data, so it arrives translated. */
    label: string
    /**
     * A passive fact at the far end of the title line - a count, a currency, a unit. Cannot be
     * combined with {@link LabeledCardProps.action}: a title line holding both a fact and a
     * control is a third shape, and no key in the registry describes it.
     */
    meta?: string
    /**
     * A control at the far end of the title line - the way to the fuller view of this region.
     * Passed UNCALLED, so the resting flag reaches inside it rather than stopping at a node
     * that was already built.
     */
    action?: ContractSlot
    /** The content this region names. */
    body: ContractSlot
    /**
     * A closing line BELOW the body - a prompt, a caption, a status about the region as a
     * whole. It sits outside whatever surface the body draws, which is the reason it is here
     * rather than inside the body: a caption tucked into the card it comments on reads as part
     * of the card's content.
     */
    description?: ContractSlot
    /**
     * Which level of the document outline this name is. Defaults to a section of the page,
     * because a label outside its content is naming a REGION rather than a card.
     */
    level?: HeadingLevel
    /**
     * Renders the body and everything optional around it in its resting state. The NAME does
     * not rest - it is copy the caller already holds, and a region that goes nameless while it
     * loads is one a reader cannot decide to skip.
     */
    isLoading?: boolean
}

/**
 * Draw a region whose name sits above it.
 *
 * @param props - {@link LabeledCardProps}
 */
export const LabeledCard = ({
    label,
    meta: metaText,
    action,
    body: Body,
    description: Description,
    level = 2,
    isLoading = false,
}: LabeledCardProps) => {
    /** The `heading` role, at whichever level of the outline the caller named. */
    const Title = () => <Heading level={level}>{label}</Heading>

    /** The `meta` role of the title line: the passive fact, muted and small. */
    const Fact = ({ isLoading: resting }: ContractSlotProps) => (
        <Text tone="muted" size="sm" isLoading={resting}>
            {metaText ?? ""}
        </Text>
    )

    /** The `heading` role of the section: a bare name, a name with a fact, or a name with a way on. */
    const Header = ({ isLoading: resting }: ContractSlotProps) => {
        if (action) {
            return <Tree contract="page-header" isLoading={resting} slots={{ heading: Title, action }} />
        }
        if (metaText !== undefined) {
            return <Tree contract="section-header" isLoading={resting} slots={{ heading: Title, meta: Fact }} />
        }
        return <Title />
    }

    /**
     * The `body` role of the section: the content, and the line that closes it.
     *
     * The two are held at one seam by `stack` rather than being dropped into the section
     * side by side, because a caption belongs to the body it comments on - at the section's
     * own seam it would read as a second region with no name.
     */
    const Content = ({ isLoading: resting }: ContractSlotProps) => {
        if (!Description) return <Body isLoading={resting} />
        const Both = () => (
            <>
                <Body isLoading={resting} />
                <Description isLoading={resting} />
            </>
        )
        return <Tree contract="stack" isLoading={resting} slots={{ body: Both }} />
    }

    return <Tree contract="section" isLoading={isLoading} slots={{ heading: Header, body: Content }} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "block", name: "LabeledCard" } as const
