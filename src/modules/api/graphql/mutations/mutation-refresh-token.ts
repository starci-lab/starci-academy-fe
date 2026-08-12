import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse } from "../types"

/** The only token JavaScript is allowed to receive from a refresh. */
export type RefreshTokenData = {
    readonly accessToken: string
}

/** Optional TTL gate understood by the back end. */
export type RefreshTokenRequest = {
    readonly minValiditySeconds?: number
}

type MutationRefreshTokenResponse = {
    readonly refreshToken: GraphQLResponse<RefreshTokenData>
}

const mutation = gql`
    mutation RefreshToken($request: RefreshTokenRequest!) {
        refreshToken(request: $request) {
            success
            message
            error
            data {
                accessToken
            }
        }
    }
`

/** Read the signed double-submit token without ever touching the HttpOnly refresh cookie. */
const csrfToken = (): string | undefined => {
    const pair = document.cookie
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("csrf_token="))
    return pair === undefined ? undefined : decodeURIComponent(pair.slice("csrf_token=".length))
}

/** Rotate the cookie-backed session and return its fresh access token. */
export const mutationRefreshToken = async (request: RefreshTokenRequest = {}) => {
    const token = csrfToken()
    const apollo = createApolloClient({
        withAuth: true,
        withCredentials: true,
        headers: { "x-csrf-token": token },
    })
    return apollo.mutate<MutationRefreshTokenResponse>({ mutation, variables: { request } })
}
