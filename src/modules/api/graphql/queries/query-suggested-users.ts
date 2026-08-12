import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { QueryParams } from "../types"
import type { QuerySuggestedUsersResponse } from "./types/suggested-users"

const query1 = gql`
    query SuggestedUsers {
        suggestedUsers {
            success
            message
            error
            data { globalId username displayName avatar openToWork }
        }
    }
`

export enum QuerySuggestedUsers { Query1 = "query1" }

/** Every supported suggested-user document keyed by its public variant. */
export const querySuggestedUsersMap: Record<QuerySuggestedUsers, DocumentNode> = {
    [QuerySuggestedUsers.Query1]: query1,
}

/** Fetches follow suggestions for the authenticated viewer. */
export const querySuggestedUsers = async ({
    query = QuerySuggestedUsers.Query1,
    headers,
    signal,
    debug,
}: QueryParams<QuerySuggestedUsers> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QuerySuggestedUsersResponse>({
        query: querySuggestedUsersMap[query],
        fetchPolicy: "no-cache",
    })
}

