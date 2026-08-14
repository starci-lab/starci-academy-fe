import type { GraphQLResponse } from "../../types"

/** Rename one owned conversation; blank resets its automatic title. */
export interface RenameContentAiSessionRequest {
    readonly sessionId: string
    readonly title: string
}

/** Whether the owned conversation title was changed. */
export interface RenameContentAiSessionData { readonly renamed: boolean }

/** Standard GraphQL envelope returned by `renameContentAiSession`. */
export interface MutationRenameContentAiSessionResponse {
    readonly renameContentAiSession: GraphQLResponse<RenameContentAiSessionData>
}
