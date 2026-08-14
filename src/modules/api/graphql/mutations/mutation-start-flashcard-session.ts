import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse } from "../types"
import type { FlashcardReviewKind, FlashcardSessionMode } from "../queries/query-my-in-progress-flashcard-session"

/** Starts a persisted review run for one deck. */
export type StartFlashcardDeckReviewSessionRequest = {
    readonly mode: "review"
    readonly kind: "deck"
    readonly deckId: string
    readonly cardIds: ReadonlyArray<string>
    readonly reviewMode?: "full" | "due"
}

/** Starts a persisted cross-deck due-review run for one course. */
export type StartFlashcardDueReviewSessionRequest = {
    readonly mode: "review"
    readonly kind: "due"
    readonly courseId: string
    readonly cardIds: ReadonlyArray<string>
}

/** Starts a persisted course-level quick quiz. */
export type StartFlashcardQuizSessionRequest = {
    readonly mode: "quiz"
    readonly courseId: string
    readonly cardIds: ReadonlyArray<string>
    readonly practiceMode: "quick" | "deep"
    readonly level: string | null
    readonly name?: string
}

/** Backend-proven start requests supported by the flashcard pages. */
export type StartFlashcardSessionRequest =
    | StartFlashcardDeckReviewSessionRequest
    | StartFlashcardDueReviewSessionRequest
    | StartFlashcardQuizSessionRequest

/** Stable identity returned after a flashcard session is persisted. */
export type StartFlashcardSessionData = {
    readonly sessionId: string
    readonly mode: FlashcardSessionMode
    readonly kind?: FlashcardReviewKind
    readonly deadlineAt?: string | null
}

const startReviewDocument = gql`
    mutation StartFlashcardReviewSession($request: StartFlashcardReviewSessionRequest!) {
        startFlashcardReviewSession(request: $request) {
            success message error
            data { sessionId }
        }
    }
`

const startDueDocument = gql`
    mutation StartFlashcardDueReviewSession($request: StartFlashcardDueReviewSessionRequest!) {
        startFlashcardDueReviewSession(request: $request) {
            success message error
            data { sessionId }
        }
    }
`

const startQuizDocument = gql`
    mutation StartFlashcardQuizSession($request: StartFlashcardQuizSessionRequest!) {
        startFlashcardQuizSession(request: $request) {
            success message error
            data { sessionId deadlineAt }
        }
    }
`

/** Dispatches the exact deck, due-review, or quiz start mutation. */
export const mutationStartFlashcardSession = async (
    request: StartFlashcardSessionRequest,
): Promise<StartFlashcardSessionData | null> => {
    const apollo = createApolloClient({ withAuth: true })
    if (request.mode === "review") {
        if (request.kind === "due") {
            const response = await apollo.mutate<{
                readonly startFlashcardDueReviewSession: GraphQLResponse<{ readonly sessionId: string }>
            }>({
                mutation: startDueDocument,
                variables: { request: { courseId: request.courseId, cardIds: request.cardIds } },
            })
            const data = response.data?.startFlashcardDueReviewSession.data
            return data == null ? null : { ...data, mode: "review", kind: "due" }
        }
        const response = await apollo.mutate<{
            readonly startFlashcardReviewSession: GraphQLResponse<{ readonly sessionId: string }>
        }>({
            mutation: startReviewDocument,
            variables: {
                request: {
                    deckId: request.deckId,
                    cardIds: request.cardIds,
                    mode: request.reviewMode,
                },
            },
        })
        const data = response.data?.startFlashcardReviewSession.data
        return data == null ? null : { ...data, mode: "review", kind: "deck" }
    }
    const response = await apollo.mutate<{
        readonly startFlashcardQuizSession: GraphQLResponse<{
            readonly sessionId: string
            readonly deadlineAt: string
        }>
    }>({
        mutation: startQuizDocument,
        variables: {
            request: {
                courseId: request.courseId,
                cardIds: request.cardIds,
                mode: request.practiceMode,
                level: request.level,
                name: request.name,
            },
        },
    })
    const data = response.data?.startFlashcardQuizSession.data
    return data == null ? null : { ...data, mode: "quiz" }
}
