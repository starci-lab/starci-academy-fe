import useSWRMutation from "swr/mutation"
import {
    mutationSyncContentChallenge,
    type SyncContentChallengeRequest,
} from "@/modules/api/graphql/mutations/mutation-sync-content-challenge"

/** Identifies the course authority and one optimistic draft write. */
export interface SyncContentChallengeArg {
    readonly courseId: string
    readonly request: SyncContentChallengeRequest
}

type Trigger = { readonly arg: SyncContentChallengeArg }

/** Stable SWR cache identity for recoverable Challenge draft writes. */
export const MUTATE_SYNC_CONTENT_CHALLENGE_SWR_KEY = "MUTATE_SYNC_CONTENT_CHALLENGE_SWR"

/** Persists a recoverable Challenge draft and returns its new server revision. */
export const useMutateSyncContentChallengeSwr = () => useSWRMutation(
    MUTATE_SYNC_CONTENT_CHALLENGE_SWR_KEY,
    async (_key: string, { arg }: Trigger) => {
        const result = await mutationSyncContentChallenge({
            request: arg.request,
            headers: { "X-Course-Id": arg.courseId },
        })
        const response = result.data?.syncSubmission
        if (response?.success !== true || response.data === undefined) {
            const error = new Error(response?.message ?? "Challenge draft could not be saved.")
            Object.assign(error, { code: response?.error })
            throw error
        }
        return response.data
    },
)
