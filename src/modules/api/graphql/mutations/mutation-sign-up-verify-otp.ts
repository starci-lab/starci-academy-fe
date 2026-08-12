import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type MutationParams } from "./types/params"
import {
    type MutationSignUpVerifyOtpResponse,
    type SignUpVerifyOtpRequest,
} from "./types/auth"

/**
 * Step two of opening an account: trade the challenge and the code for a session.
 *
 * THE ARGUMENT TYPE IS SPELLED DIFFERENTLY FROM ITS SIBLINGS, and that is the schema's doing,
 * not a typo here: every other step takes a `...Request`, this one takes `SignUpVerifyOtpInput`.
 * It was read off the running schema by introspection; spelling it `...Request` to match the
 * family would fail at the server with an error nobody could explain from the call site.
 *
 * The client is built WITHOUT auth on purpose: this is an operation a viewer runs precisely
 * because they have no token, and attaching a stale one is how it starts failing for a reason
 * nobody can see.
 */
const mutation1 = gql`
    mutation SignUpVerifyOtp($request: SignUpVerifyOtpInput!) {
        signUpVerifyOtp(request: $request) {
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
export enum MutationSignUpVerifyOtp {
    /** The full envelope selection. */
    Mutation1 = "mutation1",
}

/** Every document this mutation can send, keyed by variant. */
export const mutationSignUpVerifyOtpMap: Record<MutationSignUpVerifyOtp, DocumentNode> = {
    [MutationSignUpVerifyOtp.Mutation1]: mutation1,
}

/** Trades a registration challenge and its code for a session. Anonymous - no token is attached. */
export const mutationSignUpVerifyOtp = async ({
    mutation = MutationSignUpVerifyOtp.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationSignUpVerifyOtp, SignUpVerifyOtpRequest>) => {
    const apollo = createApolloClient({ headers, signal, debug, withCredentials: true })
    return apollo.mutate<MutationSignUpVerifyOtpResponse>({
        mutation: mutationSignUpVerifyOtpMap[mutation],
        variables: { request },
    })
}
