import useSWRMutation from "swr/mutation"
import { queryResolveRoute } from "../../modules/api/graphql/queries/query-resolve-route"
import type { ResolveRouteRequest } from "../../modules/api/graphql/queries/types/resolve-route"

type ResolveRouteTrigger = { readonly arg: ResolveRouteRequest }

/** Stable on-demand key for resolving opaque ids into internal routes. */
export const QUERY_RESOLVE_ROUTE_SWR_KEY = "QUERY_RESOLVE_ROUTE_SWR"

/** Resolves a route only when its caller triggers navigation. */
export const useQueryResolveRouteSwr = () => useSWRMutation(
    QUERY_RESOLVE_ROUTE_SWR_KEY,
    async (_key: string, { arg }: ResolveRouteTrigger) => queryResolveRoute({ request: arg }),
)

