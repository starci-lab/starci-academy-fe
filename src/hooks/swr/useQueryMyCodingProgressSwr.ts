import useSWR from "swr"
import { queryMyCodingProgress } from "../../modules/api/graphql/queries/query-my-coding-progress"
import { type MyCodingProgressPayload } from "../../modules/api/graphql/queries/types/coding"

/** The key, so a submission can revalidate the viewer's standing after it lands. */
export const QUERY_MY_CODING_PROGRESS_SWR_KEY = "QUERY_MY_CODING_PROGRESS_SWR"

/**
 * The viewer's coding standing.
 *
 * `byDomain` is a GROUP BY, so a topic the viewer has never solved in is ABSENT rather than zero.
 * Callers walk the topic list they already have and default the missing ones - asking the server to
 * emit twenty rows per viewer would put the topic enum in two places.
 */
export const useQueryMyCodingProgressSwr = () =>
    useSWR<MyCodingProgressPayload | null>(
        QUERY_MY_CODING_PROGRESS_SWR_KEY,
        async () => (await queryMyCodingProgress()).data?.myCodingProgress?.data ?? null,
    )
