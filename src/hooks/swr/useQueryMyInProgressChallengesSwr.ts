import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryMyInProgressChallenges } from "../../modules/api/graphql/queries/query-my-in-progress-challenges"
import { type MyResumeRefRow } from "../../modules/api/graphql/queries/types/my-resume"

/**
 * The cache key for the challenges the asking learner has started.
 *
 * Exported because passing a challenge REMOVES it from this list, and a dashboard still offering
 * a challenge the reader has just finished is the most confusing kind of stale: they have visible
 * evidence it happened.
 */
export const QUERY_MY_IN_PROGRESS_CHALLENGES_SWR_KEY = ["QUERY_MY_IN_PROGRESS_CHALLENGES_SWR"]

/**
 * Reads the challenges the asking learner has started and not yet passed.
 *
 * The envelope is unwrapped here, once. An absent payload becomes an EMPTY ARRAY for the same
 * reason as its sibling: the caller merges the two lists, and a merge should not have to ask
 * whether either side exists.
 */
export const useQueryMyInProgressChallengesSwr = () => {
    const viewer = useViewerKey()
    return useSWR<Array<MyResumeRefRow>>(
        viewer === undefined ? null : [...QUERY_MY_IN_PROGRESS_CHALLENGES_SWR_KEY, viewer],
        async () => {
            const result = await queryMyInProgressChallenges()
            return result.data?.myInProgressChallenges?.data ?? []
        },
    )
}
