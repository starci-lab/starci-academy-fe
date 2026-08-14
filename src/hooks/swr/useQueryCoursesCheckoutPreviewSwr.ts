import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryCoursesCheckoutPreview } from "../../modules/api/graphql/queries/query-courses-checkout-preview"
import { type CoursesCheckoutPreviewData } from "../../modules/api/graphql/queries/types/courses-checkout-preview"

/** The cache key prefix for pricing a set of courses as one order. */
export const QUERY_COURSES_CHECKOUT_PREVIEW_SWR_KEY = ["QUERY_COURSES_CHECKOUT_PREVIEW_SWR"]

/**
 * Prices the courses in the cart as one order.
 *
 * THE COURSE IDS ARE PART OF THE KEY, sorted. Removing a line re-prices the whole order - the
 * bundle bonus depends on how many courses there are - so a key that ignored the set would serve
 * the previous order's totals beside the new list. Sorted, because the same basket read twice must
 * not be two cache entries.
 *
 * IT IS A SEPARATE REQUEST FROM THE CART, so a failure here leaves the rows alone. That is the
 * state the design draws: lines that are real, totals that are unknown.
 *
 * @param courseIds - The cart's courses, or an empty list to stay idle.
 */
export const useQueryCoursesCheckoutPreviewSwr = (courseIds: ReadonlyArray<string>) => {
    const viewer = useViewerKey()
    const ordered = [...courseIds].sort()
    return useSWR<CoursesCheckoutPreviewData | null>(
        viewer === undefined || ordered.length === 0
            ? null
            : [...QUERY_COURSES_CHECKOUT_PREVIEW_SWR_KEY, viewer, ordered.join(",")],
        async () => {
            const result = await queryCoursesCheckoutPreview({ courseIds: ordered })
            return result.data?.coursesCheckoutPreview?.data ?? null
        },
    )
}
