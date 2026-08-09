import { Heading, type HeadingLevel } from "@/components/atoms/Heading"
import { IconTile } from "@/components/atoms/IconTile"
import { Text } from "@/components/atoms/Text"
import { Tree } from "@/components/frames/Tree"
import type { IconName } from "@/components/atoms/Icon"
import { iconTileToneFor, type SemanticVerdict } from "@/components/composites/_semantic-contracts"
import type { ContractSlot, ContractSlotProps } from "@/components/contracts"

/**
 * BLOCK - `SectionCard`: a bounded surface whose title line LEADS WITH A GLYPH.
 *
 * PORTED FROM THE LIVE PRODUCT, and the port is mostly subtraction. The original owned six
 * things at once - the radius, the surface, the shadow, the padding, an accent border and a
 * data-driven left band - all of them decided by hand in a `cn(...)` at the top of the file,
 * with the file's own comment admitting it ("BLOCK-5 DEBT, left VISIBLE on purpose: this block
 * decides its own card face, which is a lower tier's job"). In this tree a node's classes
 * belong to a registry KEY, so the whole of that face is `card` / `surface-card` and none of
 * it is spelled here.
 *
 * WHAT IS LEFT IS THE ONE THING THAT MADE IT A DIFFERENT CARD FROM `SurfaceCard`: the glyph.
 * `SurfaceCard` draws a title with a fact on its baseline or a control at the end of its line;
 * neither of those shapes has a place for the tile that says WHAT KIND of thing this card is.
 * `card-header` is that shape, so the icon is REQUIRED here - a section card with no glyph is
 * a `SurfaceCard`, and having two components that draw the same tree is how a codebase ends up
 * with two of everything.
 *
 * WHY THE ACTION MOVED TO THE FOOTER. The original put a control at the right-hand end of the
 * header row, beside the glyph and the title. No key in this registry describes a line holding
 * a glyph, a name AND a control - `card-header` ends at the fact and `page-header` has no place
 * for a glyph - so the control closes the card instead of crowding its title. That is the
 * registry refusing a third shape rather than a feature being dropped: the day that line is
 * genuinely needed it is a key to argue for, not a prop to add here.
 *
 * WHAT IT DOES NOT DO. It does not fetch, and it takes no `className`, no padding step and no
 * `variant`. Each of those is a shape, and a shape is a key.
 */

/** Props for {@link SectionCard}. */
export interface SectionCardProps {
    /** The already-resolved title of the region. Copy is data, so it arrives translated. */
    label: string
    /**
     * The glyph that says what KIND of thing this card holds. Required, because it is the
     * only reason this component exists rather than `SurfaceCard` - see the file header.
     */
    icon: IconName
    /**
     * What the thing this card describes has turned out to be. Named as a MEANING rather than
     * as a colour, so the tile and any badge below it cannot end up saying the same state two
     * different ways - the resolution lives in `_semantic-contracts`.
     */
    verdict?: SemanticVerdict
    /**
     * A supporting fact on the title's baseline - a count, a unit, a record. Never an action:
     * it is read as part of the heading sentence, and a control there would be pressed by
     * somebody who meant to read it.
     */
    meta?: string
    /** The content the card exists to carry. */
    body: ContractSlot
    /** Closing content below the body - the last thing a reader passes on the way out. */
    footer?: ContractSlot
    /**
     * Which level of the document outline this title is. Defaults to a card title, because
     * that is what this component IS; a caller raising it is telling the outline something
     * true about the page, never making the words bigger.
     */
    level?: HeadingLevel
    /**
     * Renders every part in its resting state - the glyph, the fact, the body, the footer.
     * The TITLE deliberately does not rest: it is copy the caller already holds, so shimmering
     * it would leave the region unnamed exactly while a reader is working out what it is.
     */
    isLoading?: boolean
}

/**
 * Draw a titled region whose title is led by a glyph.
 *
 * @param props - {@link SectionCardProps}
 */
export const SectionCard = ({
    label,
    icon,
    verdict = "neutral",
    meta: metaText,
    body,
    footer,
    level = 3,
    isLoading = false,
}: SectionCardProps) => {
    /** The `media` role of the title line: what kind of thing this card holds. */
    const Tile = ({ isLoading: resting }: ContractSlotProps) => (
        <IconTile icon={icon} tone={iconTileToneFor(verdict)} isLoading={resting} />
    )

    /** The `heading` role of the title line, at whichever level of the outline the caller named. */
    const Title = () => <Heading level={level}>{label}</Heading>

    /** The `meta` role of the title line: the supporting fact, muted and small. */
    const Fact = ({ isLoading: resting }: ContractSlotProps) => (
        <Text tone="muted" size="sm" isLoading={resting}>
            {metaText ?? ""}
        </Text>
    )

    /** The `heading` role of the surface: glyph, name, fact - in the order a rail is scanned in. */
    const Header = ({ isLoading: resting }: ContractSlotProps) => (
        <Tree contract="card-header" isLoading={resting} slots={{ media: Tile, heading: Title, meta: Fact }} />
    )

    if (footer) {
        return <Tree contract="card" isLoading={isLoading} slots={{ heading: Header, body, footer }} />
    }
    return <Tree contract="surface-card" isLoading={isLoading} slots={{ heading: Header, body }} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "block", name: "SectionCard" } as const
