import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type MutationParams } from "./types/params"
import {
    type MutationForgotPasswordVerifyOtpResponse,
    type ForgotPasswordVerifyOtpRequest,
} from "./types/auth"

/**
 * Step two of resetting a password: the code authorises the change, and the server answers
 * with a session.
 *
 * A reset therefore ENDS SIGNED IN. That is worth knowing at the call site: a surface that
 * sent the reader back to the sign-in form afterwards would be asking them to type a password
 * they have just proved they know.
 *
 * The client is built WITHOUT auth on purpose: this is an operation a viewer runs precisely
 * because they have no token, and attaching a stale one is how it starts failing for a reason
 * nobody can see.
 */
const mutation1 = gql`
    mutation ForgotPasswordVerifyOtp($request: ForgotPasswordVerifyOtpRequest!) {
        forgotPasswordVerifyOtp(request: $request) {
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
export enum MutationForgotPasswordVerifyOtp {
    /** The full envelope selection. */
    Mutation1 = "mutation1",
}

/** Every document this mutation can send, keyed by variant. */
export const mutationForgotPasswordVerifyOtpMap: Record<MutationForgotPasswordVerifyOtp, DocumentNode> = {
    [MutationForgotPasswordVerifyOtp.Mutation1]: mutation1,
}

/** Authorises a password reset with its code, and returns a session. Anonymous - no token is attached. */
export const mutationForgotPasswordVerifyOtp = async ({
    mutation = MutationForgotPasswordVerifyOtp.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationForgotPasswordVerifyOtp, ForgotPasswordVerifyOtpRequest>) => {
    const apollo = createApolloClient({ headers, signal, debug, withCredentials: true })
    return apollo.mutate<MutationForgotPasswordVerifyOtpResponse>({
        mutation: mutationForgotPasswordVerifyOtpMap[mutation],
        variables: { request },
    })
}
