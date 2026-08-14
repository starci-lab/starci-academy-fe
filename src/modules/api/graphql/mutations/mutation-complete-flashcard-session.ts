import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse } from "../types"
import type { FlashcardQuizAnswer, FlashcardReviewKind } from "../queries/query-my-in-progress-flashcard-session"

/** Final snapshot for a deck or due-review session. */
export type CompleteFlashcardReviewSessionRequest = {
    readonly mode: "review"
    readonly kind: FlashcardReviewKind
    readonly sessionId: string
    readonly reviewedCount: number
    readonly xpEarned: number
}

/** Final scored answer set for one quiz session. */
export type CompleteFlashcardQuizSessionRequest = {
    readonly mode: "quiz"
    readonly sessionId: string
    readonly courseId: string
    readonly answers: ReadonlyArray<FlashcardQuizAnswer>
}

/** Backend-proven completion requests supported by the live page. */
export type CompleteFlashcardSessionRequest = CompleteFlashcardReviewSessionRequest | CompleteFlashcardQuizSessionRequest

/** Completion counters needed before navigating to the persisted result. */
export type CompleteFlashcardSessionData = {
    readonly reviewedCount: number
    readonly xpEarned: number
}

const completeReviewDocument = gql`
    mutation CompleteFlashcardReviewSession($request: CompleteFlashcardReviewSessionRequest!) {
        completeFlashcardReviewSession(request: $request) {
            success message error
            data { reviewedCount xpEarned }
        }
    }
`

const completeDueDocument = gql`
    mutation CompleteFlashcardDueReviewSession($request: CompleteFlashcardDueReviewSessionRequest!) {
        completeFlashcardDueReviewSession(request: $request) {
            success message error
            data { reviewedCount xpEarned }
        }
    }
`

const completeQuizDocument = gql`
    mutation CompleteFlashcardQuizSession($request: CompleteFlashcardQuizSessionRequest!) {
        completeFlashcardQuizSession(request: $request) {
            success message error
            data { xpEarned }
        }
    }
`

/** Completes the exact deck, due-review, or quiz backend session. */
export const mutationCompleteFlashcardSession = async (
    request: CompleteFlashcardSessionRequest,
): Promise<CompleteFlashcardSessionData | null> => {
    const apollo = createApolloClient({ withAuth: true })
    if (request.mode === "review") {
        const variables = {
            request: {
                sessionId: request.sessionId,
                reviewedCount: request.reviewedCount,
                xpEarned: request.xpEarned,
            },
        }
        if (request.kind === "due") {
            const response = await apollo.mutate<{
                readonly completeFlashcardDueReviewSession: GraphQLResponse<CompleteFlashcardSessionData>
            }>({ mutation: completeDueDocument, variables })
            return response.data?.completeFlashcardDueReviewSession.data ?? null
        }
        const response = await apollo.mutate<{
            readonly completeFlashcardReviewSession: GraphQLResponse<CompleteFlashcardSessionData>
        }>({ mutation: completeReviewDocument, variables })
        return response.data?.completeFlashcardReviewSession.data ?? null
    }
    const response = await apollo.mutate<{
        readonly completeFlashcardQuizSession: GraphQLResponse<{ readonly xpEarned: number }>
    }>({
        mutation: completeQuizDocument,
        variables: {
            request: {
                sessionId: request.sessionId,
                courseId: request.courseId,
                answers: request.answers,
            },
        },
    })
    const data = response.data?.completeFlashcardQuizSession.data
    return data == null ? null : { reviewedCount: request.answers.length, xpEarned: data.xpEarned }
}
