import { FlashcardResultBlock } from "@/components/blocks/learn/FlashcardResult"
/** Route identity passed to the connected result block. */
export type CourseFlashcardResultPageProps = { readonly displayId: string; readonly sessionId: string; readonly mode: "review" | "quiz" }
/** Flashcard result page shell; the connected block owns result query and navigation. */
export const CourseFlashcardResultPageBase = (props: CourseFlashcardResultPageProps) => <FlashcardResultBlock {...props} />
