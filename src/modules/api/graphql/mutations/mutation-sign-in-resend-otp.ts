import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type MutationParams } from "./types/params"
import {
    type MutationSignInResendOtpResponse,
    type SignInResendOtpRequest,
} from "./types/auth"

/**
 * Sends a fresh code for a challenge that is already open.
 *
 * It takes the CHALLENGE and not the credentials, which is the whole reason resending is a
 * separate operation rather than running the first step again: the password is typed once and
 * a second init would open a second challenge, quietly invalidating the id the reader is
 * still looking at a code for.
 *
 * The response carries a challenge payload because the new code has a new expiry, and a
 * reader told only that something was resent has been told half of what changed.
 */
const mutation1 = gql`
    mutation SignInResendOtp($request: SignInResendOtpRequest!) {
        signInResendOtp(request: $request) {
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
export enum MutationSignInResendOtp {
    /** The full challenge selection. */
    Mutation1 = "mutation1",
}

/** Every document this mutation can send, keyed by variant. */
export const mutationSignInResendOtpMap: Record<MutationSignInResendOtp, DocumentNode> = {
    [MutationSignInResendOtp.Mutation1]: mutation1,
}

/** Resends the one-time code for an open challenge. Anonymous - the viewer has no token yet. */
export const mutationSignInResendOtp = async ({
    mutation = MutationSignInResendOtp.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationSignInResendOtp, SignInResendOtpRequest>) => {
    const apollo = createApolloClient({ headers, signal, debug })
    return apollo.mutate<MutationSignInResendOtpResponse>({
        mutation: mutationSignInResendOtpMap[mutation],
        variables: { request },
    })
}
