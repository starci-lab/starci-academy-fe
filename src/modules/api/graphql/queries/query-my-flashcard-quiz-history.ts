import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse } from "../types"

/** One completed cloze quiz session. */
export type FlashcardQuizHistoryItem = {
    readonly id: string
    readonly updatedAt: string
    readonly name: string | null
    readonly mode: string
    readonly level: string | null
    readonly cardCount: number
    readonly correctCount: number
    readonly coverage: number | null
    readonly xpEarned: number
    readonly weakTags: ReadonlyArray<{ readonly tag: string, readonly coverage: number, readonly moduleId?: string, readonly contentId?: string }>
}

/** Paginated cloze quiz history. */
export type FlashcardQuizHistory = {
    readonly totalCount: number
    readonly items: ReadonlyArray<FlashcardQuizHistoryItem>
}

const query = gql`
    query MyFlashcardQuizHistory($courseId: ID!, $limit: Int, $offset: Int) {
        myFlashcardQuizHistory(courseId: $courseId, limit: $limit, offset: $offset) {
            success message error
            data {
                totalCount
                items { id updatedAt name mode level cardCount correctCount coverage xpEarned weakTags { tag coverage moduleId contentId } }
            }
        }
    }
`

/** Reads completed cloze quiz sessions for one course. */
export const queryMyFlashcardQuizHistory = async (courseId: string, limit = 20, offset = 0): Promise<FlashcardQuizHistory | null> => {
    const apollo = createApolloClient({ withAuth: true })
    const response = await apollo.query<{ readonly myFlashcardQuizHistory: GraphQLResponse<FlashcardQuizHistory> }>({
        query,
        variables: { courseId, limit, offset },
    })
    return response.data?.myFlashcardQuizHistory.data ?? null
}
