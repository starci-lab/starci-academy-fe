"use client"

import { CoursePersonalProjectPageBase, type CoursePersonalProjectPageProps } from "./component"

/** Render the route shell; the connected block owns project data and block states. */
export const CoursePersonalProjectPage = (input: CoursePersonalProjectPageProps) => <CoursePersonalProjectPageBase {...input} />

export * from "./component"

/** Source-level ownership marker for the connected route entry. */
export const meta = { world: "connected", domain: "learn" } as const
