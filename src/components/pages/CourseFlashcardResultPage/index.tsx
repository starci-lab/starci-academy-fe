"use client"
import { CourseFlashcardResultPageBase } from "./component"
/** Render the flashcard result route shell. */
export const CourseFlashcardResultPage = (input: Parameters<typeof CourseFlashcardResultPageBase>[0]) => <CourseFlashcardResultPageBase {...input} />
export * from "./component"
/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
