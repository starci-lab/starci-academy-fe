import type { GraphQLResponse } from "../../types"

/** The authenticated identity fields needed by the dashboard rail. */
export type MeData = {
    readonly id: string
    readonly username?: string | null
    readonly email?: string | null
    readonly displayName?: string | null
    readonly avatar?: string | null
}

/** Standard envelope returned by the authenticated `me` query. */
export type QueryMeResponse = {
    readonly me: GraphQLResponse<MeData>
}
