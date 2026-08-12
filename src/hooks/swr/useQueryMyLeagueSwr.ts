import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryMyLeague } from "../../modules/api/graphql/queries/query-my-league"
import type { MyLeague } from "../../modules/api/graphql/queries/types/dashboard-learning-community"
/** Stable viewer-scoped weekly-league key. */
export const QUERY_MY_LEAGUE_SWR_KEY = ["QUERY_MY_LEAGUE_SWR"]
/** Read and unwrap the viewer's weekly league. */
export const useQueryMyLeagueSwr = () => { const viewer = useViewerKey(); return useSWR<MyLeague | null>(viewer === undefined ? null : [...QUERY_MY_LEAGUE_SWR_KEY, viewer], async () => (await queryMyLeague()).data?.myLeague?.data ?? null) }
