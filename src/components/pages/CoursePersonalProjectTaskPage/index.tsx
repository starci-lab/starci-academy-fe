"use client"

import { CoursePersonalProjectTaskPageBase, type CoursePersonalProjectTaskPageProps } from "./component"

/** Route shell carrying only the task and project identity. */
export const CoursePersonalProjectTaskPage = (props: CoursePersonalProjectTaskPageProps) => (
    <CoursePersonalProjectTaskPageBase {...props} />
)

export type { CoursePersonalProjectTaskPageProps }
