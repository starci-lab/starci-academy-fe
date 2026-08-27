"use client"

import { CoursePersonalProjectPageBase, type CoursePersonalProjectPageProps } from "./component"

/** Render the route shell; the connected block owns project data and block states. */
export const CoursePersonalProjectPage = (props: CoursePersonalProjectPageProps) => <CoursePersonalProjectPageBase {...props} />

export * from "./component"
