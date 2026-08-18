/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MUTATE_CLEAR_CART_SWR_KEY, useMutateClearCartSwr } from "./useMutateClearCartSwr"

/**
 * What these tests guard: ONE KEY AND NO ARGUMENT, which is the deliberate opposite of the per-row
 * removal beside it. There is exactly one cart and one control that empties it, so nothing
 * distinguishes one press from another and no argument is needed.
 *
 * The running state is pinned as it actually behaves rather than as the shared flag the key
 * suggests: `useSWRMutation` holds `isMutating` in local state, so two hooks on one key do not see
 * each other's press. That is fine here because there is one control, and the test says so out
 * loud rather than leaving the next reader to assume otherwise.
 */

const mocks = vi.hoisted(() => ({ mutationClearCart: vi.fn() }))

vi.mock("../../modules/api/graphql/mutations/mutation-clear-cart", () => ({
    mutationClearCart: mocks.mutationClearCart,
}))

/** What the transport answers for an emptied cart. */
const emptied = { data: { clearCart: { success: true, message: "Cart emptied" } } }

beforeEach(() => {
    mocks.mutationClearCart.mockReset()
    mocks.mutationClearCart.mockResolvedValue(emptied)
})

describe("MUTATE_CLEAR_CART_SWR_KEY", () => {
    it("is one stable key, because there is one cart", () => {
        expect(MUTATE_CLEAR_CART_SWR_KEY).toBe("MUTATE_CLEAR_CART_SWR")
    })
})

describe("useMutateClearCartSwr", () => {
    it("rests until pressed", () => {
        const { result } = renderHook(() => useMutateClearCartSwr())
        expect(mocks.mutationClearCart).not.toHaveBeenCalled()
        expect(result.current.isMutating).toBe(false)
    })

    it("empties the cart and hands back the response", async () => {
        const { result } = renderHook(() => useMutateClearCartSwr())

        await act(async () => {
            await expect(result.current.trigger()).resolves.toEqual(emptied)
        })
        expect(mocks.mutationClearCart).toHaveBeenCalledTimes(1)
    })

    it("runs and settles, and reports the running state per hook rather than per key", async () => {
        let settle: (value: unknown) => void = () => undefined
        mocks.mutationClearCart.mockReturnValue(new Promise((resolve) => { settle = resolve }))

        const { result } = renderHook(() => ({
            pressed: useMutateClearCartSwr(),
            watching: useMutateClearCartSwr(),
        }))

        let inFlight: Promise<unknown> = Promise.resolve()
        act(() => {
            inFlight = result.current.pressed.trigger()
        })
        expect(result.current.pressed.isMutating).toBe(true)
        // `useSWRMutation` keeps `isMutating` in LOCAL state, so a second hook on the same key does
        // not learn about this press. The one control that empties the cart is therefore the only
        // thing the shared key actually disables - anything else has to read this hook's own state.
        expect(result.current.watching.isMutating).toBe(false)

        await act(async () => {
            settle(emptied)
            await inFlight
        })
        expect(result.current.pressed.isMutating).toBe(false)
    })

    it("reports a failure as an error rather than as an emptied cart", async () => {
        mocks.mutationClearCart.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useMutateClearCartSwr())

        await act(async () => {
            await expect(result.current.trigger()).rejects.toThrow("offline")
        })
        expect(result.current.error).toBeInstanceOf(Error)
    })
})
