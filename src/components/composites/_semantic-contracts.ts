import type { BadgeTone } from "@/components/atoms/Badge"
import type { IconTileTone } from "@/components/atoms/IconTile"

/**
 * THE SEMANTIC CONTRACTS - what a state MEANS, resolved once into what each atom calls it.
 *
 * PORTED FROM THE LIVE PRODUCT, where the same file resolves a semantic variant into the chrome
 * variant a component wears. It exists for one reason: a surface knows that an attempt PASSED,
 * and two different atoms have two different vocabularies for saying so - the badge calls it
 * `success`, the tile calls it `success`, and the day the two disagree, every screen that maps
 * them by hand disagrees differently.
 *
 * WHY A MODULE AND NOT A PROP. A composite that took the atom's own tone would be asking its
 * caller to already know the atom's vocabulary, which is the coupling the tone names were
 * invented to remove. The caller names the STATE; this file names the tone.
 *
 * IT HOLDS NO COLOUR. Every value here is a token name that resolves in `globals.css`; a hue
 * written into this file would be a second palette with no theme behind it.
 */

/**
 * What a graded or settled thing turned out to be.
 *
 * Five values, because a sixth has no distinct meaning on a screen: something is finished, under
 * way, needs attention, has failed, or is simply a fact carrying no judgement. `progress` is the
 * one that is easy to forget and the one a learning product needs most - a course at forty per
 * cent is neither a success nor a warning, and calling it either says something untrue.
 */
export type SemanticVerdict = "passed" | "progress" | "attention" | "failed" | "neutral"

/** The badge tone each verdict is said with. */
const BADGE_TONES: Record<SemanticVerdict, BadgeTone> = {
    passed: "success",
    progress: "accent",
    attention: "warning",
    failed: "danger",
    neutral: "neutral",
}

/** The tile tone each verdict is said with - the same four meanings, the other vocabulary. */
const TILE_TONES: Record<SemanticVerdict, IconTileTone> = {
    passed: "success",
    progress: "accent",
    attention: "warning",
    failed: "danger",
    neutral: "neutral",
}

/**
 * Resolve a verdict into the tone a badge wears.
 *
 * @param verdict - What the thing turned out to be.
 */
export const badgeToneFor = (verdict: SemanticVerdict): BadgeTone => BADGE_TONES[verdict]

/**
 * Resolve a verdict into the tone an icon tile wears.
 *
 * @param verdict - What the thing turned out to be.
 */
export const iconTileToneFor = (verdict: SemanticVerdict): IconTileTone => TILE_TONES[verdict]

/**
 * Resolve a completion figure into what it MEANS.
 *
 * Derived rather than passed, so a caller cannot mark a half-finished thing as done - which is
 * the one claim a progress readout must never be able to make. Three steps and no more: a
 * per-decile ramp would be six colours carrying one fact, and a rainbow carries none.
 *
 * @param percent - The completion figure, already clamped to 0-100.
 */
export const verdictForPercent = (percent: number): SemanticVerdict => {
    if (percent >= 100) return "passed"
    if (percent > 0) return "progress"
    return "neutral"
}
