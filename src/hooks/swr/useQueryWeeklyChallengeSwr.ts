import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryWeeklyChallenge } from "../../modules/api/graphql/queries/query-weekly-challenge"
import { type WeeklyChallengeData } from "../../modules/api/graphql/queries/types/weekly-challenge"

/** Stable cache-key prefix for the viewer-scoped weekly challenge. */
export const QUERY_WEEKLY_CHALLENGE_SWR_KEY = ["QUERY_WEEKLY_CHALLENGE_SWR"]

/** Reads the featured challenge and the current viewer's pass/claim state. */
export const useQueryWeeklyChallengeSwr = () => {
    const viewer = useViewerKey()
    return useSWR<WeeklyChallengeData | null>(
        viewer === undefined ? null : [...QUERY_WEEKLY_CHALLENGE_SWR_KEY, viewer],
        async () => {
            const result = await queryWeeklyChallenge()
            return result.data?.weeklyChallenge?.data ?? null
        },
    )
}
