import { Typography, skeletonVariants } from "@heroui/react"
import type { ReactNode } from "react"
import { Icon, type IconName } from "@/components/atoms/Icon"

/**
 * ATOM - `Text`: the prose a node exists to carry, and the secondary facts beside it.
 *
 * One atom covers the registry's `body` and `meta` roles because the difference between them is
 * not a different component - it is a `tone`. A count under a section heading and a paragraph in
 * a card are the same thing typographically: resolved copy, at one of two weights of attention.
 * Splitting them into `BodyText` and `MetaText` would buy two files and one more name to keep in
 * step, and the first time somebody wanted quiet body copy they would reach for the wrong one.
 *
 * WHAT IT DRAWS. `Typography.Paragraph` from HeroUI, so the size and its line height arrive as a
 * pair from the theme rather than as two utilities that can be chosen apart - the pairing is what
 * makes two paragraphs at different sizes look like one typeface. `tone` maps to the vendor's
 * `color`, which resolves to `--foreground` and `--muted`; the atom never spells a colour.
 *
 * WHY `<p>` AND NOT `<span>`. A `<p>` is a flex item like anything else, so it aligns on the
 * baseline in `section-header` and stacks in `stat` without the atom knowing which it is in. It
 * also survives being read aloud, which a `<span>` full of sentences does not.
 *
 * WHY THE LIVE REGION IS A PROP AND NOT A SECOND COMPONENT. A refusal that is only visible has
 * not been delivered: a reader who is not looking at the form never learns the code was wrong.
 * `live` is therefore part of what this atom is FOR - saying something - rather than a styling
 * hatch, and it takes the two values that actually differ in meaning: `assertive` interrupts,
 * `polite` waits for a gap. Getting them the wrong way round announces a wrong code as calmly as
 * a code being sent, which is why the caller has to name one.
 *
 * NO `className`, NO `style`, NO MARGIN. Every gap around this text belongs to the registry key
 * above it. An atom that could set its own margin would make the same seam settable from two
 * places, and the one at the call site always wins quietly.
 */

/** How loudly this text asks to be read. `muted` is for facts that support the body, never for body. */
export type TextTone = "default" | "muted"

/** The two text sizes the dashboard actually distinguishes between. */
export type TextSize = "sm" | "md"

/**
 * How firmly the words are set. Two steps, and only for body text: a weight pushed onto a
 * heading either does nothing or fights the step that is already baked into it. `medium` is what
 * makes a row's label read before the fact beside it without either of them changing size.
 */
export type TextWeight = "normal" | "medium"

/**
 * Whether this line is announced when it changes, and how urgently.
 *
 * `off` is an ordinary paragraph: assistive technology reads it when the reader gets to it.
 * `polite` is a `status` - the code is on its way, said in passing. `assertive` is an `alert` -
 * the code was refused, said now, because the reader is about to press the button again.
 */
export type TextLive = "off" | "polite" | "assertive"

/** Props for {@link Text}. */
export interface TextProps {
    /** The already-resolved copy. Translation belongs to the connected file, not to an atom. */
    children: ReactNode
    /** Whether this is the content itself or a supporting fact beside it. */
    tone?: TextTone
    /** The reading size. Two steps, because a third is a decision nobody can make consistently. */
    size?: TextSize
    /** How firmly the words are set. */
    weight?: TextWeight
    /**
     * The meaning drawn ahead of the words, when the words alone are slower to find. The glyph
     * inherits this paragraph's own colour, so a muted line gets a muted icon for free.
     */
    icon?: IconName
    /** Whether a change to this line is announced, and how urgently. */
    live?: TextLive
    /**
     * Renders the resting shape: same measure, no readable glyphs.
     *
     * MEANS "nothing to show YET" - the first load, no data in hand, which is exactly SWR's
     * `isLoading`. It does NOT mean "a request is in flight": `isValidating` goes true on every
     * focus revalidation, and passing it here would replace a sentence mid-read with a shimmer.
     */
    isLoading?: boolean
}

/** The tone, said once, as the vendor's own token pair rather than as a colour. */
const TONE_COLORS = {
    default: "default",
    muted: "muted",
} as const

/** The size step, as the vendor names it. */
const SIZE_STEPS = {
    sm: "sm",
    md: "base",
} as const

/**
 * The role a live line carries. `off` is not a live region at all, so it takes no role - a
 * paragraph that claimed `role="status"` while saying nothing would announce every re-render.
 */
const LIVE_ROLES = {
    off: undefined,
    polite: "status",
    assertive: "alert",
} as const

/** Keeps the icon on the text baseline without the paragraph learning it is in a row. */
const WITH_ICON_CLASSES = "inline-flex items-center gap-2"

/** The resting shape - the same line box, wearing the vendor's skeleton, with the glyphs out. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
    className: "select-none text-transparent",
})

/**
 * Draw resolved copy at one of two weights of attention.
 *
 * @param props - {@link TextProps}
 */
export const Text = ({
    children,
    tone = "default",
    size = "md",
    weight = "normal",
    icon,
    live = "off",
    isLoading = false,
}: TextProps) => {
    // The icon is dropped while the line rests: the skeleton already covers the whole measure,
    // and a glyph shimmering beside it would be a second thing to look at where there is
    // nothing to read yet.
    const showsIcon = icon !== undefined && !isLoading
    const iconClasses = showsIcon ? WITH_ICON_CLASSES : undefined
    return (
        <Typography.Paragraph
            data-tier="atom"
            data-component="Text"
            data-tone={tone}
            data-size={size}
            data-live={live}
            data-loading={isLoading ? "true" : "false"}
            aria-hidden={isLoading ? true : undefined}
            role={LIVE_ROLES[live]}
            color={TONE_COLORS[tone]}
            size={SIZE_STEPS[size]}
            weight={weight}
            className={isLoading ? RESTING_CLASSES : iconClasses}
        >
            {showsIcon && icon !== undefined ? <Icon name={icon} size="sm" /> : null}
            {children}
        </Typography.Paragraph>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "atom", name: "Text" } as const
