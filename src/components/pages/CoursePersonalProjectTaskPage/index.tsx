"use client"

import { CoursePersonalProjectTaskPageBase, type CoursePersonalProjectTaskPageProps } from "./component"

/** Route shell carrying only the task and project identity. */
export const CoursePersonalProjectTaskPage = (props: CoursePersonalProjectTaskPageProps) => (
    <CoursePersonalProjectTaskPageBase {...props} />
)

export type { CoursePersonalProjectTaskPageProps }

/** Source-level ownership marker for the route identity adapter. */
export const meta = { world: "connected", domain: "learn" } as const
