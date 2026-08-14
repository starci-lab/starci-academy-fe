import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse } from "../types"
import type { FlashcardQuizAnswer, FlashcardSessionMode } from "./query-my-in-progress-flashcard-session"

/** Normalized result projection shared by the review and quiz result pages. */
export type FlashcardSessionResult = {
    readonly sessionId: string
    readonly mode: FlashcardSessionMode
    readonly status: string
    readonly reviewedCount: number
    readonly scorePercent: number
    readonly xpEarned: number
    readonly durationSeconds?: number | null
    readonly nextDueAt?: string | null
    readonly gradeCounts?: { readonly again: number, readonly hard: number, readonly good: number, readonly easy: number }
    readonly weakTags: Array<{ readonly tag: string, readonly value: number }>
    readonly results: Array<FlashcardQuizAnswer>
}

const reviewResultQuery = gql`
    query MyFlashcardReviewSessionStatsBySessionId($sessionId: ID!) {
        myFlashcardReviewSessionStatsBySessionId(sessionId: $sessionId) {
            success
            message
            error
            data {
                sessionId status reviewedCount durationSeconds xpEarned nextDueAt
                gradeCounts { again hard good easy }
                weakTags { tag forgotCount }
            }
        }
    }
`

const quizResultQuery = gql`
    query MyFlashcardQuizSessionBySessionId($sessionId: ID!) {
        myFlashcardQuizSessionBySessionId(sessionId: $sessionId) {
            success
            message
            error
            data {
                sessionId status coverage xpEarned answeredCount durationSeconds
                weakTags { tag coverage }
                results { cardId correctBlanks totalBlanks }
            }
        }
    }
`

/** Reads one owner-scoped result from the backend projection for its route mode. */
export const queryFlashcardSessionResult = async (
    mode: FlashcardSessionMode,
    sessionId: string,
): Promise<FlashcardSessionResult | null> => {
    const apollo = createApolloClient({ withAuth: true })
    if (mode === "review") {
        const response = await apollo.query<{
            readonly myFlashcardReviewSessionStatsBySessionId: GraphQLResponse<{
                readonly sessionId: string
                readonly status: string
                readonly reviewedCount: number
                readonly durationSeconds?: number | null
                readonly xpEarned: number
                readonly nextDueAt?: string | null
                readonly gradeCounts: { readonly again: number, readonly hard: number, readonly good: number, readonly easy: number }
                readonly weakTags: Array<{ readonly tag: string, readonly forgotCount: number }>
            }>
        }>({ query: reviewResultQuery, variables: { sessionId } })
        const data = response.data?.myFlashcardReviewSessionStatsBySessionId.data
        if (data === undefined) return null
        const successful = data.gradeCounts.good + data.gradeCounts.easy
        const total = data.gradeCounts.again + data.gradeCounts.hard + successful
        return {
            ...data,
            mode,
            scorePercent: total === 0 ? 0 : Math.round(successful / total * 100),
            weakTags: data.weakTags.map((item) => ({ tag: item.tag, value: item.forgotCount })),
            results: [],
        }
    }
    const response = await apollo.query<{
        readonly myFlashcardQuizSessionBySessionId: GraphQLResponse<{
            readonly sessionId: string
            readonly status: string
            readonly coverage?: number | null
            readonly xpEarned: number
            readonly answeredCount: number
            readonly durationSeconds?: number | null
            readonly weakTags: Array<{ readonly tag: string, readonly coverage: number }>
            readonly results: Array<FlashcardQuizAnswer>
        }>
    }>({ query: quizResultQuery, variables: { sessionId } })
    const data = response.data?.myFlashcardQuizSessionBySessionId.data
    if (data === undefined) return null
    return {
        ...data,
        mode,
        reviewedCount: data.answeredCount,
        scorePercent: Math.round((data.coverage ?? 0) * 100),
        weakTags: data.weakTags.map((item) => ({ tag: item.tag, value: Math.round(item.coverage * 100) })),
    }
}
