import { CourseFlashcardsQuizBlock } from "@/components/blocks/learn/CourseFlashcardsQuizBlock"

/** Route identity passed to the connected flashcard block. */
export type CourseFlashcardsQuizPageProps = { readonly displayId: string, readonly deckId?: string }

/** Route shell composed from the connected flashcard block. */
export const CourseFlashcardsQuizPageBase = (props: CourseFlashcardsQuizPageProps) => <CourseFlashcardsQuizBlock {...props} />

/** Ownership metadata for the route shell. */
