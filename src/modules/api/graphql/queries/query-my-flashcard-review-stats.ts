import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse } from "../types"

/** Course-scoped review retention evidence. */
export type FlashcardReviewStats = {
    readonly matureRetention: number
    readonly youngRetention: number
    readonly reviewedTotal: number
    readonly courseRetention: number
    readonly weakTags: ReadonlyArray<{ readonly tag: string, readonly retention: number, readonly cardCount: number }>
    readonly deckRetention: ReadonlyArray<{ readonly deckId: string, readonly deckTitle: string, readonly retention: number, readonly reviewCount: number }>
    readonly leechFocus: ReadonlyArray<{ readonly cardId: string, readonly question: string, readonly deckId: string, readonly deckTitle: string, readonly lapseCount: number, readonly reason: "lapsed" | "stuckHard" }>
}

const query = gql`
    query MyFlashcardReviewStats($courseId: ID!) {
        myFlashcardReviewStats(courseId: $courseId) {
            success message error
            data {
                matureRetention youngRetention reviewedTotal courseRetention
                weakTags { tag retention cardCount }
                deckRetention { deckId deckTitle retention reviewCount }
                leechFocus { cardId question deckId deckTitle lapseCount reason }
            }
        }
    }
`

/** Reads course-scoped review health, weak tags and leech cards. */
export const queryMyFlashcardReviewStats = async (courseId: string): Promise<FlashcardReviewStats | null> => {
    const apollo = createApolloClient({ withAuth: true })
    const response = await apollo.query<{ readonly myFlashcardReviewStats: GraphQLResponse<FlashcardReviewStats> }>({ query, variables: { courseId } })
    return response.data?.myFlashcardReviewStats.data ?? null
}
