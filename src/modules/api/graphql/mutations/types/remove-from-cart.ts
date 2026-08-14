import { type GraphQLResponse } from "../../types"

/** What the server reports after a removal. */
export type RemoveFromCartData = {
    /** Whether a row was actually deleted. `false` means it was already gone. */
    readonly removed: boolean
}

/** Standard GraphQL envelope returned by the remove-from-cart mutation. */
export type MutationRemoveFromCartResponse = {
    readonly removeFromCart: GraphQLResponse<RemoveFromCartData>
}

/** What the caller varies: which course comes out. */
export type MutationRemoveFromCartRequest = {
    /** Course to take out of the cart. */
    readonly courseId: string
}
