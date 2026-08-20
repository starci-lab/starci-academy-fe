import useSWR from "swr"
import { queryFoundationCategories, type FoundationCategoriesPage } from "@/modules/api/graphql/queries/query-foundation-categories"

/** Search and pagination inputs for the foundation category catalog. */
export type UseQueryFoundationCategoriesSwrParams = { readonly search?: string; readonly pageNumber?: number; readonly limit?: number }
/** Stable SWR key for localized foundation category pages. */
export const QUERY_FOUNDATION_CATEGORIES_SWR_KEY = "QUERY_FOUNDATION_CATEGORIES_SWR"
/** Read one localized and server-filtered foundation category page. */
export const useQueryFoundationCategoriesSwr = ({ search = "", pageNumber = 1, limit = 24 }: UseQueryFoundationCategoriesSwrParams = {}) =>
    useSWR<FoundationCategoriesPage | null>([QUERY_FOUNDATION_CATEGORIES_SWR_KEY, search, pageNumber, limit], async () =>
        (await queryFoundationCategories({ request: { search: search || undefined, pageNumber, limit } })).data?.foundationCategories.data ?? null,
    { keepPreviousData: true })
