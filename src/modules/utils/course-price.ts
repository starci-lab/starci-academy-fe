import { type CoursePricePreview } from "../api/graphql/queries/types/course-price-preview"

/**
 * The one rule about a personal price, in the one place both readers of it can find.
 *
 * TWO SURFACES ASK THE SAME QUESTION. The catalog card asks it to decide whether to replace the
 * phase price it already drew, and the price overlay asks it to decide whether the reckoning shows
 * a loyalty line at all. Written twice, the two would eventually disagree, and the disagreement
 * would look like a bug in the price rather than in the rule.
 *
 * A PREVIEW IS NOT A DISCOUNT. The server answers every signed-in viewer, including one whose
 * loyalty tier takes nothing off; that answer equals the phase price. Treating its mere presence as
 * a reduction is how a card grows a struck-through number identical to the one beside it.
 *
 * @param preview - The viewer's price answer, or nothing when there is none.
 */
export const isPersonalPrice = (
    preview?: CoursePricePreview | null,
): preview is CoursePricePreview =>
    preview !== undefined
    && preview !== null
    && preview.discountedPriceVnd < preview.phasePriceVnd
