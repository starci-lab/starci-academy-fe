import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type GraphQLHeaders } from "../types"
import {
    type MutationPurchaseProSubscriptionRequest,
    type MutationPurchaseProSubscriptionResponse,
} from "./types/pro-subscription"

const mutation = gql`
    mutation PurchaseProSubscription($request: PurchaseProSubscriptionRequest!) {
        purchaseProSubscription(request: $request) {
            success
            message
            error
            data { checkoutUrl referenceId transactionId amount checkoutFields }
        }
    }
`

/** Transport options for one authenticated Pro checkout mutation. */
export type PurchaseProSubscriptionOptions = {
    readonly headers?: GraphQLHeaders
    readonly signal?: AbortSignal
    readonly debug?: boolean
}

/** Open a pending Pro checkout; only verified backend settlement may grant access. */
export const mutationPurchaseProSubscription = async (
    request: MutationPurchaseProSubscriptionRequest,
    options: PurchaseProSubscriptionOptions = {},
) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.mutate<MutationPurchaseProSubscriptionResponse>({ mutation, variables: { request } })
}
