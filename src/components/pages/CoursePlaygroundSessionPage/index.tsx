"use client"
import { CoursePlaygroundSessionPageShell, type CoursePlaygroundSessionPageShellProps } from "./component"
/** Route entry carrying only playground identity. */
export type CoursePlaygroundSessionPageProps = CoursePlaygroundSessionPageShellProps
/** Render the session route for the requested course playground. */
export const CoursePlaygroundSessionPage = (props: CoursePlaygroundSessionPageProps) => <CoursePlaygroundSessionPageShell {...props} />
