import useSWRMutation from "swr/mutation"
import { mutationClaimWeeklyChallengeReward } from "../../modules/api/graphql/mutations/mutation-claim-weekly-challenge-reward"

/** Stable mutation key for claiming the current weekly-challenge reward. */
export const MUTATE_CLAIM_WEEKLY_CHALLENGE_REWARD_SWR_KEY =
    "MUTATE_CLAIM_WEEKLY_CHALLENGE_REWARD_SWR"

/** Claims the authenticated learner's reward for the featured weekly challenge. */
export const useMutateClaimWeeklyChallengeRewardSwr = () => useSWRMutation(
    MUTATE_CLAIM_WEEKLY_CHALLENGE_REWARD_SWR_KEY,
    async () => mutationClaimWeeklyChallengeReward(),
)
