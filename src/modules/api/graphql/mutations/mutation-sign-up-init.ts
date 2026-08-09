import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type MutationParams } from "./types/params"
import {
    type MutationSignUpInitResponse,
    type SignUpInitRequest,
} from "./types/auth"

/**
 * Step one of opening an account: hand over the new credentials, get a challenge back.
 *
 * It is the sign-in flow's twin on purpose - a challenge, a code in the reader's inbox, then a
 * verify - because the two are the same journey with different endings, and a reader who has
 * just registered should not have to learn a second one to get in.
 *
 * The whole envelope is selected: a refused registration (an address already taken, a password
 * the server will not accept) arrives as a 200 carrying `success: false` and a sentence meant
 * for the reader. A selection that took only `data` would turn every refusal into a blank
 * screen with nothing to say.
 *
 * The client is built WITHOUT auth on purpose: this is an operation a viewer runs precisely
 * because they have no token, and attaching a stale one is how it starts failing for a reason
 * nobody can see.
 */
const mutation1 = gql`
    mutation SignUpInit($request: SignUpInitRequest!) {
        signUpInit(request: $request) {
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
export enum MutationSignUpInit {
    /** The full envelope selection. */
    Mutation1 = "mutation1",
}

/** Every document this mutation can send, keyed by variant. */
export const mutationSignUpInitMap: Record<MutationSignUpInit, DocumentNode> = {
    [MutationSignUpInit.Mutation1]: mutation1,
}

/** Opens a registration challenge for a new account. Anonymous - no token is attached. */
export const mutationSignUpInit = async ({
    mutation = MutationSignUpInit.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationSignUpInit, SignUpInitRequest>) => {
    const apollo = createApolloClient({ headers, signal, debug })
    return apollo.mutate<MutationSignUpInitResponse>({
        mutation: mutationSignUpInitMap[mutation],
        variables: { request },
    })
}
