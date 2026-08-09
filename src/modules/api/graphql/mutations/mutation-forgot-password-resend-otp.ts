import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type MutationParams } from "./types/params"
import {
    type MutationForgotPasswordResendOtpResponse,
    type ForgotPasswordResendOtpRequest,
} from "./types/auth"

/**
 * A fresh code for a password reset already under way.
 *
 * Like every resend in this graph it answers with a challenge and a new expiry, because the
 * code that was in flight a moment ago has just stopped working.
 *
 * The client is built WITHOUT auth on purpose: this is an operation a viewer runs precisely
 * because they have no token, and attaching a stale one is how it starts failing for a reason
 * nobody can see.
 */
const mutation1 = gql`
    mutation ForgotPasswordResendOtp($request: ForgotPasswordResendOtpRequest!) {
        forgotPasswordResendOtp(request: $request) {
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
export enum MutationForgotPasswordResendOtp {
    /** The full envelope selection. */
    Mutation1 = "mutation1",
}

/** Every document this mutation can send, keyed by variant. */
export const mutationForgotPasswordResendOtpMap: Record<MutationForgotPasswordResendOtp, DocumentNode> = {
    [MutationForgotPasswordResendOtp.Mutation1]: mutation1,
}

/** Sends a fresh code for a reset already under way. Anonymous - no token is attached. */
export const mutationForgotPasswordResendOtp = async ({
    mutation = MutationForgotPasswordResendOtp.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationForgotPasswordResendOtp, ForgotPasswordResendOtpRequest>) => {
    const apollo = createApolloClient({ headers, signal, debug })
    return apollo.mutate<MutationForgotPasswordResendOtpResponse>({
        mutation: mutationForgotPasswordResendOtpMap[mutation],
        variables: { request },
    })
}
