import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type MutationParams } from "./types/params"
import {
    type MutationExchangeCodeForTokenResponse,
    type ExchangeCodeForTokenRequest,
} from "./types/auth"

/**
 * The last leg of an OAuth sign-in: trade the code the identity provider handed back for a
 * session of ours.
 *
 * THE `state` IS NOT DECORATION. It is the value this app generated before the redirect and
 * the provider echoed back; a callback whose state does not match the one that left is a
 * request somebody else started, and the check is what stops it being honoured. This helper
 * sends whatever it is given - the comparison belongs to the surface that stored it.
 *
 * The client is built WITHOUT auth on purpose: this is an operation a viewer runs precisely
 * because they have no token, and attaching a stale one is how it starts failing for a reason
 * nobody can see.
 */
const mutation1 = gql`
    mutation ExchangeCodeForToken($request: ExchangeCodeForTokenRequest!) {
        exchangeCodeForToken(request: $request) {
            success
            message
            error
            data {
                accessToken
            }
        }
    }
`

/** The document variants of this mutation. */
export enum MutationExchangeCodeForToken {
    /** The full envelope selection. */
    Mutation1 = "mutation1",
}

/** Every document this mutation can send, keyed by variant. */
export const mutationExchangeCodeForTokenMap: Record<MutationExchangeCodeForToken, DocumentNode> = {
    [MutationExchangeCodeForToken.Mutation1]: mutation1,
}

/** Trades an identity provider's code for a session of ours. Anonymous - no token is attached. */
export const mutationExchangeCodeForToken = async ({
    mutation = MutationExchangeCodeForToken.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationExchangeCodeForToken, ExchangeCodeForTokenRequest>) => {
    // The response establishes the HttpOnly refresh session and its readable CSRF twin.
    const apollo = createApolloClient({ headers, signal, debug, withCredentials: true })
    return apollo.mutate<MutationExchangeCodeForTokenResponse>({
        mutation: mutationExchangeCodeForTokenMap[mutation],
        variables: { request },
    })
}
