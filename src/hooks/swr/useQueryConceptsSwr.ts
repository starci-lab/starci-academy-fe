import useSWR from "swr"
import { useLocale } from "next-intl"
import { queryConcepts } from "@/modules/api/graphql/queries/query-concepts"
import type { ConceptSummary } from "@/modules/api/graphql/queries/types/concept"

/** Stable cache identity for the localized public concept catalog. */
export const QUERY_CONCEPTS_SWR_KEY = "QUERY_CONCEPTS_SWR"

/** Read all standalone concepts; rejected envelopes remain failures rather than empty catalogs. */
export const useQueryConceptsSwr = () => {
    const locale = useLocale()
    return useSWR<ReadonlyArray<ConceptSummary>>(
        [QUERY_CONCEPTS_SWR_KEY, locale],
        async () => {
            const result = await queryConcepts()
            const response = result.data?.concepts
            if (response?.success !== true || response.data === undefined) {
                throw new Error(response?.error ?? response?.message ?? "CONCEPTS_UNAVAILABLE")
            }
            return response.data
        },
    )
}
