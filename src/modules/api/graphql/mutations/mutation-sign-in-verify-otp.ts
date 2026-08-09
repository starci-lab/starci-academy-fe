import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type MutationParams } from "./types/params"
import {
    type MutationSignInVerifyOtpResponse,
    type SignInVerifyOtpRequest,
} from "./types/auth"

/**
 * Step two of signing in: trade an open challenge and the code for an access token.
 *
 * This is the operation whose FAILURE matters most, and it fails inside the envelope rather
 * than at the transport: a wrong code, an expired challenge and a challenge that was already
 * spent all come back as `success: false` with a message. Selecting `message` and `error`
 * alongside the token is what lets the overlay tell those three apart instead of showing one
 * generic apology for all of them.
 *
 * Anonymous client: the viewer has no token yet - earning one is the point of the call.
 */
const mutation1 = gql`
    mutation SignInVerifyOtp($request: SignInVerifyOtpRequest!) {
        signInVerifyOtp(request: $request) {
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
export enum MutationSignInVerifyOtp {
    /** The full token selection. */
    Mutation1 = "mutation1",
}

/** Every document this mutation can send, keyed by variant. */
export const mutationSignInVerifyOtpMap: Record<MutationSignInVerifyOtp, DocumentNode> = {
    [MutationSignInVerifyOtp.Mutation1]: mutation1,
}

/** Verifies a one-time code against an open challenge and returns the access token. */
export const mutationSignInVerifyOtp = async ({
    mutation = MutationSignInVerifyOtp.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationSignInVerifyOtp, SignInVerifyOtpRequest>) => {
    const apollo = createApolloClient({ headers, signal, debug })
    return apollo.mutate<MutationSignInVerifyOtpResponse>({
        mutation: mutationSignInVerifyOtpMap[mutation],
        variables: { request },
    })
}
