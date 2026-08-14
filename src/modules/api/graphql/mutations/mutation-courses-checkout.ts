import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type GraphQLHeaders } from "../types"
import {
    type MutationCoursesCheckoutRequest,
    type MutationCoursesCheckoutResponse,
} from "./types/courses-checkout"

const mutation = gql`
    mutation CoursesCheckout($request: CoursesCheckoutRequest!) {
        coursesCheckout(request: $request) {
            success
            message
            error
            data { checkoutUrl referenceId transactionId checkoutFields }
        }
    }
`

/** Transport options accepted by the checkout mutation. */
export type CoursesCheckoutOptions = {
    readonly headers?: GraphQLHeaders
    readonly signal?: AbortSignal
    readonly debug?: boolean
}

/**
 * Opens a payment for the whole cart.
 *
 * IT DOES NOT ENROL ANYBODY. The server creates a pending order and a provider intent and hands
 * back a URL; the enrolment happens when the provider's webhook confirms the money arrived. So the
 * caller's job ends at sending the buyer to `checkoutUrl` - a surface that celebrated here would be
 * celebrating a payment that has not happened.
 *
 * `installmentMonths` IS DELIBERATELY NOT SENT. The approved design draws a front-loaded schedule
 * the server cannot yet charge: it splits a term into equal cycles, and the two enablers that teach
 * it the 50 / 27,5 / 27,5 vector are not built. Sending the field would take the buyer's money on a
 * schedule different from the one they were shown.
 *
 * @param request - The order, the provider and the return URLs.
 * @param options - Transport options.
 */
export const mutationCoursesCheckout = async (
    request: MutationCoursesCheckoutRequest,
    options: CoursesCheckoutOptions = {},
) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.mutate<MutationCoursesCheckoutResponse>({ mutation, variables: { request } })
}
