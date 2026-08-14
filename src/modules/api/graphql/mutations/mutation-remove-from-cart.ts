import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type GraphQLHeaders } from "../types"
import {
    type MutationRemoveFromCartRequest,
    type MutationRemoveFromCartResponse,
} from "./types/remove-from-cart"

const mutation = gql`
    mutation RemoveFromCart($request: RemoveFromCartRequest!) {
        removeFromCart(request: $request) {
            success
            message
            error
            data { removed }
        }
    }
`

/** Transport options accepted by the remove-from-cart mutation. */
export type RemoveFromCartOptions = {
    readonly headers?: GraphQLHeaders
    readonly signal?: AbortSignal
    readonly debug?: boolean
}

/**
 * Takes one course out of the signed-in viewer's cart.
 *
 * IT IS IDEMPOTENT, and `removed` says which of the two happened: the server deletes by viewer and
 * course and reports whether a row was there. A second press on a row that has already gone is not
 * an error, so the surface does not have to guard it - but the flag is returned rather than
 * swallowed, because "already gone" and "just removed" are different answers to a reader watching
 * the list.
 *
 * @param request - Which course comes out.
 * @param options - Transport options.
 */
export const mutationRemoveFromCart = async (
    request: MutationRemoveFromCartRequest,
    options: RemoveFromCartOptions = {},
) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.mutate<MutationRemoveFromCartResponse>({ mutation, variables: { request } })
}
