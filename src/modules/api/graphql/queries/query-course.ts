import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type QueryParams } from "../types"
import { type QueryCourseRequest, type QueryCourseResponse } from "./types/course"

/**
 * One course, by its display id.
 *
 * Optional-auth on the server, exactly like the list: a guest gets the course with
 * `isEnrolled: null`, and a viewer with a token gets the same course with their real enrolment
 * state. The client is therefore built WITH the auth link - it attaches nothing when no token
 * exists - so one document and one code path serve both readers.
 *
 * WHY THE COUNTS ARE SELECTED AND NOT ASKED FOR. The hero's trust chips are contents, hours and
 * challenges across the whole course, and the server exposes them per content rather than as course
 * totals. The legacy page sums them client-side, so this selects `minutesRead` and `numChallenges`
 * per content and sums them the same way. That keeps the chips FACTS about this course rather than
 * numbers a second source could disagree with - at the cost of a wider selection, which is the
 * honest trade and is why the contents carry no title: nothing lists them.
 *
 * WHAT THE DISCLOSURE REVEALS. `previewContents` are the module's published bullets, not its
 * lessons - the server has no lesson type. They are what the named render shows when a module is
 * opened, and their count is the "N previews" the closed row reports.
 */
const query1 = gql`
    query Course($request: CourseRequest!) {
        course(request: $request) {
            success
            message
            error
            data {
                id
                displayId
                title
                description
                coverImageUrl
                originalPrice
                enrollmentCount
                isEnrolled
                currentPhase
                valuePropositions {
                    text
                    orderIndex
                }
                pricingPhases {
                    id
                    phase
                    price
                    slotAvailable
                    orderIndex
                }
                modules {
                    id
                    title
                    orderIndex
                    contentTier
                    numContents
                    contents {
                        id
                        minutesRead
                        numChallenges
                    }
                    previewContents {
                        id
                        text
                        orderIndex
                    }
                }
            }
        }
    }
`

/** The document variants of this query. */
export enum QueryCourse {
    /** The full detail-page selection. */
    Query1 = "query1",
}

/** Every document this query can send, keyed by variant. */
export const queryCourseMap: Record<QueryCourse, DocumentNode> = {
    [QueryCourse.Query1]: query1,
}

/** Fetches one course. Sends the bearer token when one exists, anonymous otherwise. */
export const queryCourse = async ({
    query = QueryCourse.Query1,
    request = {},
    headers,
    signal,
    debug,
}: QueryParams<QueryCourse, QueryCourseRequest> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryCourseResponse>({
        query: queryCourseMap[query],
        variables: { request },
    })
}
