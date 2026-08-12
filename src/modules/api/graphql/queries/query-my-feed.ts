import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { LookupQueryParams, QueryVariables } from "../types"
import type { MyFeedRequest, QueryMyFeedResponse } from "./types/my-feed"

const query1 = gql`
    query MyFeed($request: MyFeedRequest!) {
        myFeed(request: $request) {
            success
            message
            error
            data {
                items {
                    id
                    actorGlobalId
                    actorUsername
                    actorAvatar
                    type
                    targetGlobalId
                    targetLabel
                    at
                    reactionCount
                    myReaction
                    isMine
                }
                nextCursor
            }
        }
    }
`

export enum QueryMyFeed { Query1 = "query1" }

/** Every supported dashboard-feed document keyed by its public variant. */
export const queryMyFeedMap: Record<QueryMyFeed, DocumentNode> = {
    [QueryMyFeed.Query1]: query1,
}

/** Fetches one cursor page of dashboard activity for the authenticated viewer. */
export const queryMyFeed = async ({
    query = QueryMyFeed.Query1,
    request,
    headers,
    signal,
    debug,
}: LookupQueryParams<QueryMyFeed, MyFeedRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryMyFeedResponse, QueryVariables<MyFeedRequest>>({
        query: queryMyFeedMap[query],
        variables: { request },
        fetchPolicy: "no-cache",
    })
}

