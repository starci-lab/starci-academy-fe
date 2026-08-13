import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type GraphQLHeaders } from "../types"
import {
    type MutationAddToCartRequest,
    type MutationAddToCartResponse,
} from "./types/add-to-cart"

const mutation = gql`
    mutation AddToCart($request: AddToCartRequest!) {
        addToCart(request: $request) {
            success
            message
            error
            data { id courseId }
        }
    }
`

/** Transport options accepted by the add-to-cart mutation. */
export type AddToCartOptions = {
    readonly headers?: GraphQLHeaders
    readonly signal?: AbortSignal
    readonly debug?: boolean
}

/**
 * Places a course in the signed-in viewer's cart.
 *
 * IT IS IDEMPOTENT PER VIEWER AND COURSE, which the server owns and the caller relies on: pressing
 * the control twice puts one course in the cart, so the surface does not have to guard the press or
 * read the cart back before offering it.
 *
 * @param request - Which course goes in.
 * @param options - Transport options.
 */
export const mutationAddToCart = async (
    request: MutationAddToCartRequest,
    options: AddToCartOptions = {},
) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.mutate<MutationAddToCartResponse>({ mutation, variables: { request } })
}
