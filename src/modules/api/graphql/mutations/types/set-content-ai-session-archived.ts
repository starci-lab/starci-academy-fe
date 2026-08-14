import type { GraphQLResponse } from "../../types"

/** Set the reversible archive state of one owned conversation. */
export interface SetContentAiSessionArchivedRequest {
    readonly sessionId: string
    readonly archived: boolean
}

/** The persisted archive state after the mutation. */
export interface SetContentAiSessionArchivedData { readonly archived: boolean }

/** Standard GraphQL envelope returned by `setContentAiSessionArchived`. */
export interface MutationSetContentAiSessionArchivedResponse {
    readonly setContentAiSessionArchived: GraphQLResponse<SetContentAiSessionArchivedData>
}
