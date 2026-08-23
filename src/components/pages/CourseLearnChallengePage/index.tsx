"use client"
import { CourseLearnChallengePageBase, type CourseLearnChallengePageProps } from "./component"
/** Connected challenge route entry. */
export const CourseLearnChallengePage = (props: CourseLearnChallengePageProps) => <CourseLearnChallengePageBase {...props} />
/** Ownership metadata for the route entry. */
export const meta = { world: "connected", domain: "learn" } as const
