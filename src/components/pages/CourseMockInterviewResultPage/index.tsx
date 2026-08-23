"use client"

import { CourseMockInterviewResultPageBase, type CourseMockInterviewResultPageProps } from "./component"

/** Connected route entry that supplies route identity only. */
export const CourseMockInterviewResultPage = (props: CourseMockInterviewResultPageProps) => <CourseMockInterviewResultPageBase {...props} />

/** Ownership metadata for the route entry. */
export const meta = { world: "connected", domain: "learn" } as const
