import { type GraphQLResponse } from "../../types"

/** The course a cart row holds, selected the way the catalogue already selects one. */
export type MyCartCourse = {
    /** Course id - what the remove mutation and the checkout preview are keyed by. */
    readonly id: string
    /** Course title. */
    readonly title: string
    /** Course artwork; absent draws the cover leaf's token fallback. */
    readonly coverImageUrl?: string | null
    /** List price before any reduction, in VND. */
    readonly originalPrice?: number | null
}

/**
 * One row of the viewer's cart.
 *
 * The course arrives NESTED rather than flattened, because that is what the server returns:
 * `myCart` loads cart rows with their course relation. Flattening it here would invent a shape the
 * schema does not have, and the first field anybody needed beyond the flattened three would have to
 * break the invention open again.
 */
export type MyCartRow = {
    /** The cart row's own id. */
    readonly id: string
    /** Id of the course sitting in the row. */
    readonly courseId: string
    /** The course itself. */
    readonly course: MyCartCourse
}

/** Standard GraphQL envelope returned by the `myCart` query. */
export type QueryMyCartResponse = {
    readonly myCart: GraphQLResponse<Array<MyCartRow>>
}
