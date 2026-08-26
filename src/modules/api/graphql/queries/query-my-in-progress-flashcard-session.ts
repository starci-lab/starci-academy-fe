import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse } from "../types"

/** Route-level flashcard modes shared by the overview, session, and result owners. */
export type FlashcardSessionMode = "review" | "quiz"

/** Backend review storage family selected by a review session. */
export type FlashcardReviewKind = "deck" | "due"

/** One hydrated card in a persisted flashcard session. */
export type FlashcardSessionCard = {
    readonly cardId: string
    readonly deckTitle: string
    readonly front: string
    readonly back: string
    readonly answerAvailable: boolean
    readonly level?: string | null
    readonly tags: ReadonlyArray<string>
    readonly nextIntervals?: {
        readonly again: number
        readonly hard: number
        readonly good: number
        readonly easy: number
    }
}

/** Persisted objective outcome for one quiz card. */
export type FlashcardQuizAnswer = {
    readonly cardId: string
    readonly correctBlanks: number
    readonly totalBlanks: number
}

/** Hydrated resumable session consumed by the canonical live page. */
export type FlashcardSession = {
    readonly sessionId: string
    readonly mode: FlashcardSessionMode
    readonly kind?: FlashcardReviewKind
    readonly status: "in_progress"
    readonly cardIds: ReadonlyArray<string>
    readonly cards: ReadonlyArray<FlashcardSessionCard>
    readonly currentIndex: number
    readonly reviewedCount: number
    readonly gradedIndexes: ReadonlyArray<number>
    readonly results: ReadonlyArray<FlashcardQuizAnswer>
    readonly xpEarned: number
    readonly updatedAt?: string
    readonly deadlineAt?: string | null
    readonly name?: string | null
}

/** Lookup parameters for a review session, including deck and due-review families. */
export type QueryFlashcardReviewSessionRequest = {
    readonly mode: "review"
    readonly courseId?: string
    readonly deckId?: string
    readonly deckIds?: ReadonlyArray<string>
    readonly sessionId?: string
    readonly reviewKind?: FlashcardReviewKind
}

/** Lookup parameters for a course-scoped quiz session. */
export type QueryFlashcardQuizSessionRequest = {
    readonly mode: "quiz"
    readonly courseId: string
    readonly sessionId?: string
}

/** Supported lookup parameters for one resumable flashcard session. */
export type QueryFlashcardSessionRequest = QueryFlashcardReviewSessionRequest | QueryFlashcardQuizSessionRequest

type ReviewSessionData = {
    readonly sessionId: string
    readonly kind?: FlashcardReviewKind
    readonly deckId?: string | null
    readonly deckTitle?: string | null
    readonly cardIds: ReadonlyArray<string>
    readonly currentIndex: number
    readonly reviewedCount: number
    readonly gradedIndexes: ReadonlyArray<number>
    readonly xpEarned: number
    readonly updatedAt?: string
}

type QuizSessionData = {
    readonly sessionId: string
    readonly cardIds: ReadonlyArray<string>
    readonly currentIndex: number
    readonly results: ReadonlyArray<FlashcardQuizAnswer>
    readonly updatedAt?: string
    readonly deadlineAt?: string | null
    readonly name?: string | null
}

type CardsResponse = {
    readonly flashcardCardsByIds: GraphQLResponse<{ readonly cards: Array<FlashcardSessionCard> }>
}

const reviewBySessionQuery = gql`
    query MyFlashcardReviewSessionBySessionId($sessionId: ID!) {
        myFlashcardReviewSessionBySessionId(sessionId: $sessionId) {
            success message error
            data {
                sessionId kind deckId deckTitle cardIds currentIndex reviewedCount
                gradedIndexes xpEarned updatedAt
            }
        }
    }
`

const reviewByDeckQuery = gql`
    query MyInProgressFlashcardReviewSession($deckId: ID!) {
        myInProgressFlashcardReviewSession(deckId: $deckId) {
            success message error
            data { sessionId cardIds currentIndex reviewedCount gradedIndexes xpEarned updatedAt }
        }
    }
`

const dueByCourseQuery = gql`
    query MyInProgressFlashcardDueReviewSession($courseId: ID!) {
        myInProgressFlashcardDueReviewSession(courseId: $courseId) {
            success message error
            data { sessionId cardIds currentIndex reviewedCount gradedIndexes xpEarned updatedAt }
        }
    }
`

const quizByCourseQuery = gql`
    query MyInProgressFlashcardQuizSession($courseId: ID!) {
        myInProgressFlashcardQuizSession(courseId: $courseId) {
            success message error
            data { sessionId cardIds currentIndex results { cardId correctBlanks totalBlanks } updatedAt deadlineAt name }
        }
    }
`

const cardsQuery = gql`
    query FlashcardCardsByIds($courseId: String, $cardIds: [String!]!) {
        flashcardCardsByIds(courseId: $courseId, cardIds: $cardIds) {
            success message error
            data {
                cards {
                    cardId deckTitle front back answerAvailable level tags
                    nextIntervals { again hard good easy }
                }
            }
        }
    }
`

const hydrate = async (
    data: ReviewSessionData | QuizSessionData,
    mode: FlashcardSessionMode,
    courseId?: string,
    kind?: FlashcardReviewKind,
): Promise<FlashcardSession> => {
    const apollo = createApolloClient({ withAuth: true })
    const cardsResponse = await apollo.query<CardsResponse>({
        query: cardsQuery,
        variables: { courseId, cardIds: data.cardIds },
    })
    const review = mode === "review" ? data as ReviewSessionData : undefined
    const quiz = mode === "quiz" ? data as QuizSessionData : undefined
    return {
        sessionId: data.sessionId,
        mode,
        kind: mode === "review" ? kind ?? review?.kind ?? "deck" : undefined,
        status: "in_progress",
        cardIds: data.cardIds,
        cards: cardsResponse.data?.flashcardCardsByIds.data?.cards ?? [],
        currentIndex: data.currentIndex,
        reviewedCount: review?.reviewedCount ?? quiz?.results.length ?? 0,
        gradedIndexes: review?.gradedIndexes ?? [],
        results: quiz?.results ?? [],
        xpEarned: review?.xpEarned ?? 0,
        updatedAt: data.updatedAt,
        deadlineAt: quiz?.deadlineAt,
        name: quiz?.name,
    }
}

const queryReviewByDeck = async (deckId: string): Promise<ReviewSessionData | null> => {
    const apollo = createApolloClient({ withAuth: true })
    const response = await apollo.query<{
        readonly myInProgressFlashcardReviewSession: GraphQLResponse<ReviewSessionData>
    }>({ query: reviewByDeckQuery, variables: { deckId } })
    return response.data?.myInProgressFlashcardReviewSession.data ?? null
}

/** Resolves and hydrates the backend-proven resumable session for one route or overview. */
export const queryMyInProgressFlashcardSession = async (
    request: QueryFlashcardSessionRequest,
): Promise<FlashcardSession | null> => {
    const apollo = createApolloClient({ withAuth: true })
    if (request.mode === "review") {
        if (request.sessionId !== undefined) {
            const response = await apollo.query<{
                readonly myFlashcardReviewSessionBySessionId: GraphQLResponse<ReviewSessionData>
            }>({ query: reviewBySessionQuery, variables: { sessionId: request.sessionId } })
            const data = response.data?.myFlashcardReviewSessionBySessionId.data
            return data == null ? null : hydrate(data, "review", request.courseId, data.kind)
        }
        if (request.reviewKind === "due") {
            if (request.courseId === undefined) return null
            const response = await apollo.query<{
                readonly myInProgressFlashcardDueReviewSession: GraphQLResponse<ReviewSessionData>
            }>({ query: dueByCourseQuery, variables: { courseId: request.courseId } })
            const data = response.data?.myInProgressFlashcardDueReviewSession.data
            return data == null ? null : hydrate(data, "review", request.courseId, "due")
        }
        const deckIds = request.deckIds ?? (request.deckId === undefined ? [] : [request.deckId])
        if (deckIds.length === 0) return null
        const sessions = await Promise.all(deckIds.map(queryReviewByDeck))
        const data = sessions.find((session) => session !== null)
        return data == null ? null : hydrate(data, "review", request.courseId, "deck")
    }
    const response = await apollo.query<{
        readonly myInProgressFlashcardQuizSession: GraphQLResponse<QuizSessionData>
    }>({ query: quizByCourseQuery, variables: { courseId: request.courseId } })
    const data = response.data?.myInProgressFlashcardQuizSession.data
    if (data == null || (request.sessionId !== undefined && data.sessionId !== request.sessionId)) return null
    return hydrate(data, "quiz", request.courseId)
}
