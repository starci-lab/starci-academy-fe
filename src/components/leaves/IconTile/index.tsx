import { skeletonVariants } from "@heroui/react"
import { Icon, type IconName } from "@/components/leaves/Icon"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `IconTile`: a glyph on a filled plate, for the one mark that leads a row.
 *
 * WHY IT EXISTS RATHER THAN A DIV AROUND AN ICON. The plate is a size, a radius and a soft fill
 * that have to agree with each other; a caller assembling them by hand agrees differently on the
 * next screen. Here it is one decision, made once.
 *
 * TONE IS A MEANING. The fill and its foreground travel together, so contrast is the theme's
 * problem rather than a guess made per screen.
 */

/** What the plate is saying about the thing it leads. */
export type IconTileTone = "neutral" | "accent" | "success" | "warning" | "danger"

/** Two plate steps; the glyph inside remains the one fixed leading size. */
export type IconTileSize = "sm" | "md"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type IconTileData = {
    /** The meaning drawn on the plate. */
    readonly icon: IconName
    /**
     * The artwork of the thing this marks, when it has any.
     *
     * A COURSE HAS A FACE, and the plate is where a reader looks for it. Given one, the tile shows
     * it and the glyph stands down: a book drawn beside twelve courses says only "course" twelve
     * times, while the artwork says WHICH course before the title is read. Absent or failed, the
     * glyph is still there, which is why this is one leaf rather than two that disagree about the
     * plate's size, radius and fill.
     */
    readonly image?: string | null
    /** What the plate is saying. */
    readonly tone?: IconTileTone
    /** The step. */
    readonly size?: IconTileSize
}

/** Props for {@link IconTile}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type IconTileProps = LeafProps<IconTileData>

/** The fill and its foreground, always as a pair. */
const TONE_CLASSES = {
    neutral: "bg-default text-muted",
    accent: "bg-accent-soft text-accent-soft-foreground",
    success: "bg-success-soft text-success-soft-foreground",
    warning: "bg-warning-soft text-warning-soft-foreground",
    danger: "bg-danger-soft text-danger-soft-foreground",
} as const

/** The plate per step. */
const SIZE_CLASSES = { sm: "size-8 rounded-lg", md: "size-10 rounded-xl" } as const

/** Centres the glyph and stops the plate being squeezed inside a row. */
const BASE_CLASSES = "inline-flex shrink-0 items-center justify-center overflow-hidden"

/** Artwork fills the plate and is clipped by it, so the tile keeps one silhouette either way. */
const IMAGE_CLASSES = "size-full object-cover"

/** The resting shape - the plate at its real size, no glyph. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base()

/**
 * Draw a glyph on a plate.
 *
 * @param input - {@link IconTileProps}
 */
export const IconTile = ({ props, isLoading = false }: IconTileProps) => {
    const tone = props.tone ?? "neutral"
    const size = props.size ?? "sm"
    // The artwork replaces the fill as well as the glyph: a soft plate behind a photograph is a
    // colour nobody sees, and it would tint the one pixel row where the image does not reach.
    const showsImage = !isLoading && props.image !== undefined && props.image !== null && props.image !== ""
    return (
        <span
            data-tier="leaf"
            data-component="IconTile"
            data-tone={tone}
            data-size={size}
            data-artwork={showsImage ? "true" : "false"}
            data-loading={isLoading ? "true" : "false"}
            aria-hidden={isLoading ? true : undefined}
            className={[
                BASE_CLASSES,
                SIZE_CLASSES[size],
                isLoading ? RESTING_CLASSES : showsImage ? "" : TONE_CLASSES[tone],
            ].join(" ")}
        >
            {isLoading ? null : showsImage
                // Decorative: the row states the course by name on the very next line, so a reader
                // who cannot see the artwork gains nothing from hearing its file described.
                ? <img src={props.image ?? ""} alt="" className={IMAGE_CLASSES} />
                : <Icon props={{ name: props.icon, role: "leading" }} />}
        </span>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
