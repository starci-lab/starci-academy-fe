import useSWRMutation from "swr/mutation"
import { mutateSubmitPersonalTaskAttempt } from "@/modules/api/graphql/queries/query-course-personal-project"
import type { SubmitPersonalTaskAttemptRequest } from "@/modules/api/graphql/queries/types/course-personal-project"

type SubmitPersonalTaskAttemptTrigger = { readonly arg: SubmitPersonalTaskAttemptRequest }

/** Stable mutation identity for enqueueing personal-project task grading. */
export const MUTATE_SUBMIT_PERSONAL_TASK_ATTEMPT_SWR_KEY =
    "MUTATE_SUBMIT_PERSONAL_TASK_ATTEMPT_SWR"

/** Enqueues real backend grading and rejects incomplete GraphQL envelopes. */
export const useMutateSubmitPersonalTaskAttemptSwr = () => useSWRMutation(
    MUTATE_SUBMIT_PERSONAL_TASK_ATTEMPT_SWR_KEY,
    async (_key: string, { arg }: SubmitPersonalTaskAttemptTrigger) => {
        const result = await mutateSubmitPersonalTaskAttempt(arg)
        const response = result.data?.reviewPersonalProjectTask
        if (response?.success !== true || response.data?.jobId === undefined) {
            throw new Error(response?.message ?? "Personal-project review could not be started.")
        }
        return response.data
    },
)
