import useSWR from "swr"
import { defaultCoursesSorts, queryCourses } from "../../modules/api/graphql/queries/query-courses"
import { type QueryCoursesPayload } from "../../modules/api/graphql/queries/types/courses"
import { type PaginationFilters, type SortBy } from "../../modules/api/graphql/types"

/** What a caller may vary about the page of courses it wants. */
export interface UseQueryCoursesSwrParams {
    /** Page window and sort clauses; defaults to the first page in the default order. */
    filters?: PaginationFilters<SortBy>
}

/** The key prefix, so a caller can revalidate every page of this list at once. */
export const QUERY_COURSES_SWR_KEY = "QUERY_COURSES_SWR"

/**
 * Reads one page of the course list.
 *
 * The FILTERS ARE PART OF THE KEY, and that is the whole reason this hook is safe to mount
 * on several surfaces at once: page two and page three are different keys, so they cache
 * separately and neither can overwrite the other. A key of the bare prefix would make every
 * pager on the page fight over one cache entry.
 */
export const useQueryCoursesSwr = ({ filters }: UseQueryCoursesSwrParams = {}) => {
    const request = { filters: filters ?? { sorts: defaultCoursesSorts } }
    return useSWR<QueryCoursesPayload | null>([QUERY_COURSES_SWR_KEY, request], async () => {
        const result = await queryCourses({ request })
        return result.data?.courses?.data ?? null
    })
}
