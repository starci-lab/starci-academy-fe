"use client"

import { useSWRConfig } from "swr"
import { useMutateRemoveFromCartSwr } from "@/hooks"
import { QUERY_MY_CART_SWR_KEY } from "@/hooks/swr/useQueryMyCartSwr"
import { CartLineBase, type CartLineData } from "./component"

/**
 * One basket line, with the removal it owns.
 *
 * WHY THE REMOVAL IS RESOLVED HERE AND NOT ON THE PAGE. The mutation's key carries the course, so
 * that removing one row does not put every other row's control into the running state - and a key
 * per course means one hook per course, which a page cannot do: hooks are not called in a loop. The
 * line is the smallest thing that owns exactly one course, so it is the smallest thing that can ask.
 *
 * IT REVALIDATES THE CART RATHER THAN EDITING A LIST. The removal changes what the server holds,
 * and the cart query is the one record of that; a page that spliced the row out of its own array
 * would be a second copy of the truth, correct until the next thing changed it.
 *
 * THE PRICE IS NOT REVALIDATED HERE, deliberately. Removing a line re-prices the whole order,
 * because the bundle bonus depends on how many courses there are - and the checkout preview is
 * keyed by the set of course ids, so it re-runs on its own the moment the cart answer changes. A
 * second invalidation from here would fire the same request twice.
 */

/** What the connected line needs from the surface holding it. */
export type CartLineProps = {
    /** Whether this is a real line or one of the list's resting shapes. */
    readonly state?: "pending" | "ready"
    /** The already-resolved line. */
    readonly line: CartLineData
}

/**
 * Draw one basket line and let it remove itself.
 *
 * @param input - {@link CartLineProps}
 */
export const CartLine = (props: CartLineProps) => {
    const { state = "ready", line } = props
    const { mutate } = useSWRConfig()
    const removal = useMutateRemoveFromCartSwr(state === "pending" ? undefined : line.courseId)

    return (
        <CartLineBase
            state={removal.isMutating ? "removing" : state}
            props={line}
            on={{
                remove: () => {
                    void removal.trigger({ courseId: line.courseId }).then((result) => {
                        // Reported, not assumed. The server answers an envelope rather than throwing
                        // on a refused removal, so a failure must leave the row where it is instead
                        // of vanishing it and letting the next read put it back.
                        if (result?.data?.removeFromCart?.success !== true) return
                        void mutate(
                            (key) => Array.isArray(key) && key[0] === QUERY_MY_CART_SWR_KEY[0],
                        )
                    })
                },
            }}
        />
    )
}
