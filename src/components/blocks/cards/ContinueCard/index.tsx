import { Link } from "@/components/atoms/Link"
import { Text } from "@/components/atoms/Text"
import { Tree } from "@/components/frames/Tree"
import { ProgressMeter } from "@/components/composites/stats/ProgressMeter"
import { SectionCard } from "@/components/blocks/cards/SectionCard"
import { verdictForPercent } from "@/components/composites/_semantic-contracts"
import type { ContractSlotProps } from "@/components/contracts"

/**
 * BLOCK - `ContinueCard`: the one thing a returning reader came back to finish.
 *
 * PORTED FROM THE LIVE PRODUCT. The original's own header records what the variant really
 * decides - "it decides icon placement, CTA affordance, and accent together, so a surface
 * cannot end up with an arbitrary mix of the three" - and that reasoning survives the crossing
 * intact. What does not survive is how it was drawn: a watermark glyph positioned with
 * `absolute -bottom-6 -right-6`, a clipping wrapper opened for it, and a sweeping-light layer
 * bled two pixels past the card's own box. Every one of those is a node with no key, and the
 * file said so itself in three separate `missingVocabulary` comments.
 *
 * SO THE VARIANT NOW DECIDES EXACTLY ONE THING, AND IT IS THE ONE THAT MATTERS. A `hero` is
 * the single standout on its surface, so its way on is the page's primary; an `item` is one of
 * several, so its way on is quiet - because N primaries on one surface is no primary at all,
 * which is the same rule the original was applying with an accent ring.
 *
 * WHY THE WAY ON IS AN ADDRESS. The original offered a handler OR an href and, for the hero
 * with an href, hand-rolled an `<a>` styled as a filled pill because no atom drew one. The
 * `Link` atom draws exactly that at `emphasis="primary"`, and an address is what a reader can
 * open in a new tab, copy, or read before pressing - none of which a button that navigates
 * allows.
 *
 * PROGRESS IS DRAWN ONLY WHEN THERE IS PROGRESS. Same rule as the original: omit the figure
 * rather than passing a placeholder to satisfy the type. A meter reading zero because nobody
 * measured is a fabricated number.
 */

/**
 * What this card IS on its surface.
 *
 * - `hero` - the single standout. Its way on is the surface's primary action.
 * - `item` - one of several. Its way on is quiet, so the group has no competing primaries.
 */
export type ContinueCardVariant = "hero" | "item"

/** Props for {@link ContinueCard}. */
export interface ContinueCardProps {
    /** What this card is on its surface - see {@link ContinueCardVariant}. */
    variant: ContinueCardVariant
    /** The already-resolved name of the thing being resumed. */
    title: string
    /** The already-resolved supporting line - the module, the lesson, where it was left. */
    subtitle?: string
    /**
     * How far through it the reader is, nought to a hundred. Omitted, no meter is drawn:
     * a figure nobody measured is worse than no figure.
     */
    percent?: number
    /** The already-formatted readout beside the meter - the words for {@link ContinueCardProps.percent}. */
    percentText?: string
    /** The already-resolved name of the meter, read out by assistive technology. */
    percentLabel?: string
    /** The words of the way on. */
    ctaLabel: string
    /** Where the way on leads. */
    href: string
    /** Nothing to show YET - the card rests as itself, at the shape it will load into. */
    isLoading?: boolean
}

/**
 * Draw the card that resumes something.
 *
 * @param props - {@link ContinueCardProps}
 */
export const ContinueCard = ({
    variant,
    title,
    subtitle,
    percent,
    percentText,
    percentLabel,
    ctaLabel,
    href,
    isLoading = false,
}: ContinueCardProps) => {
    /**
     * The `body` role of the card: where the reader got to.
     *
     * The subtitle and the meter are held at the card's own seam through `stack`, so a card
     * with no meter is the same tree with one child rather than a second tree.
     */
    const Body = ({ isLoading: resting }: ContractSlotProps) => {
        const Content = () => (
            <>
                {subtitle === undefined ? null : (
                    <Text tone="muted" size="sm" isLoading={resting}>
                        {subtitle}
                    </Text>
                )}
                {percent === undefined ? null : (
                    <ProgressMeter
                        label={percentLabel ?? title}
                        percent={percent}
                        readout={percentText ?? ""}
                        verdict={verdictForPercent(percent)}
                        isLoading={resting}
                    />
                )}
            </>
        )
        return <Tree contract="stack" isLoading={resting} slots={{ body: Content }} />
    }

    /**
     * The `footer` role: the way on, which is the whole point of the card.
     *
     * The emphasis is the variant's ONE decision - see the file header for why that is the
     * decision worth keeping out of the six the original made here.
     */
    const Action = () => (
        <Link href={href} icon="next" emphasis={variant === "hero" ? "primary" : "default"}>
            {ctaLabel}
        </Link>
    )

    return (
        <SectionCard
            label={title}
            icon="course"
            verdict={percent === undefined ? "neutral" : verdictForPercent(percent)}
            body={Body}
            footer={Action}
            isLoading={isLoading}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "block", name: "ContinueCard" } as const
