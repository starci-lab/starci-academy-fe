import useSWR from "swr"
import {
    queryGlobalSearchDetail,
    type GlobalSearchDetail,
    type QueryGlobalSearchDetailRequest,
} from "@/modules/api/graphql/queries/query-global-search-detail"

/** Stable cache family for selected Global Search details. */
export const QUERY_GLOBAL_SEARCH_DETAIL_SWR_KEY = "QUERY_GLOBAL_SEARCH_DETAIL_SWR"

/** Fetch the selected result only; no selection means no detail request. */
export const useQueryGlobalSearchDetailSwr = (request?: QueryGlobalSearchDetailRequest) =>
    useSWR<GlobalSearchDetail | null>(
        request === undefined
            ? null
            : [QUERY_GLOBAL_SEARCH_DETAIL_SWR_KEY, request.bucket, request.id, request.displayId],
        () => queryGlobalSearchDetail(request!),
    )

