import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { MutationParams } from "./types/params"
import type {
    DeleteContentAiSessionRequest,
    MutationDeleteContentAiSessionResponse,
} from "./types/delete-content-ai-session"

const mutation1 = gql`
    mutation DeleteContentAiSession($request: DeleteContentAiSessionRequest!) {
        deleteContentAiSession(request: $request) {
            success
            message
            error
            data { cleared }
        }
    }
`

/** Selects content-AI session deletion in the shared GraphQL executor. */
export enum MutationDeleteContentAiSession { Mutation1 = "mutation1" }

/** Every supported conversation-deletion document keyed by variant. */
export const mutationDeleteContentAiSessionMap: Record<MutationDeleteContentAiSession, DocumentNode> = {
    [MutationDeleteContentAiSession.Mutation1]: mutation1,
}

/** Deletes one authenticated learner's conversation. */
export const mutationDeleteContentAiSession = async ({
    mutation = MutationDeleteContentAiSession.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationDeleteContentAiSession, DeleteContentAiSessionRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.mutate<MutationDeleteContentAiSessionResponse>({
        mutation: mutationDeleteContentAiSessionMap[mutation],
        variables: { request },
    })
}
