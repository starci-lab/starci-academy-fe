import useSWR from "swr"
import { queryCourseReviews } from "../../modules/api/graphql/queries/query-course-reviews"
import { type CourseReviewsPage } from "../../modules/api/graphql/queries/types/course-reviews"

/** The cache key prefix, so writing a review can revalidate the course it was written about. */
export const QUERY_COURSE_REVIEWS_SWR_KEY = "QUERY_COURSE_REVIEWS_SWR"

/**
 * Reads one page of a course's reviews and the rating behind them.
 *
 * THE VIEWER IS DELIBERATELY NOT PART OF THE KEY, which is the opposite of the price hook beside
 * it and for the opposite reason: a price is personal and a rating is not. Every reader gets the
 * same answer, so two viewers SHOULD share a cache entry, and signing out leaves nothing stale
 * behind because nothing about it was ever private.
 *
 * It also does not wait for the viewer to be known. Reviews are what somebody reads BEFORE buying,
 * so a signed-out reader is the reader this request exists for.
 *
 * @param courseId - The course to read, or `undefined` to stay idle.
 */
export const useQueryCourseReviewsSwr = (courseId?: string) =>
    useSWR<CourseReviewsPage | null>(
        courseId === undefined ? null : [QUERY_COURSE_REVIEWS_SWR_KEY, courseId],
        // The id is read back off the key rather than closed over, so the two cannot disagree
        // after a re-render.
        async ([, id]: [string, string]) => {
            const result = await queryCourseReviews({ request: { courseId: id } })
            return result.data?.courseReviews?.data ?? null
        },
    )
