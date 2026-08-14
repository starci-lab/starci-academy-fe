import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { QueryParams } from "../types"
import type {
    QueryContentAiHistoryRequest,
    QueryContentAiHistoryResponse,
} from "./types/content-ai-history"

const query1 = gql`
    query ContentAiHistory($request: ContentAiHistoryRequest!) {
        contentAiSessionMessages(request: $request) {
            success
            message
            error
            data {
                messages {
                    role
                    content
                }
            }
        }
    }
`

/** Supported saved-transcript documents. */
export enum QueryContentAiHistory { Query1 = "query1" }

/** Every supported saved-transcript document keyed by variant. */
export const queryContentAiHistoryMap: Record<QueryContentAiHistory, DocumentNode> = {
    [QueryContentAiHistory.Query1]: query1,
}

/** Loads one authenticated learner's owned conversation, oldest turn first. */
export const queryContentAiHistory = async ({
    query = QueryContentAiHistory.Query1,
    request,
    headers,
    signal,
    debug,
}: QueryParams<QueryContentAiHistory, QueryContentAiHistoryRequest> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryContentAiHistoryResponse>({
        query: queryContentAiHistoryMap[query],
        variables: { request },
    })
}
