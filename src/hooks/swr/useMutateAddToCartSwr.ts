import useSWRMutation from "swr/mutation"
import { mutationAddToCart } from "../../modules/api/graphql/mutations/mutation-add-to-cart"

/** Stable mutation key prefix for placing a course in the viewer's cart. */
export const MUTATE_ADD_TO_CART_SWR_KEY = "MUTATE_ADD_TO_CART_SWR"

/** What one press carries: the course going into the cart. */
export type AddToCartArg = {
    readonly courseId: string
}

/** What SWR hands the fetcher on `trigger`. */
export type AddToCartTrigger = {
    readonly arg: AddToCartArg
}

/**
 * Places one course in the signed-in viewer's cart.
 *
 * THE KEY CARRIES THE COURSE, and it has to. Every hook sharing a key shares its state, so a grid
 * of cards on one key is a grid where pressing ONE card puts every other card's control into the
 * running state - twelve spinners for one press. The course is what makes this press a different
 * press from the one on the card beside it.
 *
 * @param courseId - The course this hook's press is about, or `undefined` to stay idle.
 */
export const useMutateAddToCartSwr = (courseId?: string) => useSWRMutation(
    courseId === undefined ? null : [MUTATE_ADD_TO_CART_SWR_KEY, courseId],
    async (_key: readonly [string, string], { arg }: AddToCartTrigger) =>
        mutationAddToCart({ courseId: arg.courseId }),
)
