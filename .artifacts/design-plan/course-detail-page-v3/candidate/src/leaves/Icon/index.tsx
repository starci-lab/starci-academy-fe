import { StarIcon } from "@heroicons/react/24/outline"

/**
 * THE ICON LEAF, carrying the one meaning this candidate proposes.
 *
 * It lives at `leaves/Icon/index.tsx` because that is the single path permitted to name a Heroicon
 * - the rule is written against the path, and satisfying it by living there is the point rather
 * than a way around it. Apply does not port this file: it adds `"star"` to `IconName` and one entry
 * to `GLYPHS` in the real leaf, and every call site below becomes the real `Icon`.
 *
 * ONE meaning, not two. A filled star would need `24/solid`, which is not one of StarCi's two glyph
 * families, and telling filled from empty by colour is refused by ICON-5. So the run draws the
 * SCALE and the number beside it carries the value.
 */

/** What this candidate's icon can mean. */
export type CandidateIconName = "star"

/** Props for {@link IconCandidate}. */
export interface IconCandidateProps {
    /** What this icon means. The glyph follows from it. */
    readonly name: CandidateIconName
}

/**
 * Draw one glyph by meaning.
 *
 * @param input - {@link IconCandidateProps}
 * @returns The glyph, inheriting colour from its surroundings.
 */
export const IconCandidate = ({ name }: IconCandidateProps) => {
    if (name !== "star") throw new Error(`Unknown icon: ${name}`)
    return <StarIcon aria-hidden className="size-4" />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
