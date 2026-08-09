import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type MutationParams } from "./types/params"
import {
    type MutationSignInInitResponse,
    type SignInInitRequest,
} from "./types/auth"

/**
 * Step one of signing in: hand over the credentials, get a challenge back.
 *
 * The document selects the WHOLE envelope. A rejected password does not arrive here as a
 * transport error - it arrives as a 200 carrying `success: false` and a message meant for
 * the reader, so a selection that took only `data` would turn every refusal into a blank
 * screen with nothing to say.
 *
 * The client is built WITHOUT auth on purpose: this is the operation a viewer runs precisely
 * because they have no token, and attaching a stale one is how a sign-in starts failing for
 * a reason nobody can see.
 */
const mutation1 = gql`
    mutation SignInInit($request: SignInInitRequest!) {
        signInInit(request: $request) {
            success
            message
            error
            data {
                challengeId
                expiresInSeconds
            }
        }
    }
`

/** The document variants of this mutation. */
export enum MutationSignInInit {
    /** The full challenge selection. */
    Mutation1 = "mutation1",
}

/** Every document this mutation can send, keyed by variant. */
export const mutationSignInInitMap: Record<MutationSignInInit, DocumentNode> = {
    [MutationSignInInit.Mutation1]: mutation1,
}

/** Opens a sign-in challenge for a set of credentials. Anonymous - no token is attached. */
export const mutationSignInInit = async ({
    mutation = MutationSignInInit.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationSignInInit, SignInInitRequest>) => {
    const apollo = createApolloClient({ headers, signal, debug })
    return apollo.mutate<MutationSignInInitResponse>({
        mutation: mutationSignInInitMap[mutation],
        variables: { request },
    })
}
