import useSWRMutation from "swr/mutation"
import { mutationRedeemReward } from "../../modules/api/graphql/mutations/mutation-redeem-reward"
import { type RedeemRewardRequest } from "../../modules/api/graphql/mutations/types/redeem-reward"

type RedeemRewardTrigger = { readonly arg: RedeemRewardRequest }

/** Stable mutation key for redeeming a named reward. */
export const MUTATE_REDEEM_REWARD_SWR_KEY = "MUTATE_REDEEM_REWARD_SWR"

/** Redeems the reward supplied to `trigger`, including the `streakFreeze` reward. */
export const useMutateRedeemRewardSwr = () => useSWRMutation(
    MUTATE_REDEEM_REWARD_SWR_KEY,
    async (_key: string, { arg }: RedeemRewardTrigger) => mutationRedeemReward({ request: arg }),
)
