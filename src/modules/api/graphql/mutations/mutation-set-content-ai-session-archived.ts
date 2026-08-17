import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { MutationParams } from "./types/params"
import type {
    MutationSetContentAiSessionArchivedResponse,
    SetContentAiSessionArchivedRequest,
} from "./types/set-content-ai-session-archived"

const mutation1 = gql`
    mutation SetContentAiSessionArchived($request: SetContentAiSessionArchivedRequest!) {
        setContentAiSessionArchived(request: $request) {
            success
            message
            error
            data { archived }
        }
    }
`

/** Selects content-AI archival changes in the shared GraphQL executor. */
export enum MutationSetContentAiSessionArchived { Mutation1 = "mutation1" }

/** Every supported archive-state document keyed by variant. */
export const mutationSetContentAiSessionArchivedMap: Record<MutationSetContentAiSessionArchived, DocumentNode> = {
    [MutationSetContentAiSessionArchived.Mutation1]: mutation1,
}

/** Archives or restores one authenticated learner's conversation. */
export const mutationSetContentAiSessionArchived = async ({
    mutation = MutationSetContentAiSessionArchived.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationSetContentAiSessionArchived, SetContentAiSessionArchivedRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.mutate<MutationSetContentAiSessionArchivedResponse>({
        mutation: mutationSetContentAiSessionArchivedMap[mutation],
        variables: { request },
    })
}
