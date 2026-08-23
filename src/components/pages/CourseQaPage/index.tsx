"use client"
import { CourseQaPageBase } from "./component"
/** Render the course Q&A route shell. */
export const CourseQaPage = (input: Parameters<typeof CourseQaPageBase>[0]) => <CourseQaPageBase {...input} />
export * from "./component"
/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
