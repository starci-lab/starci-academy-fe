import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type GraphQLHeaders } from "../types"
import { type MutationClearCartResponse } from "./types/clear-cart"

const mutation = gql`
    mutation ClearCart {
        clearCart {
            success
            message
            error
            data { removedCount }
        }
    }
`

/** Transport options accepted by the clear-cart mutation. */
export type ClearCartOptions = {
    readonly headers?: GraphQLHeaders
    readonly signal?: AbortSignal
    readonly debug?: boolean
}

/**
 * Empties the signed-in viewer's cart.
 *
 * IT CARRIES NO REQUEST, because the viewer IS the argument: the server clears by the token it was
 * handed. A `courseIds` list would let a caller empty part of a cart, which is what removing a line
 * already does, and two ways to do one thing is how the two stop agreeing.
 *
 * @param options - Transport options.
 */
export const mutationClearCart = async (options: ClearCartOptions = {}) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.mutate<MutationClearCartResponse>({ mutation })
}
