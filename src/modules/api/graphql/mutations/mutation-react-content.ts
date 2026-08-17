import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { MutationParams } from "./types/params"
import type { GraphQLResponse } from "../types"
import type { ContentReactionSummary } from "../queries/query-content-reactions"
import type { ReactionType } from "../queries/types/reactions"

/** Viewer reaction update for one lesson; null removes the current reaction. */
export interface ReactContentRequest {
    readonly contentId: string
    readonly type?: ReactionType | null
}

/** GraphQL envelope returned after refreshing the lesson reaction summary. */
export interface MutationReactContentResponse {
    readonly reactToContent: GraphQLResponse<ContentReactionSummary>
}

const mutation1 = gql`
    mutation ReactToContent($request: ReactToContentRequest!) {
        reactToContent(request: $request) {
            success
            message
            error
            data {
                total
                myReaction
                viewCount
                shareCount
                counts { type count }
            }
        }
    }
`

/** Selects content-reaction updates in the shared GraphQL executor. */
export enum MutationReactContent { Mutation1 = "mutation1" }

/** Every supported react-to-content document keyed by its finite variant. */
export const mutationReactContentMap: Record<MutationReactContent, DocumentNode> = {
    [MutationReactContent.Mutation1]: mutation1,
}

/** Sets, changes, or removes the viewer's reaction on one lesson. */
export const mutationReactContent = async ({
    mutation = MutationReactContent.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationReactContent, ReactContentRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.mutate<MutationReactContentResponse>({
        mutation: mutationReactContentMap[mutation],
        variables: { request },
    })
}
