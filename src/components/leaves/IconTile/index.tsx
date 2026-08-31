import { Icon, type IconName } from "@/components/leaves/Icon"
import { getIconTileClassName, iconTileImageClassName } from "./classNames"

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

/** Props for {@link IconTile}. Three fixed slots, no fourth. */
export type IconTileProps = { readonly props: IconTileData; readonly isLoading?: boolean }

/** The fill and its foreground, always as a pair. */
/**
 * Draw a glyph on a plate.
 *
 * @param input - {@link IconTileProps}
 */
export const IconTile = (props: IconTileProps) => {
    const tone = props.props.tone ?? "accent"
    const size = props.props.size ?? "sm"
    const isLoading = props.isLoading === true
    // The artwork replaces the fill as well as the glyph: a soft plate behind a photograph is a
    // colour nobody sees, and it would tint the one pixel row where the image does not reach.
    const image = props.props.image
    const showsImage = !isLoading && image !== undefined && image !== null && image !== ""
    return (
        <span
            data-tone={tone}
            data-size={size}
            data-artwork={showsImage ? "true" : "false"}
            data-loading={isLoading ? "true" : "false"}
            aria-hidden={isLoading ? true : undefined}
            className={getIconTileClassName(tone, size, isLoading, showsImage)}
        >
            {isLoading ? null : showsImage
                // Decorative: the row states the course by name on the very next line, so a reader
                // who cannot see the artwork gains nothing from hearing its file described.
                ? <img src={image} alt="" className={iconTileImageClassName} />
                : <Icon props={{ name: props.props.icon, role: "leading" }} />}
        </span>
    )
}
