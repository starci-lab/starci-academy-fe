import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type QueryParams } from "../types"
import { type QueryWeeklyChallengeResponse } from "./types/weekly-challenge"

const query1 = gql`
    query WeeklyChallenge {
        weeklyChallenge {
            success
            message
            error
            data {
                challengeGlobalId
                title
                weekEndAt
                viewerPassed
                passedCount
                leaderboard { username avatar passedAt }
                claimed
                coinReward
            }
        }
    }
`

export enum QueryWeeklyChallenge { Query1 = "query1" }
/** Every supported weekly-challenge document keyed by its public variant. */
export const queryWeeklyChallengeMap: Record<QueryWeeklyChallenge, DocumentNode> = {
    [QueryWeeklyChallenge.Query1]: query1,
}

/** Fetches the featured challenge together with viewer pass and claim state. */
export const queryWeeklyChallenge = async ({
    query = QueryWeeklyChallenge.Query1,
    headers,
    signal,
    debug,
}: QueryParams<QueryWeeklyChallenge> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryWeeklyChallengeResponse>({ query: queryWeeklyChallengeMap[query] })
}
