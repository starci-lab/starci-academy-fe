import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse } from "../types"

/** Viewer-level spaced-repetition facts projected by the backend. */
export type FlashcardStats = {
    readonly currentStreak: number
    readonly longestStreak: number
    readonly retentionRate: number
    readonly totalReviewed: number
    readonly lastReviewedAt?: string | null
    readonly gradeDistribution: {
        readonly again: number
        readonly hard: number
        readonly good: number
        readonly easy: number
    }
}

type QueryMyFlashcardStatsResponse = {
    readonly myFlashcardStats: GraphQLResponse<FlashcardStats>
}

const query = gql`
    query MyFlashcardStats {
        myFlashcardStats {
            success
            message
            error
            data {
                currentStreak
                longestStreak
                retentionRate
                totalReviewed
                lastReviewedAt
                gradeDistribution { again hard good easy }
            }
        }
    }
`

/** Reads the authenticated viewer's aggregate flashcard statistics. */
export const queryMyFlashcardStats = async (): Promise<FlashcardStats | null> => {
    const apollo = createApolloClient({ withAuth: true })
    const response = await apollo.query<QueryMyFlashcardStatsResponse>({ query })
    return response.data?.myFlashcardStats.data ?? null
}
