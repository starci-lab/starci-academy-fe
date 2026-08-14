import useSWR from "swr"
import { SortOrder } from "@/modules/api/graphql/types"
import { queryFoundations, type FoundationsPage } from "@/modules/api/graphql/queries/query-foundations"

/** Search and pagination inputs for one category's resource page. */
export type UseQueryFoundationsSwrParams = { readonly categoryId?: string; readonly search?: string; readonly pageNumber?: number; readonly limit?: number }
/** Stable SWR key for foundation resources within a category. */
export const QUERY_FOUNDATIONS_SWR_KEY = "QUERY_FOUNDATIONS_SWR"
/** Read one server-filtered page of foundation resources. */
export const useQueryFoundationsSwr = ({ categoryId, search = "", pageNumber = 1, limit = 24 }: UseQueryFoundationsSwrParams) =>
    useSWR<FoundationsPage | null>(categoryId === undefined ? null : [QUERY_FOUNDATIONS_SWR_KEY, categoryId, search, pageNumber, limit], async () =>
        (await queryFoundations({ request: { categoryId: categoryId!, filters: { pageNumber, limit, search: search || undefined, sorts: [{ by: "sortIndex", order: SortOrder.Asc }] } } })).data?.foundations.data ?? null)
