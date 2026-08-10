import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type QueryParams } from "../types"
import { type QueryMyKpisResponse } from "./types/my-kpis"

/**
 * The asking learner's weekly targets, and how far into them they are.
 *
 * `composite` IS SELECTED RATHER THAN DERIVED from the items, because the server decides which
 * metrics count toward the week - a client averaging the rows it happens to have would produce a
 * different percentage the moment the server changed what qualifies, and the two would disagree
 * on the same screen. Required-auth, so the client always carries the token.
 */
const query1 = gql`
    query MyKpis {
        myKpis {
            success
            message
            error
            data {
                resetAt
                composite {
                    percent
                    completed
                    total
                }
                items {
                    key
                    current
                    target
                    coinReward
                    claimed
                    canClaim
                }
            }
        }
    }
`

/** The document variants of this query. */
export enum QueryMyKpis {
    /** Every metric, the week as one figure, and when it rolls over. */
    Query1 = "query1",
}

/** Every document this query can send, keyed by variant. */
export const queryMyKpisMap: Record<QueryMyKpis, DocumentNode> = {
    [QueryMyKpis.Query1]: query1,
}

/** Fetches the asking learner's weekly targets. Always sends the bearer token. */
export const queryMyKpis = async ({
    query = QueryMyKpis.Query1,
    headers,
    signal,
    debug,
}: QueryParams<QueryMyKpis> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryMyKpisResponse>({
        query: queryMyKpisMap[query],
    })
}
