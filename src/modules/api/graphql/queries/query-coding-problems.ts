import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { QueryParams } from "../types"
import type { CodingProblemsResponse } from "./types/coding"

const document = gql`
    query CodingProblems($request: CodingProblemsRequest!) {
        codingProblems(request: $request) {
            success
            message
            error
            data {
                total
                problems {
                    id
                    slug
                    title
                    difficulty
                    domain
                    points
                    tags
                }
            }
        }
    }
`

/** The document variants of this query. */
export enum QueryCodingProblems {
    /** The catalog-row selection. */
    Query1 = "query1",
}

/** What a caller may narrow the catalog by. */
export interface QueryCodingProblemsRequest {
    filters: {
        /** One interview topic. This is the CLOSED enum, not the free-text `tag` beside it. */
        domain?: string
        difficulty?: string
        tag?: string
        page?: number
        limit?: number
    }
}

/**
 * One page of coding problems.
 *
 * `domain` and `tag` are NOT interchangeable: tags are free text on the problem (`array`, `dp`),
 * the domain is the enum the entity documents as the field the list is grouped by. Filtering by the
 * wrong one returns a different, overlapping set and nothing fails.
 */
export const queryCodingProblems = async ({
    request = { filters: {} },
    headers,
    signal,
    debug,
}: QueryParams<QueryCodingProblems, QueryCodingProblemsRequest> = {}) =>
    createApolloClient({ withAuth: true, headers, signal, debug })
        .query<CodingProblemsResponse>({ query: document, variables: { request: request.filters } })
