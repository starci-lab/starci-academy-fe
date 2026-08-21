import useSWR from "swr"
import { queryMyFlashcardQuizHistory } from "@/modules/api/graphql/queries/query-my-flashcard-quiz-history"

/** Reads quiz history only while its panel is active. */
export const useQueryMyFlashcardQuizHistorySwr = (courseId?: string, enabled = true) => useSWR(
    courseId === undefined || !enabled ? null : ["my-flashcard-quiz-history", courseId],
    ([, id]) => queryMyFlashcardQuizHistory(id),
)
