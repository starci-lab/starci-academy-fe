import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryMyCourses } from "../../modules/api/graphql/queries/query-my-courses"
import { type MyCourseRow } from "../../modules/api/graphql/queries/types/my-courses"

/**
 * The cache key for the asking learner's enrolled courses.
 *
 * Exported rather than written inline so a caller that has just changed the answer - an
 * enrolment, an unenrolment - names the same key instead of guessing at the string. A typo
 * does not fail; it silently creates a second cache entry, and the two copies then disagree
 * on screen.
 */
export const QUERY_MY_COURSES_SWR_KEY = ["QUERY_MY_COURSES_SWR"]

/**
 * Reads the courses the asking learner is enrolled in.
 *
 * The envelope is unwrapped here, once, so no component reaches through
 * `data.myCourses.data`. A missing payload becomes `null` rather than `undefined`, because
 * SWR already uses `undefined` to mean "not loaded yet" - collapsing the two would leave a
 * component unable to tell an EMPTY enrolment list from a list that has not arrived, which
 * is exactly the distinction the progress block renders differently.
 */
export const useQueryMyCoursesSwr = () => {
    const viewer = useViewerKey()
    return useSWR<Array<MyCourseRow> | null>(
        viewer === undefined ? null : [...QUERY_MY_COURSES_SWR_KEY, viewer],
        async () => {
            const result = await queryMyCourses()
            return result.data?.myCourses?.data ?? null
        },
    )
}
