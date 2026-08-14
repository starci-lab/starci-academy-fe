import useSWR from "swr"
import { queryMyFlashcardStats, type FlashcardStats } from "@/modules/api/graphql/queries/query-my-flashcard-stats"

/** Stable cache family for the viewer's aggregate flashcard mastery facts. */
export const QUERY_MY_FLASHCARD_STATS_SWR_KEY = "QUERY_MY_FLASHCARD_STATS_SWR"

/** Reads viewer mastery facts only after an authenticated course context exists. */
export const useQueryMyFlashcardStatsSwr = (enabled = true) => useSWR<FlashcardStats | null>(
    enabled ? QUERY_MY_FLASHCARD_STATS_SWR_KEY : null,
    queryMyFlashcardStats,
)
