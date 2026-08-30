import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse } from "../types"
import type { FlashcardQuizItem, FlashcardQuizSelection, FlashcardReviewKind } from "../queries/query-my-in-progress-flashcard-session"

/** Progress snapshot shared by deck and due-review session stores. */
export type SyncFlashcardReviewSessionRequest = {
    readonly mode: "review"
    readonly kind: FlashcardReviewKind
    readonly sessionId: string
    readonly currentIndex: number
    readonly reviewedCount: number
    readonly gradedIndexes: ReadonlyArray<number>
    readonly xpEarned: number
}

/** Progress snapshot for one resumable quick quiz. */
export type SyncFlashcardQuizSessionRequest = {
    readonly mode: "quiz"
    readonly sessionId: string
    readonly currentIndex: number
    readonly expectedVersion: number
    readonly selections: ReadonlyArray<FlashcardQuizSelection>
}

/** Authoritative quiz state returned after a versioned sync. */
export type SyncFlashcardQuizSessionData = {
    readonly sessionId: string
    readonly contractVersion: number
    readonly items: ReadonlyArray<FlashcardQuizItem>
    readonly currentIndex: number
    readonly answerState: ReadonlyArray<FlashcardQuizSelection>
    readonly answerVersion: number
    readonly status: string
}

/** Backend-proven progress snapshots supported by the live page. */
export type SyncFlashcardSessionRequest = SyncFlashcardReviewSessionRequest | SyncFlashcardQuizSessionRequest

/** SM-2 grade request attributed to one persisted review session. */
export type RateFlashcardRequest = {
    readonly cardId: string
    readonly sessionId: string
    readonly grade: 0 | 1 | 2 | 3
}

/** Scheduling and XP outcome returned by one SM-2 grade. */
export type RateFlashcardData = { readonly dueAt: string; readonly xpEarned: number }

const syncReviewDocument = gql`
    mutation SyncFlashcardReviewSessionProgress($request: SyncFlashcardReviewSessionProgressRequest!) {
        syncFlashcardReviewSessionProgress(request: $request) {
            success message error
            data { success }
        }
    }
`

const syncDueDocument = gql`
    mutation SyncFlashcardDueReviewSessionProgress($request: SyncFlashcardDueReviewSessionProgressRequest!) {
        syncFlashcardDueReviewSessionProgress(request: $request) {
            success message error
            data { success }
        }
    }
`

const syncQuizDocument = gql`
    mutation SyncFlashcardQuizSessionProgress($request: SyncFlashcardQuizSessionProgressRequest!) {
        syncFlashcardQuizSessionProgress(request: $request) {
            success message error
            data {
                sessionId contractVersion currentIndex answerVersion status
                answerState { blankId tokenId }
                items { cardId question clozeText blanks { blankId hint } tokens { tokenId label } }
            }
        }
    }
`

const rateDocument = gql`
    mutation ReviewFlashcard($request: ReviewFlashcardRequest!) {
        reviewFlashcard(request: $request) {
            success message error
            data { dueAt xpEarned }
        }
    }
`

/** Dispatches a resumable progress snapshot to its exact backend session family. */
export const mutationSyncFlashcardSession = async (request: SyncFlashcardSessionRequest): Promise<boolean | SyncFlashcardQuizSessionData | null> => {
    const apollo = createApolloClient({ withAuth: true })
    if (request.mode === "review") {
        const variables = {
            request: {
                sessionId: request.sessionId,
                currentIndex: request.currentIndex,
                reviewedCount: request.reviewedCount,
                gradedIndexes: request.gradedIndexes,
                xpEarned: request.xpEarned,
            },
        }
        if (request.kind === "due") {
            const response = await apollo.mutate<{
                readonly syncFlashcardDueReviewSessionProgress: GraphQLResponse<{ readonly success: boolean }>
            }>({ mutation: syncDueDocument, variables })
            return response.data?.syncFlashcardDueReviewSessionProgress.data?.success === true
        }
        const response = await apollo.mutate<{
            readonly syncFlashcardReviewSessionProgress: GraphQLResponse<{ readonly success: boolean }>
        }>({ mutation: syncReviewDocument, variables })
        return response.data?.syncFlashcardReviewSessionProgress.data?.success === true
    }
    const response = await apollo.mutate<{
        readonly syncFlashcardQuizSessionProgress: GraphQLResponse<SyncFlashcardQuizSessionData>
    }>({
        mutation: syncQuizDocument,
        variables: {
            request: {
                sessionId: request.sessionId,
                currentIndex: request.currentIndex,
                expectedVersion: request.expectedVersion,
                selections: request.selections.map(({ blankId, tokenId }) => ({ blankId, tokenId })),
            },
        },
    })
    const envelope = response.data?.syncFlashcardQuizSessionProgress
    if (envelope?.data == null) throw new Error(envelope?.error ?? envelope?.message ?? "QUIZ_SYNC_REJECTED")
    return envelope.data
}

/** Grades one review card and returns its backend-computed scheduling outcome. */
export const mutationRateFlashcard = async (request: RateFlashcardRequest): Promise<RateFlashcardData | null> => {
    const apollo = createApolloClient({ withAuth: true })
    const response = await apollo.mutate<{
        readonly reviewFlashcard: GraphQLResponse<RateFlashcardData>
    }>({ mutation: rateDocument, variables: { request } })
    return response.data?.reviewFlashcard.data ?? null
}
