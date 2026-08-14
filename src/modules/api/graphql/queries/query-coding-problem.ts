import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { QueryParams } from "../types"
import type { CodingProblemResponse } from "./types/coding"

const document = gql`
    query CodingProblem($request: CodingProblemRequest!) {
        codingProblem(request: $request) {
            success
            message
            error
            data {
                id
                slug
                title
                statement
                difficulty
                domain
                points
                tags
                timeLimitMs
                memoryLimitKb
                sampleTestcases {
                    input
                    expectedOutput
                }
                starterCodes {
                    language
                    code
                }
            }
        }
    }
`

/** The document variants of this query. */
export enum QueryCodingProblem {
    /** The full detail a solver needs. */
    Query1 = "query1",
}

/** Which problem to read. */
export interface QueryCodingProblemRequest {
    /** Stable URL slug, e.g. `two-sum`. */
    slug: string
}

/**
 * One problem in full.
 *
 * SAMPLE testcases only. The server never returns hidden cases or reference solutions to a client,
 * and the shape here says so rather than leaving a reader to wonder where the rest went.
 */
export const queryCodingProblem = async ({
    request,
    headers,
    signal,
    debug,
}: QueryParams<QueryCodingProblem, QueryCodingProblemRequest>) =>
    createApolloClient({ withAuth: true, headers, signal, debug })
        .query<CodingProblemResponse>({ query: document, variables: { request } })
