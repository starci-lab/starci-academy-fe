import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { MutationParams } from "./types/params"
import type {
    MutationRenameContentAiSessionResponse,
    RenameContentAiSessionRequest,
} from "./types/rename-content-ai-session"

const mutation1 = gql`
    mutation RenameContentAiSession($request: RenameContentAiSessionRequest!) {
        renameContentAiSession(request: $request) {
            success
            message
            error
            data { renamed }
        }
    }
`

/** Selects content-AI session renaming in the shared GraphQL executor. */
export enum MutationRenameContentAiSession { Mutation1 = "mutation1" }

/** Every supported conversation-rename document keyed by variant. */
export const mutationRenameContentAiSessionMap: Record<MutationRenameContentAiSession, DocumentNode> = {
    [MutationRenameContentAiSession.Mutation1]: mutation1,
}

/** Renames or resets one authenticated learner's conversation title. */
export const mutationRenameContentAiSession = async ({
    mutation = MutationRenameContentAiSession.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationRenameContentAiSession, RenameContentAiSessionRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.mutate<MutationRenameContentAiSessionResponse>({
        mutation: mutationRenameContentAiSessionMap[mutation],
        variables: { request },
    })
}
