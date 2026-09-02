import { type GraphQLResponse } from "../../types"

/** Public, mounted definition of the one StarCi Pro offer. */
export type ProOfferData = {
    readonly planId: string
    readonly displayName: string
    readonly description: string
    readonly priceVnd: number
    readonly billingPeriodMonths: number
    readonly offerRevision: string
    readonly creditsPer5h: number
    readonly creditsPerWeek: number
    readonly enabled: boolean
}

/** The current learner-owned Pro period. */
export type ProSubscriptionData = {
    readonly status: string
    readonly currentPeriodEnd: string
    readonly renewalIntent: boolean
    readonly cancelledAt?: string | null
    readonly accessVersion: number
}

/** Active verdict paired with the learner's optional lifecycle row. */
export type MyProSubscriptionData = {
    readonly subscription?: ProSubscriptionData | null
    readonly active: boolean
}

/** Standard envelope returned by the public Pro offer query. */
export type QueryProOfferResponse = {
    readonly proOffer: GraphQLResponse<ProOfferData>
}

/** Standard envelope returned by the authenticated Pro lifecycle query. */
export type QueryMyProSubscriptionResponse = {
    readonly myProSubscription: GraphQLResponse<MyProSubscriptionData>
}
