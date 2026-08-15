import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse } from "../types"

type MutationSignOutResponse = {
    readonly signOut: GraphQLResponse<undefined>
}

const mutation = gql`
    mutation SignOut {
        signOut {
            success
            message
            error
        }
    }
`

const csrfToken = (): string | undefined => {
    const pair = document.cookie
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("csrf_token="))
    return pair === undefined ? undefined : decodeURIComponent(pair.slice("csrf_token=".length))
}

/** Revoke this browser's refresh session and clear its server-managed cookies. */
export const mutationSignOut = async () => {
    const apollo = createApolloClient({
        withAuth: true,
        withCredentials: true,
        headers: { "x-csrf-token": csrfToken() },
    })
    return apollo.mutate<MutationSignOutResponse>({ mutation })
}
