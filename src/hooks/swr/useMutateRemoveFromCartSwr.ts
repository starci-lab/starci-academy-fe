import useSWRMutation from "swr/mutation"
import { mutationRemoveFromCart } from "../../modules/api/graphql/mutations/mutation-remove-from-cart"

/** Stable mutation key prefix for taking a course out of the viewer's cart. */
export const MUTATE_REMOVE_FROM_CART_SWR_KEY = "MUTATE_REMOVE_FROM_CART_SWR"

/** What one press carries: the course leaving the cart. */
export type RemoveFromCartArg = {
    readonly courseId: string
}

/** What SWR hands the fetcher on `trigger`. */
export type RemoveFromCartTrigger = {
    readonly arg: RemoveFromCartArg
}

/**
 * Takes one course out of the signed-in viewer's cart.
 *
 * THE KEY CARRIES THE COURSE, and it has to. Every hook sharing a key shares its state, so a list
 * of rows on one key is a list where removing ONE row puts every other row's control into the
 * running state. The course is what makes this press a different press from the one on the row
 * above it - and it is why the cart can disable exactly the line in flight rather than the list.
 *
 * @param courseId - The course this hook's press is about, or `undefined` to stay idle.
 */
export const useMutateRemoveFromCartSwr = (courseId?: string) => useSWRMutation(
    courseId === undefined ? null : [MUTATE_REMOVE_FROM_CART_SWR_KEY, courseId],
    async (_key: readonly [string, string], { arg }: RemoveFromCartTrigger) =>
        mutationRemoveFromCart({ courseId: arg.courseId }),
)
