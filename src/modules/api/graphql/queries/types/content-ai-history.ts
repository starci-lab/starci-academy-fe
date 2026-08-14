import type { GraphQLResponse } from "../../types"

/** The only persisted authors the content-AI service writes. */
export type ContentAiHistoryRole = "user" | "assistant"

/** Request for one owned conversation's saved turns. */
export interface QueryContentAiHistoryRequest {
    readonly sessionId: string
}

/** One saved turn, returned oldest first. */
export interface ContentAiHistoryTurn {
    readonly role: ContentAiHistoryRole
    readonly content: string
}

/** Persisted transcript payload. */
export interface ContentAiHistoryData {
    readonly messages: ReadonlyArray<ContentAiHistoryTurn>
}

/** Standard GraphQL envelope returned by `contentAiSessionMessages`. */
export interface QueryContentAiHistoryResponse {
    readonly contentAiSessionMessages: GraphQLResponse<ContentAiHistoryData>
}
