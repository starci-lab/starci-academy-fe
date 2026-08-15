import useSWRMutation from "swr/mutation"
import { mutationStartTrial } from "../../modules/api/graphql/mutations/mutation-start-trial"

/** Stable per-course key for a trial mutation. */
export const MUTATE_START_TRIAL_SWR_KEY = "MUTATE_START_TRIAL_SWR"

/** Course carried by a trial press. */
export type StartTrialArg = {
    readonly courseId: string
}

/** Argument envelope SWR hands to the mutation fetcher. */
export type StartTrialTrigger = {
    readonly arg: StartTrialArg
}

/** Start one course trial without coupling navigation to mutation success. */
export const useMutateStartTrialSwr = (courseId?: string) => useSWRMutation(
    courseId === undefined ? null : [MUTATE_START_TRIAL_SWR_KEY, courseId],
    async (_key: readonly [string, string], { arg }: StartTrialTrigger) =>
        mutationStartTrial({ courseId: arg.courseId }),
)
