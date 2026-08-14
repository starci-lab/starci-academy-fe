import type { GraphQLResponse } from "../../types"

/** Bump one owned conversation's recency after it is opened. */
export interface TouchContentAiSessionRequest { readonly sessionId: string }

/** Whether the owned conversation recency was bumped. */
export interface TouchContentAiSessionData { readonly touched: boolean }

/** Standard GraphQL envelope returned by `touchContentAiSession`. */
export interface MutationTouchContentAiSessionResponse {
    readonly touchContentAiSession: GraphQLResponse<TouchContentAiSessionData>
}
