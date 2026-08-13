import useSWR from "swr"
import { queryCourse } from "../../modules/api/graphql/queries/query-course"
import { type CourseDetail } from "../../modules/api/graphql/queries/types/course"

/** What a caller must say about the course it wants. */
export interface UseQueryCourseSwrParams {
    /** The short human-facing identifier the route carries. */
    displayId?: string
}

/** The key prefix, so a caller can revalidate every course read at once. */
export const QUERY_COURSE_SWR_KEY = "QUERY_COURSE_SWR"

/**
 * Reads one course by its display id.
 *
 * THE DISPLAY ID IS PART OF THE KEY, which is what makes two course pages in one session safe:
 * they are different keys, so neither serves the other from cache. A key of the bare prefix would
 * show the previous course for a moment after navigating, and that moment is exactly when a reader
 * is deciding whether they are on the right page.
 *
 * IT DOES NOT FETCH WITHOUT ONE. `null` as the key is SWR's own way of saying "not yet"; passing a
 * key built from `undefined` would send `{ displayId: undefined }` and ask the server for a course
 * that cannot exist, then cache the failure under a key the real request would collide with.
 */
export const useQueryCourseSwr = ({ displayId }: UseQueryCourseSwrParams = {}) =>
    useSWR<CourseDetail | null>(
        displayId === undefined ? null : [QUERY_COURSE_SWR_KEY, displayId],
        async () => {
            const result = await queryCourse({ request: { displayId } })
            return result.data?.course?.data ?? null
        },
    )
