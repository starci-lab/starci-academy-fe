import { FlashcardResultBlock } from "@/components/blocks/learn/FlashcardResult"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"
/** Route identity passed to the connected result block. */
export type CourseFlashcardResultPageProps = { readonly displayId: string; readonly sessionId: string; readonly mode: "review" | "quiz" }
/** Flashcard result page shell; the connected block owns result query and navigation. */
export const CourseFlashcardResultPageBase = (input: CourseFlashcardResultPageProps) => <Tree contract="course-flashcard-result-page" render={defineContractComponent("course-flashcard-result-page", { workspace: defineContractProjection("flashcard-result-workspace", () => <FlashcardResultBlock {...input} />) })} />
/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
