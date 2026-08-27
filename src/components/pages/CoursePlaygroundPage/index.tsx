"use client"
import { CoursePlaygroundPageBase } from "./component"
/** Render the playground route shell. */
import type { CoursePlaygroundPageProps } from "./component"
/** Connected playground catalog route. */
export const CoursePlaygroundPage = (props: CoursePlaygroundPageProps) => <CoursePlaygroundPageBase {...props} />
export * from "./component"
