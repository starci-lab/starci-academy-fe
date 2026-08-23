"use client"

import { CourseLearnContentHomePageBase, type CourseLearnContentHomePageProps } from "./component"

/** Connected route entry that supplies route identity only. */
export const CourseLearnContentHomePage = (props: CourseLearnContentHomePageProps) => <CourseLearnContentHomePageBase {...props} />

/** Ownership metadata for the route entry. */
export const meta = { world: "connected", domain: "learn" } as const
