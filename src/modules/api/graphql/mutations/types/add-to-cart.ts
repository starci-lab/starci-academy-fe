import { type GraphQLResponse } from "../../types"

/** The cart row that now holds the course. */
export type AddToCartData = {
    /** The row's own id. */
    readonly id: string
    /** The course sitting in it - the caller already knows it, and reads it back to be sure. */
    readonly courseId: string
}

/** Standard GraphQL envelope returned by the add-to-cart mutation. */
export type MutationAddToCartResponse = {
    readonly addToCart: GraphQLResponse<AddToCartData>
}

/** What the caller varies: which course goes in. */
export type MutationAddToCartRequest = {
    /** Course to place in the cart. */
    readonly courseId: string
}
