import { Typography, skeletonVariants } from "@heroui/react"
import type { ReactNode } from "react"

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
 * WHAT IT DRAWS. `Typography.Heading` from HeroUI, which owns the tag and the tracking, with
 * the SIZE of each step set here. The vendor is imported HERE and only here - blocks, pages and
 * overlays reach the scale through this atom.
 *
 * WHY THE SIZE IS OURS AND NOT THE VENDOR'S. HeroUI's heading steps are a marketing scale -
 * `h1` at 36px, `h2` at 30px - and an application screen built on it reads as a wireframe: four
 * display-sized lines stacked down a page whose content is 14px. The live product's own scale
 * is dense, and this is it: the page title is one step above body, and a section title IS body
 * size carrying more weight. Hierarchy on a working screen comes from weight and seam, not from
 * size - which is exactly what the utilities below say, in one file, for every heading there is.
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
    /**
     * Renders the resting shape: same tag, same measure, no readable text.
     *
     * MEANS "nothing to show YET" - the first load, no data in hand, which is exactly SWR's
     * `isLoading`. It does NOT mean "a request is in flight": `isValidating` goes true on every
     * focus revalidation, and passing it here would hide a title the reader is reading by.
     */
    isLoading?: boolean
}

/**
 * The product's own heading scale - dense, four steps, ported from the live app.
 *
 * `1` is the page title at one step above body; `2` is a section title at body size with more
 * weight; `3` and `4` are a card title and a row title, both at the small body step. Every step
 * overrides the vendor's own font-size class, which sits in the `components` layer and therefore
 * loses to a utility - the one place in the tree where our scale and HeroUI's disagree.
 */
const LEVEL_CLASSES = {
    1: "text-xl font-semibold tracking-tight",
    2: "text-base font-semibold",
    3: "text-sm font-semibold",
    4: "text-sm font-medium",
} as const

/**
 * The resting shape, borrowed from the vendor's own skeleton rather than described a second
 * time. The heading keeps its TAG and its measure and wears the skeleton's fill and shimmer -
 * one shape in two states, which is the only arrangement that cannot drift. `text-transparent`
 * takes the glyphs out; the measure they set is what stops the row reflowing when the real
 * title lands.
 */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
    className: "select-none text-transparent",
})

/** Each level's own appearance, plus the skeleton fill when the title has not arrived. */
const RESTING_LEVEL_CLASSES = {
    1: LEVEL_CLASSES[1].concat(" ", RESTING_CLASSES),
    2: LEVEL_CLASSES[2].concat(" ", RESTING_CLASSES),
    3: LEVEL_CLASSES[3].concat(" ", RESTING_CLASSES),
    4: LEVEL_CLASSES[4].concat(" ", RESTING_CLASSES),
} as const

/**
 * Draw a title at one level of the document outline.
 *
 * @param props - {@link HeadingProps}
 */
export const Heading = ({ children, level = 2, isLoading = false }: HeadingProps) => (
    <Typography.Heading
        data-tier="atom"
        data-component="Heading"
        data-level={level}
        data-loading={isLoading ? "true" : "false"}
        aria-hidden={isLoading ? true : undefined}
        level={level}
        className={isLoading ? RESTING_LEVEL_CLASSES[level] : LEVEL_CLASSES[level]}
    >
        {children}
    </Typography.Heading>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "atom", name: "Heading" } as const
