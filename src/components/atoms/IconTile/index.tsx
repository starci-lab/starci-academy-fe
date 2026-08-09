import { skeletonVariants } from "@heroui/react"
import { Icon, type IconName } from "@/components/atoms/Icon"

/**
 * ATOM - `IconTile`: a glyph in a tinted box.
 *
 * Ported from the live product, where it is the frame every leading icon sits in. It exists as a
 * component for one reason, which the canon states outright: writing
 * `<div className="rounded-2xl bg-accent-soft p-3">` to fake one is the exact move to avoid. A
 * faked tile is a tint chosen at a call site, and the second call site chooses a slightly
 * different one - which is how a product ends up with four accent boxes at four alphas.
 *
 * WHY THE FILL AND THE GLYPH TRAVEL TOGETHER. Each tone is ONE entry mapping to a PAIR - the
 * soft background and its matching soft foreground - so the glyph can never be set from one
 * place and its box from another. The icon itself is never given a colour: it inherits the
 * tile's `text-*`, which is what makes the pairing hold.
 *
 * WHY THE RADIUS FOLLOWS THE SIZE. A small box with a large radius reads as a pill and a large
 * box with a small one reads as a screenshot; the two steps below are the pairings the product
 * already uses, so a caller picks a size and gets the corner that belongs to it.
 */

/** What the thing inside the tile MEANS. Five tones, the same five the badge classifies with. */
export type IconTileTone = "neutral" | "accent" | "success" | "warning" | "danger"

/** The two steps. `sm` leads a row, `md` heads an empty state. */
export type IconTileSize = "sm" | "md"

/** Props for {@link IconTile}. */
export interface IconTileProps {
    /** Which meaning is drawn inside the tile. */
    icon: IconName
    /** What that meaning is - the tint and the glyph colour together. */
    tone?: IconTileTone
    /** The step. */
    size?: IconTileSize
    /** Renders the resting shape: the same box at the same size, with nothing in it. */
    isLoading?: boolean
}

/**
 * The tone, said once, as a PAIR. `neutral` takes the default fill with muted ink rather than a
 * sixth hue, because a tile that carries no judgement should not look like it carries one.
 */
const TONE_CLASSES = {
    neutral: "bg-default text-muted",
    accent: "bg-accent-soft text-accent-soft-foreground",
    success: "bg-success-soft text-success-soft-foreground",
    warning: "bg-warning-soft text-warning-soft-foreground",
    danger: "bg-danger-soft text-danger-soft-foreground",
} as const

/** Box and corner per step - the radius scales with the box, never chosen apart from it. */
const SIZE_CLASSES = {
    sm: "size-8 rounded-lg",
    md: "size-10 rounded-xl",
} as const

/** True of every tile: it centres its glyph and never shrinks inside a row. */
const BASE_CLASSES = "inline-flex shrink-0 items-center justify-center"

/** The resting shape - the same box, shimmering, with no glyph in it. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base()

/**
 * Draw a glyph in its tile.
 *
 * @param props - {@link IconTileProps}
 */
export const IconTile = ({ icon, tone = "neutral", size = "sm", isLoading = false }: IconTileProps) => (
    <span
        data-tier="atom"
        data-component="IconTile"
        data-tone={tone}
        data-size={size}
        data-loading={isLoading ? "true" : "false"}
        aria-hidden={isLoading ? true : undefined}
        className={[
            BASE_CLASSES,
            SIZE_CLASSES[size],
            isLoading ? RESTING_CLASSES : TONE_CLASSES[tone],
        ].join(" ")}
    >
        {isLoading ? null : <Icon name={icon} size={size === "sm" ? "sm" : "md"} isEmphasised />}
    </span>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "atom", name: "IconTile" } as const
