import type { GraphQLResponse } from "../../types"

/** Delete one owned conversation and its saved turns. */
export interface DeleteContentAiSessionRequest { readonly sessionId: string }

/** Whether the owned conversation was removed. */
export interface DeleteContentAiSessionData { readonly cleared: boolean }

/** Standard GraphQL envelope returned by `deleteContentAiSession`. */
export interface MutationDeleteContentAiSessionResponse {
    readonly deleteContentAiSession: GraphQLResponse<DeleteContentAiSessionData>
}
