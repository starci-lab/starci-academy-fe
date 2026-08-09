import useSWR from "swr"
import { queryMyWeeklyStats } from "../../modules/api/graphql/queries/query-my-weekly-stats"
import { type MyWeeklyStatsData } from "../../modules/api/graphql/queries/types/my-weekly-stats"

/**
 * The cache key for the asking learner's week.
 *
 * TWO surfaces read this hook - the streak strip and the standing row - and they mount side
 * by side on the dashboard. The shared key is what makes that one request rather than two:
 * SWR dedupes on the key, so the second mount joins the first request instead of racing it.
 */
export const QUERY_MY_WEEKLY_STATS_SWR_KEY = ["QUERY_MY_WEEKLY_STATS_SWR"]

/**
 * Reads the asking learner's streak, record streak and seven-day strip.
 *
 * The envelope is unwrapped here, once, so no component reaches through
 * `data.myWeeklyStats.data`. A missing payload becomes `null` rather than `undefined`, so a
 * component can still tell "the server has no week for you" from "the week is on its way".
 */
export const useQueryMyWeeklyStatsSwr = () =>
    useSWR<MyWeeklyStatsData | null>(QUERY_MY_WEEKLY_STATS_SWR_KEY, async () => {
        const result = await queryMyWeeklyStats()
        return result.data?.myWeeklyStats?.data ?? null
    })
