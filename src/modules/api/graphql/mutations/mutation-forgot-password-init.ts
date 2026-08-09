import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type MutationParams } from "./types/params"
import {
    type MutationForgotPasswordInitResponse,
    type ForgotPasswordInitRequest,
} from "./types/auth"

/**
 * Step one of resetting a password: name the account and the password that should replace the
 * old one, get a challenge back.
 *
 * THE NEW PASSWORD IS SENT AT THE START, NOT AT THE END. That is the schema's design, and it
 * decides the shape of the screen: the form asks for the new password BEFORE the code, because
 * the code is what authorises the change rather than what precedes it. A screen that asked in
 * the other order would have to hold the password through a round trip for no reason.
 *
 * The client is built WITHOUT auth on purpose: this is an operation a viewer runs precisely
 * because they have no token, and attaching a stale one is how it starts failing for a reason
 * nobody can see.
 */
const mutation1 = gql`
    mutation ForgotPasswordInit($request: ForgotPasswordInitRequest!) {
        forgotPasswordInit(request: $request) {
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
export enum MutationForgotPasswordInit {
    /** The full envelope selection. */
    Mutation1 = "mutation1",
}

/** Every document this mutation can send, keyed by variant. */
export const mutationForgotPasswordInitMap: Record<MutationForgotPasswordInit, DocumentNode> = {
    [MutationForgotPasswordInit.Mutation1]: mutation1,
}

/** Opens a password-reset challenge for an account. Anonymous - no token is attached. */
export const mutationForgotPasswordInit = async ({
    mutation = MutationForgotPasswordInit.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationForgotPasswordInit, ForgotPasswordInitRequest>) => {
    const apollo = createApolloClient({ headers, signal, debug })
    return apollo.mutate<MutationForgotPasswordInitResponse>({
        mutation: mutationForgotPasswordInitMap[mutation],
        variables: { request },
    })
}
