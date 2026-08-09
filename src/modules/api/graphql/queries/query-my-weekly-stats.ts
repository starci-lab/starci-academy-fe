import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type QueryParams } from "../types"
import { type QueryMyWeeklyStatsResponse } from "./types/my-weekly-stats"

/**
 * The asking learner's week: the streak, its record, and the seven days behind them.
 *
 * The days come back from the SERVER already bucketed into calendar days. That is the point
 * of selecting them rather than deriving a week from a list of events: the server decides
 * which day an activity belongs to, and two clients in two time zones then draw the same
 * strip. Required-auth, so the client always carries the token.
 */
const query1 = gql`
    query MyWeeklyStats {
        myWeeklyStats {
            success
            message
            error
            data {
                streak
                longestStreak
                days {
                    date
                    active
                }
            }
        }
    }
`

/** The document variants of this query. */
export enum QueryMyWeeklyStats {
    /** Streak, record streak and the seven-day strip. */
    Query1 = "query1",
}

/** Every document this query can send, keyed by variant. */
export const queryMyWeeklyStatsMap: Record<QueryMyWeeklyStats, DocumentNode> = {
    [QueryMyWeeklyStats.Query1]: query1,
}

/** Fetches the asking learner's weekly stats. Always sends the bearer token. */
export const queryMyWeeklyStats = async ({
    query = QueryMyWeeklyStats.Query1,
    headers,
    signal,
    debug,
}: QueryParams<QueryMyWeeklyStats> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryMyWeeklyStatsResponse>({
        query: queryMyWeeklyStatsMap[query],
    })
}
