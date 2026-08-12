import type { GraphQLResponse } from "../../types"

/** One user suggested to the current viewer. */
export interface QuerySuggestedUserData {
    readonly globalId: string
    readonly username: string
    readonly displayName: string | null
    readonly avatar: string | null
    readonly openToWork: boolean
}

/** Standard response envelope returned by `suggestedUsers`. */
export interface QuerySuggestedUsersResponse {
    readonly suggestedUsers: GraphQLResponse<Array<QuerySuggestedUserData>>
}

