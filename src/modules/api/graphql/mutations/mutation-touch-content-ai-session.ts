import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { MutationParams } from "./types/params"
import type {
    MutationTouchContentAiSessionResponse,
    TouchContentAiSessionRequest,
} from "./types/touch-content-ai-session"

const mutation1 = gql`
    mutation TouchContentAiSession($request: TouchContentAiSessionRequest!) {
        touchContentAiSession(request: $request) {
            success
            message
            error
            data { touched }
        }
    }
`

export enum MutationTouchContentAiSession { Mutation1 = "mutation1" }

/** Every supported conversation-touch document keyed by variant. */
export const mutationTouchContentAiSessionMap: Record<MutationTouchContentAiSession, DocumentNode> = {
    [MutationTouchContentAiSession.Mutation1]: mutation1,
}

/** Bumps the recency of one authenticated learner's opened conversation. */
export const mutationTouchContentAiSession = async ({
    mutation = MutationTouchContentAiSession.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationTouchContentAiSession, TouchContentAiSessionRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.mutate<MutationTouchContentAiSessionResponse>({
        mutation: mutationTouchContentAiSessionMap[mutation],
        variables: { request },
    })
}
