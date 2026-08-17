import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse, LookupQueryParams } from "../types"
import type { ReactionType } from "./types/reactions"

/** Count for one finite reaction emotion. */
export interface ContentReactionCount {
    readonly type: ReactionType
    readonly count: number
}

/** Aggregate and viewer-specific reaction facts for one lesson. */
export interface ContentReactionSummary {
    readonly counts: ReadonlyArray<ContentReactionCount>
    readonly total: number
    readonly myReaction: ReactionType | null
    readonly viewCount: number
    readonly shareCount: number
}

/** Lesson identity accepted by the content-reactions query. */
export interface QueryContentReactionsRequest {
    readonly contentId: string
}

/** GraphQL envelope returned by a content-reactions lookup. */
export interface QueryContentReactionsResponse {
    readonly contentReactions: GraphQLResponse<ContentReactionSummary>
}

const query1 = gql`
    query ContentReactions($request: ContentReactionsRequest!) {
        contentReactions(request: $request) {
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

/** Selects content reactions in the shared GraphQL executor. */
export enum QueryContentReactions { Query1 = "query1" }

/** Every supported content-reactions document keyed by its finite variant. */
export const queryContentReactionsMap: Record<QueryContentReactions, DocumentNode> = {
    [QueryContentReactions.Query1]: query1,
}

/** Reads aggregate reactions for one lesson from the authenticated viewer's perspective. */
export const queryContentReactions = async ({
    query = QueryContentReactions.Query1,
    request,
    headers,
    signal,
    debug,
}: LookupQueryParams<QueryContentReactions, QueryContentReactionsRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryContentReactionsResponse>({
        query: queryContentReactionsMap[query],
        variables: { request },
    })
}
