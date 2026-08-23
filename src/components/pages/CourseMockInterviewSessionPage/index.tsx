"use client"

import { CourseMockInterviewSessionPageBase, type CourseMockInterviewSessionPageProps } from "./component"

/** Connected route entry that supplies route identity only. */
export const CourseMockInterviewSessionPage = (props: CourseMockInterviewSessionPageProps) => <CourseMockInterviewSessionPageBase {...props} />

/** Ownership metadata for the route entry. */
export const meta = { world: "connected", domain: "learn" } as const
