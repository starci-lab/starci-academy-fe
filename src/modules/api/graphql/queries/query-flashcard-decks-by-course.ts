import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse } from "../types"

/** Minimal card identity carried by a deck overview. */
export type FlashcardDeckCard = {
    readonly id: string
    readonly sortIndex: number
    readonly level?: string | null
}

/** Localized course deck with viewer-specific mastery counters. */
export type FlashcardDeck = {
    readonly id: string
    readonly displayId: string
    readonly title: string
    readonly description: string
    readonly difficulty: string
    readonly sortIndex: number
    readonly dueCount?: number | null
    readonly masteredCount?: number | null
    readonly cards: Array<FlashcardDeckCard>
}

type QueryFlashcardDecksByCourseResponse = {
    readonly flashcardDecksByCourse: GraphQLResponse<Array<FlashcardDeck>>
}

/** One currently due card returned for a course-level review batch. */
export type DueFlashcard = {
    readonly cardId: string
    readonly deckTitle: string
    readonly front: string
    readonly back: string
    readonly level?: string | null
    readonly tags: ReadonlyArray<string>
}

/** Backend-proven due queue used to start a cross-deck review session. */
export type DueFlashcardsData = {
    readonly dueCount: number
    readonly cards: ReadonlyArray<DueFlashcard>
}

const query = gql`
    query FlashcardDecksByCourse($courseId: ID!) {
        flashcardDecksByCourse(courseId: $courseId) {
            success
            message
            error
            data {
                id
                displayId
                title
                description
                difficulty
                sortIndex
                dueCount
                masteredCount
                cards { id sortIndex level }
            }
        }
    }
`

const dueQuery = gql`
    query MyDueFlashcards($courseId: String!, $limit: Int!) {
        myDueFlashcards(courseId: $courseId, limit: $limit) {
            success message error
            data { dueCount cards { cardId deckTitle front back level tags } }
        }
    }
`

/** Fetches the localized deck inventory and viewer counters for one course. */
export const queryFlashcardDecksByCourse = async (courseId: string) => {
    const apollo = createApolloClient({ withAuth: true })
    const response = await apollo.query<QueryFlashcardDecksByCourseResponse>({
        query,
        variables: { courseId },
    })
    return response.data?.flashcardDecksByCourse.data ?? null
}

/** Fetches the exact cross-deck card draw accepted by the due-session mutation. */
export const queryMyDueFlashcards = async (courseId: string, limit = 50): Promise<DueFlashcardsData | null> => {
    const apollo = createApolloClient({ withAuth: true })
    const response = await apollo.query<{
        readonly myDueFlashcards: GraphQLResponse<DueFlashcardsData>
    }>({ query: dueQuery, variables: { courseId, limit } })
    return response.data?.myDueFlashcards.data ?? null
}
