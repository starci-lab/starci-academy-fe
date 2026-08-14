import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type QueryParams } from "../types"
import { type QueryMyCartResponse } from "./types/my-cart"

/**
 * The courses sitting in the ASKING viewer's cart, oldest first.
 *
 * Required-auth: a cart belongs to somebody, and the server answers this behind a guard, so there
 * is no anonymous version of the answer to fall back to.
 *
 * IT SELF-HEALS ON THE SERVER, which is why nothing here filters. `myCart` drops rows for courses
 * the viewer has since enrolled in and deletes them, so a cart that went stale while an instalment
 * plan unlocked an enrolment returns already correct. A client-side filter would be a second copy
 * of that rule, and the copy nobody edits is the one that stops matching.
 */
const query1 = gql`
    query MyCart {
        myCart {
            success
            message
            error
            data {
                id
                courseId
                course {
                    id
                    title
                    coverImageUrl
                    originalPrice
                }
            }
        }
    }
`

/** The document variants of this query. */
export enum QueryMyCart {
    /** The cart-line selection: the row, its course, and what that course lists at. */
    Query1 = "query1",
}

/** Every document this query can send, keyed by variant. */
export const queryMyCartMap: Record<QueryMyCart, DocumentNode> = {
    [QueryMyCart.Query1]: query1,
}

/** Fetches the asking viewer's cart. Always sends the bearer token. */
export const queryMyCart = async ({
    query = QueryMyCart.Query1,
    headers,
    signal,
    debug,
}: QueryParams<QueryMyCart> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryMyCartResponse>({
        query: queryMyCartMap[query],
        fetchPolicy: "network-only",
    })
}
