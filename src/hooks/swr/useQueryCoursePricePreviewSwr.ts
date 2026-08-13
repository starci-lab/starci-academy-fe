import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryCoursePricePreview } from "../../modules/api/graphql/queries/query-course-price-preview"
import { type CoursePricePreview } from "../../modules/api/graphql/queries/types/course-price-preview"

/** The cache key prefix, so a caller that changes enrolment can revalidate every course's price. */
export const QUERY_COURSE_PRICE_PREVIEW_SWR_KEY = "QUERY_COURSE_PRICE_PREVIEW_SWR"

/**
 * Reads what one course costs the asking learner.
 *
 * THE VIEWER IS PART OF THE KEY. The answer is personal - the loyalty tier reads from how many
 * courses this learner already joined - so two viewers must not share a cache entry, and signing
 * out must not leave the previous learner's price on screen.
 *
 * IT DOES NOT FETCH FOR A GUEST. `useViewerKey` is `undefined` before the viewer is known and the
 * key is null while it is, so a signed-out reader makes no request at all rather than one that is
 * refused. The catalog treats that as "no preview" and prices from the phase, which is the honest
 * answer for someone the loyalty tier cannot be computed for.
 *
 * @param courseId - The course to price, or `undefined` to stay idle.
 */
export const useQueryCoursePricePreviewSwr = (courseId?: string) => {
    const viewer = useViewerKey()
    return useSWR<CoursePricePreview | null>(
        viewer === undefined || courseId === undefined
            ? null
            : [QUERY_COURSE_PRICE_PREVIEW_SWR_KEY, viewer, courseId],
        // The key is null unless BOTH the viewer and the course are known, so the fetcher only ever
        // runs with a real id. It reads the id back from the key rather than closing over the
        // parameter, which keeps the two from disagreeing after a re-render.
        async ([, , id]: [string, string, string]) => {
            const result = await queryCoursePricePreview({ request: { courseId: id } })
            return result.data?.coursePricePreview?.data ?? null
        },
    )
}
