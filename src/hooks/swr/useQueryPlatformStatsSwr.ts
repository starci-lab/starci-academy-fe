import useSWR from "swr"
import { queryPlatformStats } from "../../modules/api/graphql/queries/query-platform-stats"
import { type PlatformStatsData } from "../../modules/api/graphql/queries/types/platform-stats"

/**
 * The cache key for the platform counters.
 *
 * Exported rather than written inline so a caller that wants to revalidate this data - a
 * mutation elsewhere, a manual refresh - names the same key instead of guessing at the
 * string. A key typo does not fail; it silently creates a second cache entry, and the two
 * copies then disagree on screen.
 */
export const QUERY_PLATFORM_STATS_SWR_KEY = ["QUERY_PLATFORM_STATS_SWR"]

/**
 * Reads the public platform counters.
 *
 * The envelope is unwrapped here, once, so no component ever reaches through
 * `data.platformStats.data`. A missing payload becomes `null` rather than `undefined`,
 * because SWR already uses `undefined` to mean "not loaded yet" - collapsing the two would
 * leave a component unable to tell an empty answer from no answer at all.
 */
export const useQueryPlatformStatsSwr = () =>
    useSWR<PlatformStatsData | null>(QUERY_PLATFORM_STATS_SWR_KEY, async () => {
        const result = await queryPlatformStats()
        return result.data?.platformStats?.data ?? null
    })
