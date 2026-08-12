import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryGlobalLeaderboard } from "../../modules/api/graphql/queries/query-global-leaderboard"
import type { GlobalLeaderboard } from "../../modules/api/graphql/queries/types/dashboard-learning-community"
/** Stable viewer-scoped global-leaderboard key. */
export const QUERY_GLOBAL_LEADERBOARD_SWR_KEY = ["QUERY_GLOBAL_LEADERBOARD_SWR"]
/** Read and unwrap global standing plus follow truth. */
export const useQueryGlobalLeaderboardSwr = () => { const viewer = useViewerKey(); return useSWR<GlobalLeaderboard | null>(viewer === undefined ? null : [...QUERY_GLOBAL_LEADERBOARD_SWR_KEY, viewer], async () => (await queryGlobalLeaderboard()).data?.globalLeaderboard?.data ?? null) }
