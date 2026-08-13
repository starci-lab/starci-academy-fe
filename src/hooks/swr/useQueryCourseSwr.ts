import useSWR from "swr"
import { queryCourse } from "../../modules/api/graphql/queries/query-course"
import { type CourseDetail } from "../../modules/api/graphql/queries/types/course"

/** What a caller must say about the course it wants. */
export interface UseQueryCourseSwrParams {
    /** The short human-facing identifier the route carries - `fullstack-mastery`, not a UUID. */
    displayId?: string
}

/** The key prefix, so a caller can revalidate every course read at once. */
export const QUERY_COURSE_SWR_KEY = "QUERY_COURSE_SWR"

/**
 * Reads one course by its display id.
 *
 * IT SENDS `displayId` AND NEVER `id`, and that is a measured decision rather than a preference.
 * `CourseRequest` declares both fields, so the obvious reading is that either addresses a course -
 * the catalog links by primary key, so this hook briefly tried to detect a UUID and send `id`
 * instead. The server answers that with `success: false, error: COURSE_NOT_FOUND_EXCEPTION`, for
 * the very id it had just returned for the same course. Only `displayId` resolves.
 *
 * So a link built from `course.id` cannot be served by this hook, and pretending otherwise would
 * put a branch here that quietly produces the not-found page. The fix belongs at the two ends that
 * disagree: `CoursesCatalogPage` pushes `/courses/${course.id}` while the dashboard's
 * `RecommendedCourses` pushes the display id, and the baseline URL is the slug.
 *
 * THE DISPLAY ID IS PART OF THE KEY, which is what makes two course pages in one session safe: they
 * are different keys, so neither serves the other from cache. A key of the bare prefix would show
 * the previous course for a moment after navigating, which is exactly when a reader is deciding
 * whether they are on the right page.
 *
 * IT DOES NOT FETCH WITHOUT ONE. `null` as the key is SWR's own way of saying "not yet"; a key
 * built from `undefined` would ask the server for a course that cannot exist and then cache the
 * failure under a key the real request would collide with.
 */
export const useQueryCourseSwr = ({ displayId }: UseQueryCourseSwrParams = {}) =>
    useSWR<CourseDetail | null>(
        displayId === undefined ? null : [QUERY_COURSE_SWR_KEY, displayId],
        async () => {
            const result = await queryCourse({ request: { displayId } })
            return result.data?.course?.data ?? null
        },
    )
