import { type GraphQLResponse } from "../../types"

/** Closed readiness bands emitted by the backend. */
export type JobReadinessBand = "needsWork" | "building" | "jobReady"

/** Course-independent readiness signals for the authenticated learner. */
export type JobReadinessFoundation = {
    readonly codingPercentile: number | null
    readonly cvScore: number | null
}

/** Readiness depth and evidence for one purchased course track. */
export type JobReadinessTrack = {
    readonly courseId: string
    readonly courseTitle: string
    readonly courseSlug: string
    readonly capstoneScore: number | null
    readonly interviewScore: number | null
    readonly cvScore: number | null
    readonly depthScore: number | null
    readonly band: JobReadinessBand
    readonly isQualified: boolean
}

/** The complete self-scoped job-readiness payload. */
export type MyJobReadinessData = {
    readonly foundation: JobReadinessFoundation
    readonly tracks: Array<JobReadinessTrack>
}

/** Standard GraphQL envelope returned by the self-scoped readiness query. */
export type QueryMyJobReadinessResponse = {
    readonly myJobReadiness: GraphQLResponse<MyJobReadinessData | null>
}
