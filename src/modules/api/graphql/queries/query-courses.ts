import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { SortBy, SortOrder, type QueryParams, type SortInput } from "../types"
import { type QueryCoursesRequest, type QueryCoursesResponse } from "./types/courses"

/**
 * The paginated course list.
 *
 * Optional-auth on the server: a guest gets every row with `isEnrolled: null`, and a viewer
 * with a token gets the same rows with their real enrolment state. The client is therefore
 * built WITH the auth link - the link attaches nothing when no token exists, so one document
 * and one code path serve both readers.
 */
const query1 = gql`
    query Courses($request: CoursesRequest!) {
        courses(request: $request) {
            success
            message
            error
            data {
                count
                data {
                    id
                    displayId
                    title
                    slug
                    description
                    coverImageUrl
                    originalPrice
                    enrollmentCount
                    isEnrolled
                }
            }
        }
    }
`

/** The document variants of this query. */
export enum QueryCourses {
    /** The full list-card selection. */
    Query1 = "query1",
}

/** Every document this query can send, keyed by variant. */
export const queryCoursesMap: Record<QueryCourses, DocumentNode> = {
    [QueryCourses.Query1]: query1,
}

/**
 * The default ordering: title, ascending.
 *
 * A list query with no sort clause is not stable - the server is free to return page two in
 * an order unrelated to page one, and rows appear to duplicate or vanish as a reader pages
 * through. So there is always a sort, and this is it when a caller has no opinion.
 */
export const defaultCoursesSorts: Array<SortInput<SortBy>> = [
    { by: SortBy.Title, order: SortOrder.Asc },
]

/** Fetches one page of courses. Sends the bearer token when one exists, anonymous otherwise. */
export const queryCourses = async ({
    query = QueryCourses.Query1,
    request = { filters: { sorts: defaultCoursesSorts } },
    headers,
    signal,
    debug,
}: QueryParams<QueryCourses, QueryCoursesRequest> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryCoursesResponse>({
        query: queryCoursesMap[query],
        variables: { request },
    })
}
