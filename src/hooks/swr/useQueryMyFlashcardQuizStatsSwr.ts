import useSWR from "swr"
import { queryMyFlashcardQuizStats } from "@/modules/api/graphql/queries/query-my-flashcard-quiz-stats"

/** Reads aggregate quiz coverage only while its panel is active. */
export const useQueryMyFlashcardQuizStatsSwr = (courseId?: string, enabled = true) => useSWR(
    courseId === undefined || !enabled ? null : ["my-flashcard-quiz-stats", courseId],
    ([, id]) => queryMyFlashcardQuizStats(id),
)
