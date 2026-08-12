import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type MutationParams } from "./types/params"
import {
    type MutationRedeemRewardResponse,
    type RedeemRewardRequest,
} from "./types/redeem-reward"

const mutation1 = gql`
    mutation RedeemReward($request: RedeemRewardRequest!) {
        redeemReward(request: $request) {
            success
            message
            error
            data {
                balance
                streakFreezes
                voucherCode
                aiCreditGranted { amount5h amountWeek }
            }
        }
    }
`

/** Supported reward-redemption mutation documents. */
export enum MutationRedeemReward { Mutation1 = "mutation1" }

/** Every supported reward-redemption document keyed by its public variant. */
export const mutationRedeemRewardMap: Record<MutationRedeemReward, DocumentNode> = {
    [MutationRedeemReward.Mutation1]: mutation1,
}

/** Redeems a named reward for the authenticated viewer. */
export const mutationRedeemReward = async ({
    mutation = MutationRedeemReward.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationRedeemReward, RedeemRewardRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.mutate<MutationRedeemRewardResponse>({
        mutation: mutationRedeemRewardMap[mutation],
        variables: { request },
    })
}
