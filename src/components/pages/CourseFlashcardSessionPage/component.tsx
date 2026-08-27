import { CourseFlashcardSessionBlock } from "@/components/blocks/learn/CourseFlashcardSessionBlock"

/** Route identity passed to the connected flashcard block. */
export type CourseFlashcardSessionPageProps = { readonly displayId: string; readonly sessionId: string; readonly mode: "review" | "quiz" }

/** Route shell composed from the connected flashcard block. */
export const CourseFlashcardSessionPageBase = (props: CourseFlashcardSessionPageProps) => <CourseFlashcardSessionBlock {...props} />

/** Ownership metadata for the route shell. */
