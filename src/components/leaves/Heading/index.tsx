import { Typography } from "@heroui/react"
import { getHeadingClassName } from "./classNames"

/**
 * LEAF - `Heading`: the name of a thing, at a level of the document outline.
 *
 * `level` DRIVES BOTH THE TAG AND THE SET, so the outline a screen reader walks and the sizes a
 * reader sees can never disagree. A caller raising the level is saying something true about the
 * page, never making the words bigger.
 */

/** How deep in the outline this title sits. Four levels is as deep as a page should go. */
export type HeadingLevel = 1 | 2 | 3 | 4

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type HeadingData = {
    /** The already-resolved title. Absent while loading. */
    readonly content?: string
    /** Which level of the document outline this is. */
    readonly level?: HeadingLevel
}

/** Props for {@link Heading}. Three fixed slots, no fourth. */
export type HeadingProps = { readonly props: HeadingData; readonly isLoading?: boolean }

/**
 * The set per outline level - the tag comes from `level`, these are the type metrics.
 *
 * THE STEP FROM 2 TO 3 IS A WEIGHT, NOT A SIZE, and that is deliberate. A section label repeats
 * down a whole column; set at the same weight as the surface title above it, a screenful of them
 * reads as a dozen competing titles rather than as the names of the things under them. Dropping to
 * medium is enough to rank them without making the words harder to read, which another size step
 * down would.
 */

/** The resting shape - the same line box with the glyphs out. */

/** Resting keeps the level's own metrics, so the line box does not change when text lands. */

/**
 * Draw a title.
 *
 * @param input - {@link HeadingProps}
 */
export const Heading = (props: HeadingProps) => {
    const level = props.props.level ?? 2
    const isLoading = props.isLoading === true
    return (
        <Typography.Heading
            data-level={level}
            data-loading={isLoading ? "true" : "false"}
            aria-hidden={isLoading ? true : undefined}
            level={level}
            className={getHeadingClassName(level, isLoading)}
        >
            {props.props.content ?? ""}
        </Typography.Heading>
    )
}
