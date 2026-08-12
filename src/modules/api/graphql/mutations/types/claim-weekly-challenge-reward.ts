import { type GraphQLResponse } from "../../types"

/** Coin grant and resulting wallet balance after a successful claim. */
export type ClaimWeeklyChallengeRewardData = {
    readonly coinReward: number
    readonly balance: number
}

/** Standard GraphQL envelope returned by the weekly challenge claim mutation. */
export type MutationClaimWeeklyChallengeRewardResponse = {
    readonly claimWeeklyChallengeReward: GraphQLResponse<ClaimWeeklyChallengeRewardData>
}
