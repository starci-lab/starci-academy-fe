import useSWR from "swr"
import { queryPlayground, type Playground } from "@/modules/api/graphql/queries/query-playground"
/** Stable SWR key for one playground definition. */
export const QUERY_PLAYGROUND_SWR_KEY = "QUERY_PLAYGROUND_SWR"
/** Resolve a localized playground and its ordered steps by slug. */
export const useQueryPlaygroundSwr = (slug?: string) => useSWR<Playground | null>(slug === undefined ? null : [QUERY_PLAYGROUND_SWR_KEY, slug], async () => (await queryPlayground({ slug: slug! })).data?.playground.data ?? null)
