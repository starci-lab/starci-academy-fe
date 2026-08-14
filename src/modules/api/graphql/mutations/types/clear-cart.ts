import { type GraphQLResponse } from "../../types"

/** What the server reports after emptying the cart. */
export type ClearCartData = {
    /** How many rows were deleted. Zero means the cart was already empty. */
    readonly removedCount: number
}

/** Standard GraphQL envelope returned by the clear-cart mutation. */
export type MutationClearCartResponse = {
    readonly clearCart: GraphQLResponse<ClearCartData>
}
