import useSWR from "swr"
import { queryFoundation, type FoundationRequest } from "@/modules/api/graphql/queries/query-foundation"
import type { Foundation } from "@/modules/api/graphql/queries/query-foundations"
/** Stable SWR key for one foundation resource. */
export const QUERY_FOUNDATION_SWR_KEY = "QUERY_FOUNDATION_SWR"
/** Resolve one foundation resource by primary or display identity. */
export const useQueryFoundationSwr = (request?: FoundationRequest) => useSWR<Foundation | null>(request?.id === undefined && request?.displayId === undefined ? null : [QUERY_FOUNDATION_SWR_KEY, request?.id, request?.displayId], async () => (await queryFoundation({ request: request! })).data?.foundation.data ?? null)
