import useSWRMutation from "swr/mutation"
import { mutationClearCart } from "../../modules/api/graphql/mutations/mutation-clear-cart"

/** Stable mutation key for emptying the viewer's cart. */
export const MUTATE_CLEAR_CART_SWR_KEY = "MUTATE_CLEAR_CART_SWR"

/**
 * Empties the signed-in viewer's cart.
 *
 * ONE KEY, NO ARGUMENT, unlike the per-row removal beside it: there is exactly one cart per viewer
 * and exactly one control that empties it, so nothing distinguishes one press from another and a
 * shared running state is the correct one.
 */
export const useMutateClearCartSwr = () => useSWRMutation(
    MUTATE_CLEAR_CART_SWR_KEY,
    async () => mutationClearCart(),
)
