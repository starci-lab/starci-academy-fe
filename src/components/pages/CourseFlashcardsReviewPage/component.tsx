import { CourseFlashcardsReviewBlock } from "@/components/blocks/learn/CourseFlashcardsReviewBlock"

/** Route identity passed to the connected flashcard block. */
export type CourseFlashcardsReviewPageProps = { readonly displayId: string }

/** Route shell composed from the connected flashcard block. */
export const CourseFlashcardsReviewPageBase = (props: CourseFlashcardsReviewPageProps) => <CourseFlashcardsReviewBlock {...props} />

/** Ownership metadata for the route shell. */
