import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { LookupQueryParams, QueryVariables } from "../types"
import type { ResolveRouteRequest, QueryResolveRouteResponse } from "./types/resolve-route"

const query1 = gql`
    query ResolveRoute($request: ResolveRouteRequest!) {
        resolveRoute(request: $request) {
            success
            message
            error
            data { path }
        }
    }
`

/** Selects route resolution in the shared GraphQL executor. */
export enum QueryResolveRoute {
    Query1 = "query1",
}

/** Documents available to the opaque-id route resolver. */
export const queryResolveRouteMap: Record<QueryResolveRoute, DocumentNode> = {
    [QueryResolveRoute.Query1]: query1,
}

/** Resolve one opaque entity id only after its resume action is pressed. */
export const queryResolveRoute = async ({
    query = QueryResolveRoute.Query1,
    request,
    headers,
    signal,
    debug,
}: LookupQueryParams<QueryResolveRoute, ResolveRouteRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryResolveRouteResponse, QueryVariables<ResolveRouteRequest>>({
        query: queryResolveRouteMap[query],
        variables: { request },
        fetchPolicy: "no-cache",
    })
}
