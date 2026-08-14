import useSWRMutation from "swr/mutation"
import { mutationSubmitContentChallenge, type SubmitContentChallengeRequest } from "@/modules/api/graphql/mutations/mutation-submit-content-challenge"

/** Course-scoped payload required to pass the enrollment guard while submitting a challenge. */
export interface SubmitContentChallengeArg {
    readonly courseId: string
    readonly request: SubmitContentChallengeRequest
}

type Trigger = { readonly arg: SubmitContentChallengeArg }

/** Stable SWR mutation identity for content challenge submissions. */
export const MUTATE_SUBMIT_CONTENT_CHALLENGE_SWR_KEY = "MUTATE_SUBMIT_CONTENT_CHALLENGE_SWR"

/** Enqueues grading with the course context required by the backend guard. */
export const useMutateSubmitContentChallengeSwr = () => useSWRMutation(
    MUTATE_SUBMIT_CONTENT_CHALLENGE_SWR_KEY,
    async (_key: string, { arg }: Trigger) => {
        const result = await mutationSubmitContentChallenge({
            request: arg.request,
            headers: { "X-Course-Id": arg.courseId },
        })
        const response = result.data?.submitChallengeSubmission
        if (response?.success !== true || response.data?.jobId === undefined) {
            throw new Error(response?.message ?? "Challenge submission could not be started.")
        }
        return response.data
    },
)
