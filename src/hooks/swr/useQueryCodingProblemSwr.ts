import useSWR from "swr"
import { queryCodingProblem } from "../../modules/api/graphql/queries/query-coding-problem"
import { type CodingProblemDetail } from "../../modules/api/graphql/queries/types/coding"

/** The key prefix, one entry per problem. */
export const QUERY_CODING_PROBLEM_SWR_KEY = "QUERY_CODING_PROBLEM_SWR"

/** One problem in full - sample testcases and starter code, never hidden cases or solutions. */
export const useQueryCodingProblemSwr = (slug?: string) =>
    useSWR<CodingProblemDetail | null>(
        slug === undefined ? null : [QUERY_CODING_PROBLEM_SWR_KEY, slug],
        async () => (await queryCodingProblem({ request: { slug: slug ?? "" } })).data?.codingProblem?.data ?? null,
    )
