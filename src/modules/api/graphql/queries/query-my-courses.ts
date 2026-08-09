import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type QueryParams } from "../types"
import { type QueryMyCoursesResponse } from "./types/my-courses"

/**
 * The courses the ASKING learner is enrolled in.
 *
 * Required-auth, not optional-auth: the server answers `myCourses` behind a guard and
 * refuses the operation outright when no `Authorization` header arrives, so there is no
 * anonymous version of this answer to fall back to. The client is therefore always built
 * with the auth link.
 */
const query1 = gql`
    query MyCourses {
        myCourses {
            success
            message
            error
            data {
                globalId
                label
                completionPercent
            }
        }
    }
`

/**
 * The document variants of this query.
 *
 * One entry today. The enum exists anyway so that a second variant - a fuller selection for
 * a course-list surface that also draws the counters - arrives as a new document rather than
 * as a conditional inside this one.
 */
export enum QueryMyCourses {
    /** The progress-row selection: identity, title, completion. */
    Query1 = "query1",
}

/** Every document this query can send, keyed by variant. */
export const queryMyCoursesMap: Record<QueryMyCourses, DocumentNode> = {
    [QueryMyCourses.Query1]: query1,
}

/** Fetches the asking learner's enrolled courses. Always sends the bearer token. */
export const queryMyCourses = async ({
    query = QueryMyCourses.Query1,
    headers,
    signal,
    debug,
}: QueryParams<QueryMyCourses> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryMyCoursesResponse>({
        query: queryMyCoursesMap[query],
    })
}
