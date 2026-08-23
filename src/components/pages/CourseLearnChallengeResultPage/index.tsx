"use client"
import { CourseLearnChallengeResultPageBase } from "./component"
/** Render the challenge result route shell. */
export const CourseLearnChallengeResultPage = (input: Parameters<typeof CourseLearnChallengeResultPageBase>[0]) => <CourseLearnChallengeResultPageBase {...input} />
export * from "./component"
/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
