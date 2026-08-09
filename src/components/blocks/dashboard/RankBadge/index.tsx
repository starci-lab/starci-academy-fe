import { Badge } from "@/components/atoms/Badge"
import { badgeToneFor, type SemanticVerdict } from "@/components/composites/_semantic-contracts"

/**
 * BLOCK - `RankBadge`: where somebody placed on a board.
 *
 * PORTED FROM THE LIVE PRODUCT's `rankBadge.tsx`, which was not a component at all but three
 * exported functions returning icon art: a medal for each of the first three places, a trophy
 * for everybody else, all of it multicolour emoji artwork pulled from an icon set by string id.
 * None of that crosses: emoji are not allowed in this source, the icon vocabulary here is a
 * closed union of fourteen meanings with no medal in it, and a function returning JSX is a
 * component that has been prevented from having a name.
 *
 * WHAT THE ART WAS ACTUALLY SAYING is the part worth keeping - that the podium is different
 * from the rest of the board. That is a MEANING, so it is said the way every other meaning in
 * this tree is said: as a verdict, resolved into a tone by the one file that owns the mapping.
 * A reader who cannot see colour still reads the place, because the place is words.
 *
 * THE PLACE ARRIVES AS COPY. "1st" and "#1" and "Rank 1" are three different languages'
 * answers to the same fact, so the number is formatted by whoever holds the locale. The rank
 * itself still arrives as a number, because the podium test is arithmetic rather than textual.
 */

/** The last place that counts as the podium - the three the original drew medals for. */
const PODIUM_LAST_PLACE = 3

/**
 * What a place on the board MEANS. The podium is an achievement; everything below it is a
 * fact carrying no judgement, which is exactly what `neutral` is for - calling it a warning
 * or a failure would say something untrue about coming fourth.
 *
 * @param rank - The one-based place on the board.
 */
export const rankVerdict = (rank: number): SemanticVerdict =>
    rank <= PODIUM_LAST_PLACE ? "passed" : "neutral"

/** Props for {@link RankBadge}. */
export interface RankBadgeProps {
    /** The one-based place on the board. Read arithmetically, to find the podium. */
    rank: number
    /** The already-formatted place - "1st", "#1". Copy is data, so it arrives translated. */
    label: string
    /** Nothing to show yet - the badge rests as itself. */
    isLoading?: boolean
}

/**
 * Draw where somebody placed.
 *
 * @param props - {@link RankBadgeProps}
 */
export const RankBadge = ({ rank, label, isLoading = false }: RankBadgeProps) => (
    <Badge tone={badgeToneFor(rankVerdict(rank))} isLoading={isLoading}>
        {label}
    </Badge>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "block", name: "RankBadge" } as const
