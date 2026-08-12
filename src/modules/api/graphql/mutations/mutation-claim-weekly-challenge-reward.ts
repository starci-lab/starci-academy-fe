import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type GraphQLHeaders } from "../types"
import { type MutationClaimWeeklyChallengeRewardResponse } from "./types/claim-weekly-challenge-reward"

const mutation = gql`
    mutation ClaimWeeklyChallengeReward {
        claimWeeklyChallengeReward {
            success
            message
            error
            data { coinReward balance }
        }
    }
`

/** Transport options accepted by the argument-free weekly reward mutation. */
export type ClaimWeeklyChallengeRewardOptions = {
    readonly headers?: GraphQLHeaders
    readonly signal?: AbortSignal
    readonly debug?: boolean
}

/** Claims the authenticated viewer's reward for the featured weekly challenge. */
export const mutationClaimWeeklyChallengeReward = async (
    options: ClaimWeeklyChallengeRewardOptions = {},
) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.mutate<MutationClaimWeeklyChallengeRewardResponse>({ mutation })
}
