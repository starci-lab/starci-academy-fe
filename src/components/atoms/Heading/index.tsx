import type { ElementType, ReactNode } from "react"

/**
 * ATOM - `Heading`: the name of a thing.
 *
 * This is the atom the registry's `heading` role is drawn with. It owns exactly one decision -
 * how a title LOOKS and which element carries it - and it owns nothing about where that title
 * sits, because the node above it already decided that. `page-header` puts the heading on the
 * title line, `section-header` puts it on a baseline beside a count, `card-header` puts it after
 * the media. Three different placements, one appearance, and the atom never learns which of the
 * three it is in.
 *
 * WHY THERE IS NO `className`. A caller who can reach in is a caller who can make this heading
 * different from every other heading on the site, and that difference then lives at the call
 * site where no other screen can find it. The lint rule that bans the prop is only the fence;
 * the fact behind it is that a heading which varies per call site is not a heading, it is a
 * div with an opinion.
 *
 * WHY `level` AND NOT A SIZE. The tag is the part a screen reader depends on, so it is the part
 * the caller has to name. Size follows from the level rather than being chosen separately -
 * otherwise the visual order and the document outline drift apart, which is the exact bug that
 * makes a page unreadable to everyone not looking at it.
 */

/**
 * The heading levels this atom draws. Four is the whole vocabulary: `h1` for the page, `h2` for
 * a section, `h3` for a card, `h4` for a row inside one. A fifth level would mean the page has
 * nested deeper than a reader can hold, which is a structure problem rather than a style one.
 */
export type HeadingLevel = 1 | 2 | 3 | 4

/** Props for {@link Heading}. */
export interface HeadingProps {
    /** The already-resolved title text. Copy is data, so it arrives translated. */
    children: ReactNode
    /** Which level of the document outline this title is - drives both the tag and the size. */
    level?: HeadingLevel
    /** Renders the resting shape: same tag, same measure, no readable text. */
    isSkeleton?: boolean
}

/** The element each level renders, so the visual order and the document outline cannot drift. */
const TAGS = {
    1: "h1",
    2: "h2",
    3: "h3",
    4: "h4",
} as const

/** The intrinsic appearance of each level. Never spacing - the node above owns that. */
const LEVEL_CLASSES = {
    1: "text-3xl font-semibold tracking-tight",
    2: "text-2xl font-semibold tracking-tight",
    3: "text-lg font-semibold",
    4: "text-base font-semibold",
} as const

/**
 * Wrapping, shared by every level. There is deliberately NO text colour here: `globals.css` owns
 * the page ink, and a colour restated in an atom is a second place for the theme to disagree with
 * itself - the light theme gets fixed, the dark one does not, and nobody finds out for a month.
 */
const BASE_CLASSES = "text-balance"

/**
 * The resting shape. It keeps the heading's own measure and hides only the glyphs, so the
 * shimmer is the real heading at rest rather than a second description of it. The fill is a
 * translucent tint rather than a fixed grey, so it works on either page surface without the
 * atom knowing which one it is on.
 */
const RESTING_CLASSES = "animate-pulse select-none rounded bg-slate-500/20 text-transparent"

/**
 * Draw a title at one level of the document outline.
 *
 * @param props - {@link HeadingProps}
 */
export const Heading = ({ children, level = 2, isSkeleton = false }: HeadingProps) => {
    // Typed as `ElementType` rather than left as the literal union: the four tags accept the same
    // attributes anyway, and a union of intrinsic names is the one JSX shape that reads badly.
    const Tag: ElementType = TAGS[level]
    const classes = [BASE_CLASSES, LEVEL_CLASSES[level], isSkeleton && RESTING_CLASSES].filter(Boolean).join(" ")
    return (
        <Tag
            data-tier="atom"
            data-component="Heading"
            data-level={level}
            data-skeleton={isSkeleton ? "true" : "false"}
            aria-hidden={isSkeleton ? true : undefined}
            className={classes}
        >
            {children}
        </Tag>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "atom", name: "Heading" } as const
