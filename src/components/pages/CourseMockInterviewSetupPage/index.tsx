"use client"

import { CourseMockInterviewSetupPageBase, type CourseMockInterviewSetupPageProps } from "./component"

/** Connected route entry that supplies route identity only. */
export const CourseMockInterviewSetupPage = (props: CourseMockInterviewSetupPageProps) => <CourseMockInterviewSetupPageBase {...props} />

/** Ownership metadata for the route entry. */
export const meta = { world: "connected", domain: "learn" } as const
