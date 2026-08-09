import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type QueryParams } from "../types"
import { type QueryPlatformStatsResponse } from "./types/platform-stats"

/**
 * The public landing-page counters. No arguments, no auth, four scalars - which is exactly
 * why it is the query the transport is proven with: if this one answers, the endpoint, the
 * link chain and the envelope are all correct, and nothing about the result depends on who
 * is asking.
 */
const query1 = gql`
    query PlatformStats {
        platformStats {
            success
            message
            error
            data {
                totalLearners
                totalLessons
                totalCourses
                totalBadgesEarned
            }
        }
    }
`

/**
 * The document variants of this query.
 *
 * One entry today. The enum exists anyway because a second variant - a lighter selection for
 * a smaller surface - must arrive as a new document rather than as a conditional inside the
 * existing one, which is how a query slowly grows fields no caller reads.
 */
export enum QueryPlatformStats {
    /** The full counter set. */
    Query1 = "query1",
}

/** Every document this query can send, keyed by variant. */
export const queryPlatformStatsMap: Record<QueryPlatformStats, DocumentNode> = {
    [QueryPlatformStats.Query1]: query1,
}

/** Fetches the public platform counters. Anonymous: no token is attached. */
export const queryPlatformStats = async ({
    query = QueryPlatformStats.Query1,
    headers,
    signal,
    debug,
}: QueryParams<QueryPlatformStats> = {}) => {
    const apollo = createApolloClient({ headers, signal, debug })
    return apollo.query<QueryPlatformStatsResponse>({
        query: queryPlatformStatsMap[query],
    })
}
