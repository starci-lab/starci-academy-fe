import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { QueryParams } from "../types"
import type { CodingDomainSummaryResponse } from "./types/coding"

const document = gql`
    query CodingDomainSummary {
        codingDomainSummary {
            success
            message
            error
            data {
                domains {
                    domain
                    total
                }
            }
        }
    }
`

/** The document variants of this query. */
export enum QueryCodingDomainSummary {
    /** The only selection there is: every domain that holds problems. */
    Query1 = "query1",
}

/**
 * How many problems each interview topic holds.
 *
 * A domain holding nothing comes back ABSENT rather than with a zero - it is a grouped count, and a
 * group with no rows produces no bucket. Callers walk the enum and default the missing ones.
 */
export const queryCodingDomainSummary = async ({ headers, signal, debug }: QueryParams<QueryCodingDomainSummary> = {}) =>
    createApolloClient({ withAuth: true, headers, signal, debug })
        .query<CodingDomainSummaryResponse>({ query: document })
