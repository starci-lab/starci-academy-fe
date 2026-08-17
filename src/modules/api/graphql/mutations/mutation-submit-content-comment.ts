import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { MutationParams } from "./types/params"
import type { GraphQLResponse } from "../types"
import type { ContentComment } from "../queries/query-content-comments"

/** Authored lesson comment or reply sent to the discussion mutation. */
export interface SubmitContentCommentRequest {
    readonly contentId: string
    readonly parentCommentId?: string | null
    readonly body: string
}

/** GraphQL envelope containing the newly created lesson comment. */
export interface MutationSubmitContentCommentResponse {
    readonly createComment: GraphQLResponse<ContentComment>
}

const mutation1 = gql`
    mutation CreateComment($request: CreateCommentRequest!) {
        createComment(request: $request) {
            success
            message
            error
            data {
                id
                body
                isDeleted
                editedAt
                createdAt
                parentCommentId
                replyCount
                isFounderAuthor
                author { id username avatar }
                reactions {
                    total
                    myReaction
                    viewCount
                    shareCount
                    counts { type count }
                }
            }
        }
    }
`

/** Selects content-comment submission in the shared GraphQL executor. */
export enum MutationSubmitContentComment { Mutation1 = "mutation1" }

/** Every supported create-comment document keyed by its finite variant. */
export const mutationSubmitContentCommentMap: Record<MutationSubmitContentComment, DocumentNode> = {
    [MutationSubmitContentComment.Mutation1]: mutation1,
}

/** Creates a top-level lesson comment or a reply. */
export const mutationSubmitContentComment = async ({
    mutation = MutationSubmitContentComment.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationSubmitContentComment, SubmitContentCommentRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.mutate<MutationSubmitContentCommentResponse>({
        mutation: mutationSubmitContentCommentMap[mutation],
        variables: { request },
    })
}
