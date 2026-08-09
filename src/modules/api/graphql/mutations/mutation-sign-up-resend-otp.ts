import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type MutationParams } from "./types/params"
import {
    type MutationSignUpResendOtpResponse,
    type SignUpResendOtpRequest,
} from "./types/auth"

/**
 * A fresh code for a registration challenge already open.
 *
 * It answers with a challenge rather than an empty envelope because the server issues a NEW
 * expiry - and a reader told the code was resent but not how long the new one lives has been
 * told half of what changed.
 *
 * The client is built WITHOUT auth on purpose: this is an operation a viewer runs precisely
 * because they have no token, and attaching a stale one is how it starts failing for a reason
 * nobody can see.
 */
const mutation1 = gql`
    mutation SignUpResendOtp($request: SignUpResendOtpRequest!) {
        signUpResendOtp(request: $request) {
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
export enum MutationSignUpResendOtp {
    /** The full envelope selection. */
    Mutation1 = "mutation1",
}

/** Every document this mutation can send, keyed by variant. */
export const mutationSignUpResendOtpMap: Record<MutationSignUpResendOtp, DocumentNode> = {
    [MutationSignUpResendOtp.Mutation1]: mutation1,
}

/** Sends a fresh code for a registration challenge already open. Anonymous - no token is attached. */
export const mutationSignUpResendOtp = async ({
    mutation = MutationSignUpResendOtp.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationSignUpResendOtp, SignUpResendOtpRequest>) => {
    const apollo = createApolloClient({ headers, signal, debug })
    return apollo.mutate<MutationSignUpResendOtpResponse>({
        mutation: mutationSignUpResendOtpMap[mutation],
        variables: { request },
    })
}
