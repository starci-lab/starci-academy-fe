import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse, LookupQueryParams } from "../types"
import type { ContentReactionSummary } from "./query-content-reactions"

/** Public author identity attached to a lesson comment. */
export interface ContentCommentAuthor {
    readonly id: string
    readonly username: string
    readonly avatar: string | null
}

/** One backend discussion node belonging to a lesson or parent comment. */
export interface ContentComment {
    readonly id: string
    readonly body: string
    readonly isDeleted: boolean
    readonly editedAt: string | null
    readonly createdAt: string
    readonly parentCommentId: string | null
    readonly replyCount: number
    readonly isFounderAuthor: boolean
    readonly author: ContentCommentAuthor
    readonly reactions: ContentReactionSummary
}

/** One paged set of lesson comments and its total count. */
export interface ContentCommentsPage {
    readonly total: number
    readonly comments: ReadonlyArray<ContentComment>
}

/** Scope and pagination accepted by the content-comments query. */
export interface QueryContentCommentsRequest {
    readonly contentId: string
    readonly parentCommentId?: string | null
    readonly page?: number
    readonly limit?: number
}

/** GraphQL envelope returned by a content-comments lookup. */
export interface QueryContentCommentsResponse {
    readonly contentComments: GraphQLResponse<ContentCommentsPage>
}

const query1 = gql`
    query ContentComments($request: ContentCommentsRequest!) {
        contentComments(request: $request) {
            success
            message
            error
            data {
                total
                comments {
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
    }
`

/** Selects content comments in the shared GraphQL executor. */
export enum QueryContentComments { Query1 = "query1" }

/** Every supported content-comments document keyed by its finite variant. */
export const queryContentCommentsMap: Record<QueryContentComments, DocumentNode> = {
    [QueryContentComments.Query1]: query1,
}

/** Lists one page of top-level lesson comments or replies. */
export const queryContentComments = async ({
    query = QueryContentComments.Query1,
    request,
    headers,
    signal,
    debug,
}: LookupQueryParams<QueryContentComments, QueryContentCommentsRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryContentCommentsResponse>({
        query: queryContentCommentsMap[query],
        variables: { request },
    })
}
