import { type GraphQLResponse } from "../../types"

/** Where the provider takes the buyer, and what the order is called. */
export type CoursesCheckoutData = {
    /** The provider page to send the buyer to. */
    readonly checkoutUrl: string
    /** The order code the provider and the webhook both use. */
    readonly referenceId: string
    /** The transaction this checkout created. */
    readonly transactionId: string
    /** Signed form fields, for a provider that wants a POST rather than a redirect. */
    readonly checkoutFields?: string | null
}

/** Standard GraphQL envelope returned by the checkout mutation. */
export type MutationCoursesCheckoutResponse = {
    readonly coursesCheckout: GraphQLResponse<CoursesCheckoutData>
}

/** What the caller varies: the order, the provider, and where to come back to. */
export type MutationCoursesCheckoutRequest = {
    /** The courses being bought together. */
    readonly courseIds: Array<string>
    /** The provider that will collect the total. */
    readonly paymentType: string
    /** Where the provider returns a buyer who paid. */
    readonly returnUrl?: string
    /** Where the provider returns a buyer who abandoned. */
    readonly cancelUrl?: string
}
