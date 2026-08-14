import type { GraphQLResponse } from "../../types"
import type { ContentAiScope } from "../../queries/types/content-ai-sessions"

/** Backend request for a lazily-created content-AI conversation. */
export interface CreateContentAiSessionRequest {
    readonly scope?: ContentAiScope
    readonly contentId?: string
    readonly taskId?: string
    readonly challengeId?: string
    readonly quizId?: string
    readonly foundationId?: string
    readonly courseId?: string
    readonly archived?: boolean
}

/** New conversation identity; null means no eligible owner could be resolved. */
export interface CreateContentAiSessionData {
    readonly id: string | null
}

/** Standard GraphQL envelope returned by `createContentAiSession`. */
export interface MutationCreateContentAiSessionResponse {
    readonly createContentAiSession: GraphQLResponse<CreateContentAiSessionData>
}
