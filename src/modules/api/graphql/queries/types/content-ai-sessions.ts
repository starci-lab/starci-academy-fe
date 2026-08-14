import type { GraphQLResponse } from "../../types"

/** Every grounding surface accepted by the content-AI session API. */
export type ContentAiScope =
    | "content"
    | "task"
    | "challenge"
    | "quiz"
    | "foundation"
    | "course"
    | "global"

/** Filters accepted by the authenticated conversation-list query. */
export interface QueryContentAiSessionsRequest {
    readonly scope?: ContentAiScope
    readonly contentId?: string
    readonly taskId?: string
    readonly challengeId?: string
    readonly quizId?: string
    readonly foundationId?: string
    readonly courseId?: string
    readonly search?: string
    readonly limit?: number
    readonly offset?: number
    readonly includeArchived?: boolean
}

/** One persisted conversation summary, ordered by recent activity. */
export interface ContentAiSession {
    readonly id: string
    readonly title: string | null
    readonly updatedAt: string
    readonly messageCount: number
    readonly scope: ContentAiScope
    readonly originContentId: string | null
    readonly originContentTitle: string | null
    readonly snippet: string | null
}

/** Payload returned by the conversation-list query. */
export interface ContentAiSessionsData {
    readonly sessions: ReadonlyArray<ContentAiSession>
}

/** Standard GraphQL envelope returned by `contentAiSessions`. */
export interface QueryContentAiSessionsResponse {
    readonly contentAiSessions: GraphQLResponse<ContentAiSessionsData>
}
