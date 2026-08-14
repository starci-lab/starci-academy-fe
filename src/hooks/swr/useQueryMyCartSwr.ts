import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { QueryMyCart, queryMyCart } from "../../modules/api/graphql/queries/query-my-cart"
import { type MyCartRow } from "../../modules/api/graphql/queries/types/my-cart"

/**
 * The cache key for the asking viewer's cart.
 *
 * Exported rather than written inline so a caller that has just changed the answer - an add, a
 * removal, an emptying - names the same key instead of guessing at the string. A typo does not
 * fail; it silently creates a second cache entry, and the two copies then disagree on screen.
 */
export const QUERY_MY_CART_SWR_KEY = ["QUERY_MY_CART_SWR"]

/**
 * Reads the courses in the asking viewer's cart.
 *
 * The envelope is unwrapped here, once, so no component reaches through `data.myCart.data`. A
 * missing payload becomes `null` rather than `undefined`, because SWR already uses `undefined` to
 * mean "not loaded yet" - collapsing the two would leave the cart unable to tell an EMPTY basket
 * from one that has not arrived, and those two states draw completely differently.
 */
export const useQueryMyCartSwr = () => {
    const viewer = useViewerKey()
    return useSWR<Array<MyCartRow> | null>(
        viewer === undefined ? null : [...QUERY_MY_CART_SWR_KEY, viewer],
        async () => {
            const result = await queryMyCart({ query: QueryMyCart.Query1 })
            return result.data?.myCart?.data ?? null
        },
    )
}
