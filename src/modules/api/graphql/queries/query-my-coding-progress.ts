import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { QueryParams } from "../types"
import type { MyCodingProgressResponse } from "./types/coding"

const document = gql`
    query MyCodingProgress {
        myCodingProgress {
            success
            message
            error
            data {
                solvedProblemIds
                attemptedProblemIds
                revealedProblemIds
                totalPoints
                byDomain {
                    domain
                    solved
                }
            }
        }
    }
`

/** The document variants of this query. */
export enum QueryMyCodingProgress {
    /** Ids, points, and the per-domain rollup. */
    Query1 = "query1",
}

/**
 * The viewer's coding standing.
 *
 * `byDomain` is a GROUP BY, so a domain the viewer has never solved in is ABSENT rather than
 * present with a zero. The hub walks the twenty-member enum and defaults the missing ones, which is
 * why the server is not asked to keep a second copy of that enum in step.
 */
export const queryMyCodingProgress = async ({ headers, signal, debug }: QueryParams<QueryMyCodingProgress> = {}) =>
    createApolloClient({ withAuth: true, headers, signal, debug })
        .query<MyCodingProgressResponse>({ query: document })
