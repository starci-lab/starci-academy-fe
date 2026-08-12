import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type QueryParams } from "../types"
import { type QueryMyJobReadinessResponse } from "./types/job-readiness"

const query1 = gql`
    query MyJobReadiness {
        myJobReadiness {
            success
            message
            error
            data {
                foundation { codingPercentile cvScore }
                tracks {
                    courseId
                    courseTitle
                    courseSlug
                    capstoneScore
                    interviewScore
                    cvScore
                    depthScore
                    band
                    isQualified
                }
            }
        }
    }
`

export enum QueryMyJobReadiness { Query1 = "query1" }
/** Every supported job-readiness document keyed by its public variant. */
export const queryMyJobReadinessMap: Record<QueryMyJobReadiness, DocumentNode> = {
    [QueryMyJobReadiness.Query1]: query1,
}

/** Fetches the authenticated viewer's foundation and per-course readiness tracks. */
export const queryMyJobReadiness = async ({
    query = QueryMyJobReadiness.Query1,
    headers,
    signal,
    debug,
}: QueryParams<QueryMyJobReadiness> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryMyJobReadinessResponse>({ query: queryMyJobReadinessMap[query] })
}
