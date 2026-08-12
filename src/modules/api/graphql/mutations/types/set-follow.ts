import type { GraphQLResponse } from "../../types"

/** Idempotent follow state requested for one user. */
export interface SetFollowRequest {
    readonly userId: string
    readonly follow: boolean
}

/** Standard response envelope returned by `setFollow`. */
export interface MutationSetFollowResponse {
    readonly setFollow: GraphQLResponse
}

