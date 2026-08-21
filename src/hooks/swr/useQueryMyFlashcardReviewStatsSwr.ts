import useSWR from "swr"
import { queryMyFlashcardReviewStats } from "@/modules/api/graphql/queries/query-my-flashcard-review-stats"

/** Reads course review health only while its panel is active. */
export const useQueryMyFlashcardReviewStatsSwr = (courseId?: string, enabled = true) => useSWR(
    courseId === undefined || !enabled ? null : ["my-flashcard-review-stats", courseId],
    ([, id]) => queryMyFlashcardReviewStats(id),
)
