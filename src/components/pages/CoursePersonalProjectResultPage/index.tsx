"use client"
import { CoursePersonalProjectResultPageBase } from "./component"
/** Render the personal-project result page shell. */
export const CoursePersonalProjectResultPage = (input: Parameters<typeof CoursePersonalProjectResultPageBase>[0]) => <CoursePersonalProjectResultPageBase {...input} />
export * from "./component"
/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
