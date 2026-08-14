import useSWR from "swr"
import { queryCodingDomainSummary } from "../../modules/api/graphql/queries/query-coding-domain-summary"
import { type CodingDomainSummaryPayload } from "../../modules/api/graphql/queries/types/coding"

/** The key, so a caller can revalidate the catalog sizes from anywhere. */
export const QUERY_CODING_DOMAIN_SUMMARY_SWR_KEY = "QUERY_CODING_DOMAIN_SUMMARY_SWR"

/**
 * How many problems each topic holds.
 *
 * It is a CATALOG fact and carries no viewer, so one cache entry serves everybody and it survives a
 * sign-in. The viewer's own half comes from `useQueryMyCodingProgressSwr`, keyed separately for
 * exactly that reason.
 */
export const useQueryCodingDomainSummarySwr = () =>
    useSWR<CodingDomainSummaryPayload | null>(
        QUERY_CODING_DOMAIN_SUMMARY_SWR_KEY,
        async () => (await queryCodingDomainSummary()).data?.codingDomainSummary?.data ?? null,
    )
