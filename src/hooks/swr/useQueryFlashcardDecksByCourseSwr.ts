import useSWR from "swr"
import {
    queryFlashcardDecksByCourse,
    queryMyDueFlashcards,
    type DueFlashcardsData,
    type FlashcardDeck,
} from "@/modules/api/graphql/queries/query-flashcard-decks-by-course"

/** Stable cache family for one course's flashcard deck inventory. */
export const QUERY_FLASHCARD_DECKS_BY_COURSE_SWR_KEY = "QUERY_FLASHCARD_DECKS_BY_COURSE_SWR"

/** Reads the localized deck inventory after the course id has resolved. */
export const useQueryFlashcardDecksByCourseSwr = (courseId?: string) => useSWR<ReadonlyArray<FlashcardDeck> | null>(
    courseId === undefined ? null : [QUERY_FLASHCARD_DECKS_BY_COURSE_SWR_KEY, courseId],
    async () => queryFlashcardDecksByCourse(courseId ?? ""),
)

/** Stable cache family for one course's due-review draw. */
export const QUERY_MY_DUE_FLASHCARDS_SWR_KEY = "QUERY_MY_DUE_FLASHCARDS_SWR"

/** Reads the exact currently due card set used by the due-session start mutation. */
export const useQueryMyDueFlashcardsSwr = (courseId?: string) => useSWR<DueFlashcardsData | null>(
    courseId === undefined ? null : [QUERY_MY_DUE_FLASHCARDS_SWR_KEY, courseId],
    async () => queryMyDueFlashcards(courseId ?? ""),
)
