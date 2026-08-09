import { Badge } from "@/components/atoms/Badge"
import { badgeToneFor, type SemanticVerdict } from "@/components/composites/_semantic-contracts"

/**
 * BLOCK - `RankDeltaCaret`: which way somebody moved on a board since last time.
 *
 * PORTED FROM THE LIVE PRODUCT, where the direction was carried by a caret glyph and a colour
 * and nothing else - a green up arrow, a red down arrow, a muted dash - so the entire fact was
 * unavailable to a reader who cannot see colour, and the arrow was announced to nobody. Here
 * the movement arrives as WORDS the caller has already formatted, and the tone only agrees with
 * what the words already say.
 *
 * NO BASELINE IS NOT NO MOVEMENT. The original drew an empty span in that case, sized by a
 * width the CALLER passed in, purely to stop the column beside it sliding right. That is the
 * kind of fix a tree with no key for the row needs; here the row is a key that lines its own
 * columns up, so an absent baseline renders nothing at all and the neighbours stay put anyway.
 *
 * UNCHANGED IS A REAL ANSWER. It keeps its badge - a reader looking for movement needs to see
 * that the question was asked and answered, not an empty space that could equally mean the
 * figure never arrived.
 */

/**
 * What a movement MEANS. Climbing is an achievement, dropping needs attention, and standing
 * still is a fact carrying no judgement - which is why it is `neutral` rather than a failure.
 *
 * @param delta - Places gained since the last period; negative means places lost.
 */
export const rankDeltaVerdict = (delta: number): SemanticVerdict => {
    if (delta > 0) return "passed"
    if (delta < 0) return "attention"
    return "neutral"
}

/** Props for {@link RankDeltaCaret}. */
export interface RankDeltaCaretProps {
    /**
     * Places gained since the last period - negative for places lost, zero for no movement,
     * and `null` when there is no previous period to compare with. `null` is not zero: one
     * says the learner held their place, the other says nobody knows yet.
     */
    delta: number | null
    /**
     * The already-formatted movement - "up 2", "down 1", "no change". Copy is data: the sign,
     * the word and the plural all belong to whoever holds the locale.
     */
    label: string
}

/**
 * Draw which way somebody moved - or draw nothing, when there is nothing to compare with.
 *
 * @param props - {@link RankDeltaCaretProps}
 */
export const RankDeltaCaret = ({ delta, label }: RankDeltaCaretProps) => {
    if (delta === null) return null
    return <Badge tone={badgeToneFor(rankDeltaVerdict(delta))}>{label}</Badge>
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "block", name: "RankDeltaCaret" } as const
