import type { ReactNode } from "react"

/**
 * ATOM - `Badge`: one classification, said in as few characters as a reader can still parse.
 *
 * A badge is a `meta` role that has been promoted to a shape because the fact it carries is a
 * STATE rather than a number - "draft", "overdue", "beta". That promotion is the whole reason the
 * atom exists, and it is also the reason there should rarely be two of them beside each other: a
 * row of badges is a reader deciding which colour matters, which is a decision the surface was
 * supposed to have already made.
 *
 * WHY `tone` IS A NAME AND NOT A COLOUR. `tone="danger"` says what the state MEANS; `bg-rose-100`
 * says what it looks like today. Only the first one survives a palette change, and only the first
 * one can be read by a test that wants to know whether the overdue case is actually marked as bad.
 *
 * NO `className`. The badge's inset and radius are the badge - a caller that can change them can
 * make one screen's "draft" look unlike every other screen's "draft", and nothing will ever catch
 * it because the difference lives at a call site rather than in a component.
 */

/** What the classification MEANS. Five tones, chosen because a sixth has no distinct meaning. */
export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger"

/** Props for {@link Badge}. */
export interface BadgeProps {
    /** The already-resolved label. Short by nature - a badge that wraps is a sentence in disguise. */
    children: ReactNode
    /** What the state means, not what it looks like. */
    tone?: BadgeTone
    /**
     * Renders the resting shape: same pill, no readable glyphs.
     *
     * MEANS "nothing to show YET" - the first load, no data in hand, which is exactly SWR's
     * `isLoading`. It does NOT mean "a request is in flight": `isValidating` goes true on every
     * focus revalidation, and passing it here would blank a state the reader is already reading.
     */
    isLoading?: boolean
}

/** Pill shape and inset. Part of the badge itself, so it is owned here and nowhere else. */
const BASE_CLASSES = "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium"

/**
 * The meaning of each tone, spelled as colour in exactly one place.
 *
 * Each fill is a translucent tint of its hue rather than a fixed light/dark pair, so one class
 * is legible on either page surface - `globals.css` owns which surface that is, and a badge that
 * had to be told would be a badge with two chances to be told wrong. `neutral` adds no ink of its
 * own for the same reason: the page ink is already the right colour.
 */
const TONE_CLASSES = {
    neutral: "bg-slate-500/15",
    accent: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
    success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    danger: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
} as const

/**
 * The resting shape - the pill keeps its width so the row above it does not reflow. It REPLACES
 * the tone rather than layering over it: two `bg-*` utilities on one node resolve by stylesheet
 * order, not by the order they were typed, so a tint that only usually wins is not a shape.
 */
const RESTING_CLASSES = "animate-pulse select-none bg-slate-500/20 text-transparent"

/**
 * Draw one classification.
 *
 * @param props - {@link BadgeProps}
 */
export const Badge = ({ children, tone = "neutral", isLoading = false }: BadgeProps) => {
    const classes = [BASE_CLASSES, isLoading ? RESTING_CLASSES : TONE_CLASSES[tone]].filter(Boolean).join(" ")
    return (
        <span
            data-tier="atom"
            data-component="Badge"
            data-tone={tone}
            data-loading={isLoading ? "true" : "false"}
            aria-hidden={isLoading ? true : undefined}
            className={classes}
        >
            {children}
        </span>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "atom", name: "Badge" } as const
