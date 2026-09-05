import useSWR from "swr"
import { useLocale } from "next-intl"
import { queryConcept } from "@/modules/api/graphql/queries/query-concept"
import type { ConceptDetail } from "@/modules/api/graphql/queries/types/concept"

/** Stable cache identity for a localized concept document. */
export const QUERY_CONCEPT_SWR_KEY = "QUERY_CONCEPT_SWR"

/** Read one concept by its routed display id. */
export const useQueryConceptSwr = (displayId?: string) => {
    const locale = useLocale()
    return useSWR<ConceptDetail | null>(
        displayId === undefined ? null : [QUERY_CONCEPT_SWR_KEY, locale, displayId],
        async () => {
            const result = await queryConcept({ request: { displayId: displayId! } })
            const response = result.data?.concept
            if (response?.success !== true) {
                throw new Error(response?.error ?? response?.message ?? "CONCEPT_UNAVAILABLE")
            }
            return response.data ?? null
        },
    )
}
