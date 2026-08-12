import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryMyUpcomingLivestreams } from "../../modules/api/graphql/queries/query-my-upcoming-livestreams"
import type { UpcomingLivestream } from "../../modules/api/graphql/queries/types/dashboard-learning-community"
/** Stable viewer-scoped upcoming-session key. */
export const QUERY_MY_UPCOMING_LIVESTREAMS_SWR_KEY = ["QUERY_MY_UPCOMING_LIVESTREAMS_SWR"]
/** Read and unwrap the viewer's upcoming sessions. */
export const useQueryMyUpcomingLivestreamsSwr = () => { const viewer = useViewerKey(); return useSWR<Array<UpcomingLivestream> | null>(viewer === undefined ? null : [...QUERY_MY_UPCOMING_LIVESTREAMS_SWR_KEY, viewer], async () => (await queryMyUpcomingLivestreams()).data?.myUpcomingLivestreams?.data ?? null) }
