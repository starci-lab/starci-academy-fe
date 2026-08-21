import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse } from "../types"

/** One completed review session in the learner's course history. */
export type FlashcardReviewHistoryItem = {
    readonly id: string
    readonly updatedAt: string
    readonly deckId: string
    readonly deckTitle: string
    readonly cardCount: number
    readonly reviewedCount: number
    readonly xpEarned: number
}

/** Paginated review history returned by the backend. */
export type FlashcardReviewHistory = {
    readonly totalCount: number
    readonly items: ReadonlyArray<FlashcardReviewHistoryItem>
}

const query = gql`
    query MyFlashcardReviewHistory($courseId: ID!, $limit: Int, $offset: Int) {
        myFlashcardReviewHistory(courseId: $courseId, limit: $limit, offset: $offset) {
            success message error
            data { totalCount items { id updatedAt deckId deckTitle cardCount reviewedCount xpEarned } }
        }
    }
`

/** Reads completed review sessions for one course. */
export const queryMyFlashcardReviewHistory = async (courseId: string, limit = 20, offset = 0): Promise<FlashcardReviewHistory | null> => {
    const apollo = createApolloClient({ withAuth: true })
    const response = await apollo.query<{ readonly myFlashcardReviewHistory: GraphQLResponse<FlashcardReviewHistory> }>({
        query,
        variables: { courseId, limit, offset },
    })
    return response.data?.myFlashcardReviewHistory.data ?? null
}
