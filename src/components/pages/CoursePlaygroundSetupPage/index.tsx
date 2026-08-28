"use client"
import { CoursePlaygroundSetupPageShell, type CoursePlaygroundSetupPageShellProps } from "./component"
/** Route entry carrying only playground identity. */
export type CoursePlaygroundSetupPageProps = CoursePlaygroundSetupPageShellProps
/** Render the setup route for the requested course playground. */
export const CoursePlaygroundSetupPage = (props: CoursePlaygroundSetupPageProps) => <CoursePlaygroundSetupPageShell {...props} />
