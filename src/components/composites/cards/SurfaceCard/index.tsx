import { Heading, type HeadingLevel } from "@/components/atoms/Heading"
import { Text } from "@/components/atoms/Text"
import { Tree } from "@/components/frames/Tree"
import type { ContractSlot, ContractSlotProps } from "@/components/contracts"

/**
 * COMPOSITE - `SurfaceCard`: the bounded surface a region of a screen is drawn on, with its
 * title line already assembled.
 *
 * PORTED FROM THE LIVE PRODUCT, AND THIS IS WHERE THE PORT ACTUALLY BITES. The original owns
 * four things at once: the frame's own classes (`variant="surface" | "nested"`, a padding axis),
 * the header row's classes, the label typography, and the slot plumbing. Only the last two
 * survive the crossing. In this tree a node's classes belong to a registry KEY, so:
 *
 *   - the surface itself is `surface-card` (or `card`, when there is a footer);
 *   - the title line is `section-header` (a title with a fact on its baseline) or `page-header`
 *     (a title with a control at the end of the line);
 *   - and what is left here - which heading level a card title is, which tone a count takes,
 *     how the resting flag reaches every part - is behaviour and domain mapping, which is
 *     exactly what a composite is for.
 *
 * WHAT THAT BUYS. Before this file, three blocks each wrote the same four decisions by hand and
 * one of them wrote a different heading level. A composite is the only place that can be fixed
 * once. What it must NOT become is a second registry: it takes no class, no padding step and no
 * variant, because each of those is a shape, and a shape is a key.
 *
 * THE FOOTER DECIDES THE KEY, NOT A PROP. `card` declares `heading`, `body` and `footer`, and
 * every role a key declares is required - so a card with nothing to close it would be forced to
 * invent a footer. A region whose content ends with its body is a different tree, so it gets a
 * different key. That is the registry's rule working, not a workaround for it.
 */

/** Props for {@link SurfaceCard}. */
export interface SurfaceCardProps {
    /** The already-resolved title of the region. Copy is data, so it arrives translated. */
    label: string
    /**
     * A supporting fact on the title's baseline - a count, a record, a unit. Never an action:
     * it is read as part of the heading sentence, and a control there would be pressed by
     * somebody who meant to read it.
     */
    meta?: string
    /**
     * A control at the end of the title line. Passed UNCALLED, so the resting flag reaches
     * inside it rather than stopping at a node that was already built.
     *
     * It cannot be combined with {@link SurfaceCardProps.meta}: a title line carrying both a
     * fact and a control is a third shape, and no key in the registry describes it. When one is
     * genuinely needed, that is a key to argue for - not a prop to add here.
     */
    action?: ContractSlot
    /** The content the region exists to carry. */
    body: ContractSlot
    /** Closing content below the body - the last thing a reader passes on the way out. */
    footer?: ContractSlot
    /**
     * Which level of the document outline this title is. Defaults to a card title, because that
     * is what this component IS; a caller raising it is telling the outline something true about
     * the page, never making the words bigger.
     */
    level?: HeadingLevel
    /**
     * Renders every part in its resting state - the title's fact, the body, the footer.
     *
     * Means "nothing to show YET", the first load. The TITLE deliberately does not rest: it is
     * copy the caller already holds, so shimmering it would hide a word that is not waiting on
     * anything and leave the region unnamed exactly while a reader is trying to work out what
     * it is.
     */
    isLoading?: boolean
}

/**
 * Draw a region on its own surface.
 *
 * @param props - {@link SurfaceCardProps}
 */
export const SurfaceCard = ({
    label,
    meta,
    action,
    body,
    footer,
    level = 3,
    isLoading = false,
}: SurfaceCardProps) => {
    /** The title itself, at whichever level of the outline the caller named. */
    const Title = () => <Heading level={level}>{label}</Heading>

    /** The `meta` role of the title line: the supporting fact, muted and small. */
    const Meta = ({ isLoading: resting }: ContractSlotProps) => (
        <Text tone="muted" size="sm" isLoading={resting}>
            {meta ?? ""}
        </Text>
    )

    /**
     * The `heading` role of the surface: the title, plus whatever the caller put beside it.
     *
     * Three shapes, one decision, made here rather than at every call site: a bare title, a
     * title with a fact on its baseline, or a title with a control at the end of its line.
     */
    const Header = ({ isLoading: resting }: ContractSlotProps) => {
        if (action) {
            return <Tree contract="page-header" isLoading={resting} slots={{ heading: Title, action }} />
        }
        if (meta !== undefined) {
            return <Tree contract="section-header" isLoading={resting} slots={{ heading: Title, meta: Meta }} />
        }
        return <Title />
    }

    if (footer) {
        return (
            <Tree contract="card" isLoading={isLoading} slots={{ heading: Header, body, footer }} />
        )
    }
    return <Tree contract="surface-card" isLoading={isLoading} slots={{ heading: Header, body }} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "composite", name: "SurfaceCard" } as const
