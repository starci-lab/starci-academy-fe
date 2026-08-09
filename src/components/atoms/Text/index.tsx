import type { ReactNode } from "react"

/**
 * ATOM - `Text`: the prose a node exists to carry, and the secondary facts beside it.
 *
 * One atom covers the registry's `body` and `meta` roles because the difference between them is
 * not a different component - it is a `tone`. A count under a section heading and a paragraph in
 * a card are the same thing typographically: resolved copy, at one of two weights of attention.
 * Splitting them into `BodyText` and `MetaText` would buy two files and one more name to keep in
 * step, and the first time somebody wanted quiet body copy they would reach for the wrong one.
 *
 * WHY `<p>` AND NOT `<span>`. A `<p>` is a flex item like anything else, so it aligns on the
 * baseline in `section-header` and stacks in `stat` without the atom knowing which it is in. It
 * also survives being read aloud, which a `<span>` full of sentences does not.
 *
 * NO `className`, NO `style`, NO MARGIN. Every gap around this text belongs to the registry key
 * above it. An atom that could set its own margin would make the same seam settable from two
 * places, and the one at the call site always wins quietly.
 */

/** How loudly this text asks to be read. `muted` is for facts that support the body, never for body. */
export type TextTone = "default" | "muted"

/** The two text sizes the dashboard actually distinguishes between. */
export type TextSize = "sm" | "md"

/** Props for {@link Text}. */
export interface TextProps {
    /** The already-resolved copy. Translation belongs to the connected file, not to an atom. */
    children: ReactNode
    /** Whether this is the content itself or a supporting fact beside it. */
    tone?: TextTone
    /** The reading size. Two steps, because a third is a decision nobody can make consistently. */
    size?: TextSize
    /**
     * Renders the resting shape: same measure, no readable glyphs.
     *
     * MEANS "nothing to show YET" - the first load, no data in hand, which is exactly SWR's
     * `isLoading`. It does NOT mean "a request is in flight": `isValidating` goes true on every
     * focus revalidation, and passing it here would replace a sentence mid-read with a shimmer.
     */
    isLoading?: boolean
}

/**
 * The whole difference between body copy and the facts that support it. `default` adds nothing,
 * because the page ink is already the right colour and `globals.css` owns it; `muted` is that
 * same ink held back rather than a second colour, so it stays correct on either page surface
 * without this atom knowing which one it is on.
 */
const TONE_CLASSES = {
    default: "",
    muted: "opacity-70",
} as const

/** Size per step. */
const SIZE_CLASSES = {
    sm: "text-sm",
    md: "text-base",
} as const

/** Wrapping behaviour shared by both tones. */
const BASE_CLASSES = "text-pretty"

/** The resting shape - the same line box, with the glyphs taken out of it. */
const RESTING_CLASSES = "animate-pulse select-none rounded bg-slate-500/20 text-transparent"

/**
 * Draw resolved copy at one of two weights of attention.
 *
 * @param props - {@link TextProps}
 */
export const Text = ({ children, tone = "default", size = "md", isLoading = false }: TextProps) => {
    const classes = [BASE_CLASSES, SIZE_CLASSES[size], TONE_CLASSES[tone], isLoading && RESTING_CLASSES]
        .filter(Boolean)
        .join(" ")
    return (
        <p
            data-tier="atom"
            data-component="Text"
            data-tone={tone}
            data-size={size}
            data-loading={isLoading ? "true" : "false"}
            aria-hidden={isLoading ? true : undefined}
            className={classes}
        >
            {children}
        </p>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "atom", name: "Text" } as const
