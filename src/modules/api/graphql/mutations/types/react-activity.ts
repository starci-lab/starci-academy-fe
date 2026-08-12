import type { GraphQLResponse } from "../../types"
import type { ReactionType } from "../../queries/types/reactions"

/** Input accepted by `reactToActivity`. A null type removes the viewer's reaction. */
export interface ReactActivityRequest {
    readonly activityId: string
    readonly type?: ReactionType | null
}

/** Refreshed reaction summary returned after a feed reaction changes. */
export interface ReactActivityData {
    readonly total: number
    readonly myReaction: ReactionType | null
}

/** Standard response envelope returned by `reactToActivity`. */
export interface MutationReactActivityResponse {
    readonly reactToActivity: GraphQLResponse<ReactActivityData>
}

