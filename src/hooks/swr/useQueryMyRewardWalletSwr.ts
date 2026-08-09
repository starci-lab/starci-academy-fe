import useSWR from "swr"
import { queryMyRewardWallet } from "../../modules/api/graphql/queries/query-my-reward-wallet"
import { type MyRewardWalletData } from "../../modules/api/graphql/queries/types/my-reward-wallet"

/**
 * The cache key for the asking learner's reward wallet.
 *
 * Exported so a redemption elsewhere can revalidate the balance it just spent from, instead
 * of leaving the reader looking at points they no longer have.
 */
export const QUERY_MY_REWARD_WALLET_SWR_KEY = ["QUERY_MY_REWARD_WALLET_SWR"]

/**
 * Reads the asking learner's reward-point balance.
 *
 * The envelope is unwrapped here, once, so no component reaches through
 * `data.myRewardWallet.data`. A missing payload becomes `null` rather than `undefined`: a
 * balance of zero is a real answer and must not be confused with no answer at all.
 */
export const useQueryMyRewardWalletSwr = () =>
    useSWR<MyRewardWalletData | null>(QUERY_MY_REWARD_WALLET_SWR_KEY, async () => {
        const result = await queryMyRewardWallet()
        return result.data?.myRewardWallet?.data ?? null
    })
