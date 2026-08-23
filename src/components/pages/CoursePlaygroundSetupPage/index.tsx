"use client"
import { CoursePlaygroundSetupPageShell, type CoursePlaygroundSetupRouteProps } from "./component"
/** Route entry carrying only playground identity. */
export const CoursePlaygroundSetupPage = (props: CoursePlaygroundSetupRouteProps) => <CoursePlaygroundSetupPageShell {...props} />
/** Source-level ownership marker for the connected route entry. */
export const meta = { world: "connected", domain: "learn" } as const
