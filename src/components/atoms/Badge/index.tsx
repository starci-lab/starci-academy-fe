import { Chip, skeletonVariants } from "@heroui/react"
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
 * WHAT IT DRAWS. HeroUI's `Chip` in its `soft` variant, which is the vendor's own tinted pairing:
 * the fill is the tone at low alpha and the label is the same tone's soft foreground, with the
 * contrast already tuned. That pairing is exactly what a hand-mixed `bg-<hue>/10 text-<hue>` gets
 * wrong - it passes review on white and fails it in the dark theme, once, quietly.
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

/**
 * The meaning of each tone, mapped once onto the vendor's colour token. `neutral` is the
 * vendor's `default`, which is the tone that claims nothing rather than a sixth hue.
 */
const TONE_COLORS = {
    neutral: "default",
    accent: "accent",
    success: "success",
    warning: "warning",
    danger: "danger",
} as const

/** The resting shape - the pill keeps its width so the row above it does not reflow. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
    className: "select-none text-transparent",
})

/**
 * Draw one classification.
 *
 * @param props - {@link BadgeProps}
 */
export const Badge = ({ children, tone = "neutral", isLoading = false }: BadgeProps) => (
    <Chip
        data-tier="atom"
        data-component="Badge"
        data-tone={tone}
        data-loading={isLoading ? "true" : "false"}
        aria-hidden={isLoading ? true : undefined}
        color={TONE_COLORS[tone]}
        variant="soft"
        size="sm"
        className={isLoading ? RESTING_CLASSES : undefined}
    >
        {children}
    </Chip>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "atom", name: "Badge" } as const
