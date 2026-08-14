import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { QueryParams } from "../types"
import type {
    QueryContentAiSessionsRequest,
    QueryContentAiSessionsResponse,
} from "./types/content-ai-sessions"

const query1 = gql`
    query ContentAiSessions($request: ContentAiSessionsRequest!) {
        contentAiSessions(request: $request) {
            success
            message
            error
            data {
                sessions {
                    id
                    title
                    updatedAt
                    messageCount
                    scope
                    originContentId
                    originContentTitle
                    snippet
                }
            }
        }
    }
`

/** Supported conversation-list documents. */
export enum QueryContentAiSessions { Query1 = "query1" }

/** Every supported conversation-list document keyed by variant. */
export const queryContentAiSessionsMap: Record<QueryContentAiSessions, DocumentNode> = {
    [QueryContentAiSessions.Query1]: query1,
}

/** Lists or searches the authenticated learner's content-AI conversations. */
export const queryContentAiSessions = async ({
    query = QueryContentAiSessions.Query1,
    request,
    headers,
    signal,
    debug,
}: QueryParams<QueryContentAiSessions, QueryContentAiSessionsRequest> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryContentAiSessionsResponse>({
        query: queryContentAiSessionsMap[query],
        variables: { request: request ?? {} },
    })
}
