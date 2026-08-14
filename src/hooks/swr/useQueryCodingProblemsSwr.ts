import useSWR from "swr"
import { queryCodingProblems } from "../../modules/api/graphql/queries/query-coding-problems"
import { type CodingProblemsPayload } from "../../modules/api/graphql/queries/types/coding"

/** What a caller may narrow by. */
export interface UseQueryCodingProblemsSwrParams {
    /** One interview topic. The closed enum, not the free-text tag. */
    domain?: string
    /** 1-based page. */
    page?: number
    /** Page size. */
    limit?: number
}

/** The key prefix, so every page of the list can be revalidated at once. */
export const QUERY_CODING_PROBLEMS_SWR_KEY = "QUERY_CODING_PROBLEMS_SWR"

/**
 * One page of problems.
 *
 * THE FILTERS ARE PART OF THE KEY. Two topics are two answers, and one must not serve the other
 * from cache - the same reason the catalog hook keys on its filters.
 */
export const useQueryCodingProblemsSwr = ({ domain, page, limit }: UseQueryCodingProblemsSwrParams = {}) =>
    useSWR<CodingProblemsPayload | null>(
        [QUERY_CODING_PROBLEMS_SWR_KEY, domain ?? "", page ?? 1, limit ?? 50],
        async () => (await queryCodingProblems({
            request: { filters: { domain, page, limit } },
        })).data?.codingProblems?.data ?? null,
    )
