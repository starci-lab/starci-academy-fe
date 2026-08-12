import { type GraphQLResponse } from "../../types"

/** GraphQL input accepted by the reward redemption resolver. */
export type RedeemRewardRequest = {
    readonly rewardKey: string
    readonly recipientName?: string
    readonly phone?: string
    readonly address?: string
}

/** Optional AI-credit grant returned by an AI-credit reward. */
export type RedeemRewardAiCreditGrant = {
    readonly amount5h: number
    readonly amountWeek: number
}

/** Wallet and reward state after a successful redemption. */
export type RedeemRewardData = {
    readonly balance: number
    readonly streakFreezes: number
    readonly voucherCode?: string | null
    readonly aiCreditGranted?: RedeemRewardAiCreditGrant | null
}

/** Standard GraphQL envelope returned by the reward redemption mutation. */
export type MutationRedeemRewardResponse = {
    readonly redeemReward: GraphQLResponse<RedeemRewardData>
}
