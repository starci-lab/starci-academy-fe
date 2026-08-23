"use client"
import { CoursePlaygroundPageBase } from "./component"
/** Render the playground route shell. */
export const CoursePlaygroundPage = (input: Parameters<typeof CoursePlaygroundPageBase>[0]) => <CoursePlaygroundPageBase {...input} />
export * from "./component"
/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
