import useSWR from "swr"
import { queryFlashcardSessionResult, type FlashcardSessionResult } from "@/modules/api/graphql/queries/query-flashcard-session-result"
import type { FlashcardSessionMode } from "@/modules/api/graphql/queries/query-my-in-progress-flashcard-session"

/** Stable cache family for persisted flashcard result routes. */
export const QUERY_FLASHCARD_SESSION_RESULT_SWR_KEY = "QUERY_FLASHCARD_SESSION_RESULT_SWR"

/** Reads the result projection selected by the review or quiz route mode. */
export const useQueryFlashcardSessionResultSwr = (mode?: FlashcardSessionMode, sessionId?: string) => useSWR<FlashcardSessionResult | null>(
    mode === undefined || sessionId === undefined
        ? null
        : [QUERY_FLASHCARD_SESSION_RESULT_SWR_KEY, mode, sessionId],
    async () => queryFlashcardSessionResult(mode as FlashcardSessionMode, sessionId ?? ""),
)
