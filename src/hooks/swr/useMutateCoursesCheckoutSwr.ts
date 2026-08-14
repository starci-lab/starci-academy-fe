import useSWRMutation from "swr/mutation"
import { mutationCoursesCheckout } from "../../modules/api/graphql/mutations/mutation-courses-checkout"

/** Stable mutation key for opening a payment for the cart. */
export const MUTATE_COURSES_CHECKOUT_SWR_KEY = "MUTATE_COURSES_CHECKOUT_SWR"

/** What one press carries: the order and the provider taking it. */
export type CoursesCheckoutArg = {
    readonly courseIds: ReadonlyArray<string>
    readonly paymentType: string
    readonly returnUrl?: string
    readonly cancelUrl?: string
}

/** What SWR hands the fetcher on `trigger`. */
export type CoursesCheckoutTrigger = {
    readonly arg: CoursesCheckoutArg
}

/**
 * Opens a payment for the whole cart.
 *
 * ONE KEY, because there is one cart and one press that pays for it. Unlike the per-row removal,
 * nothing distinguishes one press from another here, so a shared running state is the correct one -
 * and it is what stops a second press opening a second order while the first is still resolving.
 */
export const useMutateCoursesCheckoutSwr = () => useSWRMutation(
    MUTATE_COURSES_CHECKOUT_SWR_KEY,
    async (_key: string, { arg }: CoursesCheckoutTrigger) =>
        mutationCoursesCheckout({
            courseIds: [...arg.courseIds],
            paymentType: arg.paymentType,
            returnUrl: arg.returnUrl,
            cancelUrl: arg.cancelUrl,
        }),
)
