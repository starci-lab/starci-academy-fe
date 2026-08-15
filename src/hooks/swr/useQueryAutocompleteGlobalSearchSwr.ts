import useSWR from "swr"
import { queryAutocompleteGlobalSearch } from "@/modules/api/graphql/queries/query-autocomplete-global-search"
import type {
    GlobalSearchData,
    GlobalSearchEntity,
} from "@/modules/api/graphql/queries/types/global-search"

/** Stable prefix separating global autocomplete cache entries. */
export const QUERY_AUTOCOMPLETE_GLOBAL_SEARCH_SWR_KEY = "QUERY_AUTOCOMPLETE_GLOBAL_SEARCH_SWR"

/** Scope, query and activation controls accepted by the search hook. */
export type UseQueryAutocompleteGlobalSearchSwrParams = {
    readonly query: string
    readonly entities?: ReadonlyArray<GlobalSearchEntity>
    readonly size?: number
    readonly enabled?: boolean
}

/** Reads one scope of autocomplete results while preserving the previous rows during revalidation. */
export const useQueryAutocompleteGlobalSearchSwr = ({
    query,
    entities,
    size = 6,
    enabled = true,
}: UseQueryAutocompleteGlobalSearchSwrParams) => {
    const normalizedQuery = query.trim()
    const request = {
        query: normalizedQuery,
        ...(entities === undefined ? {} : { entities }),
        size,
    }
    const key = enabled && normalizedQuery.length > 0
        ? [QUERY_AUTOCOMPLETE_GLOBAL_SEARCH_SWR_KEY, normalizedQuery, entities?.join(",") ?? "*", size] as const
        : null
    return useSWR<GlobalSearchData | null>(key, async () => {
        const result = await queryAutocompleteGlobalSearch(request)
        return result.data?.autocompleteGlobalSearch?.data ?? null
    }, { keepPreviousData: true })
}
