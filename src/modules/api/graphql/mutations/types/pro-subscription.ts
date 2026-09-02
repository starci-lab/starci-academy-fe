import { type GraphQLResponse } from "../../types"

/** Provider handoff returned for one pending Pro transaction. */
export type ProCheckoutData = {
    readonly checkoutUrl: string
    readonly referenceId: string
    readonly transactionId: string
    readonly amount: number
    readonly checkoutFields?: string | null
}

/** Standard envelope returned by the Pro purchase mutation. */
export type MutationPurchaseProSubscriptionResponse = {
    readonly purchaseProSubscription: GraphQLResponse<ProCheckoutData>
}

/** Explicit provider and redirect URLs accepted by the Pro purchase mutation. */
export type MutationPurchaseProSubscriptionRequest = {
    readonly paymentType: "payos"
    readonly payosReturnUrl?: string
    readonly payosCancelUrl?: string
}
