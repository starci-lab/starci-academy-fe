import useSWR from "swr"
import {
    queryMyInProgressFlashcardSession,
    type FlashcardSession,
    type QueryFlashcardSessionRequest,
} from "@/modules/api/graphql/queries/query-my-in-progress-flashcard-session"

/** Stable cache family for hydrated resumable flashcard sessions. */
export const QUERY_MY_IN_PROGRESS_FLASHCARD_SESSION_SWR_KEY = "QUERY_MY_IN_PROGRESS_FLASHCARD_SESSION_SWR"

/** Resolves the persisted deck, due-review, or quiz session selected by the request. */
export const useQueryMyInProgressFlashcardSessionSwr = (request?: QueryFlashcardSessionRequest) => useSWR<FlashcardSession | null>(
    request === undefined
        ? null
        : [
            QUERY_MY_IN_PROGRESS_FLASHCARD_SESSION_SWR_KEY,
            request.mode,
            request.courseId,
            request.mode === "review" ? request.deckId : undefined,
            request.mode === "review" ? request.deckIds?.join(",") : undefined,
            request.sessionId,
            request.mode === "review" ? request.reviewKind : undefined,
        ],
    async () => queryMyInProgressFlashcardSession(request as QueryFlashcardSessionRequest),
)
