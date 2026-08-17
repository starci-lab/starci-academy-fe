import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { MutationParams } from "./types/params"
import type {
    CreateContentAiSessionRequest,
    MutationCreateContentAiSessionResponse,
} from "./types/create-content-ai-session"

const mutation1 = gql`
    mutation CreateContentAiSession($request: CreateContentAiSessionRequest!) {
        createContentAiSession(request: $request) {
            success
            message
            error
            data { id }
        }
    }
`

/** Selects content-AI session creation in the shared GraphQL executor. */
export enum MutationCreateContentAiSession { Mutation1 = "mutation1" }

/** Every supported conversation-creation document keyed by variant. */
export const mutationCreateContentAiSessionMap: Record<MutationCreateContentAiSession, DocumentNode> = {
    [MutationCreateContentAiSession.Mutation1]: mutation1,
}

/** Creates one content-AI conversation through the authenticated API. */
export const mutationCreateContentAiSession = async ({
    mutation = MutationCreateContentAiSession.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationCreateContentAiSession, CreateContentAiSessionRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.mutate<MutationCreateContentAiSessionResponse>({
        mutation: mutationCreateContentAiSessionMap[mutation],
        variables: { request },
    })
}
