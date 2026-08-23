"use client"

import { CourseLearnContentPageBase, type CourseLearnContentPageProps } from "./component"

/** Connected route entry that supplies route identity only. */
export const CourseLearnContentPage = (props: CourseLearnContentPageProps) => <CourseLearnContentPageBase {...props} />

/** Ownership metadata for the route entry. */
export const meta = { world: "connected", domain: "learn" } as const
