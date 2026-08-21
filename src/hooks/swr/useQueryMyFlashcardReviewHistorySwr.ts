import useSWR from "swr"
import { queryMyFlashcardReviewHistory } from "@/modules/api/graphql/queries/query-my-flashcard-review-history"

/** Reads review history only while its panel is active. */
export const useQueryMyFlashcardReviewHistorySwr = (courseId?: string, enabled = true) => useSWR(
    courseId === undefined || !enabled ? null : ["my-flashcard-review-history", courseId],
    ([, id]) => queryMyFlashcardReviewHistory(id),
)
