"use client"
import { CoursePlaygroundSessionPageShell, type CoursePlaygroundSessionRouteProps } from "./component"
/** Route entry carrying only playground identity. */
export const CoursePlaygroundSessionPage = (props: CoursePlaygroundSessionRouteProps) => <CoursePlaygroundSessionPageShell {...props} />
/** Source-level ownership marker for the connected route entry. */
export const meta = { world: "connected", domain: "learn" } as const
