/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MUTATE_REMOVE_FROM_CART_SWR_KEY, useMutateRemoveFromCartSwr } from "./useMutateRemoveFromCartSwr"

/**
 * What these tests guard: THE KEY CARRIES THE COURSE, which is what lets the cart disable exactly
 * the line in flight rather than the whole list. A hook with no course refuses the press instead
 * of removing whatever happens to be first.
 */

const mocks = vi.hoisted(() => ({ mutationRemoveFromCart: vi.fn() }))

vi.mock("../../modules/api/graphql/mutations/mutation-remove-from-cart", () => ({
    mutationRemoveFromCart: mocks.mutationRemoveFromCart,
}))

/** What the transport answers for an accepted press. */
const accepted = { data: { removeFromCart: { success: true, message: "Removed" } } }

beforeEach(() => {
    mocks.mutationRemoveFromCart.mockReset()
    mocks.mutationRemoveFromCart.mockResolvedValue(accepted)
})

describe("MUTATE_REMOVE_FROM_CART_SWR_KEY", () => {
    it("is a stable prefix the course is appended to", () => {
        expect(MUTATE_REMOVE_FROM_CART_SWR_KEY).toBe("MUTATE_REMOVE_FROM_CART_SWR")
    })
})

describe("useMutateRemoveFromCartSwr", () => {
    it("rests until pressed", () => {
        const { result } = renderHook(() => useMutateRemoveFromCartSwr("course-1"))
        expect(mocks.mutationRemoveFromCart).not.toHaveBeenCalled()
        expect(result.current.isMutating).toBe(false)
    })

    it("sends the course the press carries and hands back the response", async () => {
        const { result } = renderHook(() => useMutateRemoveFromCartSwr("course-1"))

        await act(async () => {
            await expect(result.current.trigger({ courseId: "course-1" })).resolves.toEqual(accepted)
        })
        expect(mocks.mutationRemoveFromCart).toHaveBeenCalledWith({ courseId: "course-1" })
    })

    it("refuses the press while no course is named", async () => {
        const { result } = renderHook(() => useMutateRemoveFromCartSwr())

        await act(async () => {
            await expect(result.current.trigger({ courseId: "course-1" })).rejects.toThrow()
        })
        expect(mocks.mutationRemoveFromCart).not.toHaveBeenCalled()
    })

    it("puts only the line in flight into its running state", async () => {
        let settle: (value: unknown) => void = () => undefined
        mocks.mutationRemoveFromCart.mockReturnValue(new Promise((resolve) => { settle = resolve }))

        const { result } = renderHook(() => ({
            pressed: useMutateRemoveFromCartSwr("course-1"),
            neighbour: useMutateRemoveFromCartSwr("course-2"),
        }))

        let inFlight: Promise<unknown> = Promise.resolve()
        act(() => {
            inFlight = result.current.pressed.trigger({ courseId: "course-1" })
        })
        expect(result.current.pressed.isMutating).toBe(true)
        expect(result.current.neighbour.isMutating).toBe(false)

        await act(async () => {
            settle(accepted)
            await inFlight
        })
        expect(result.current.pressed.isMutating).toBe(false)
    })

    it("reports a refused removal as an error rather than as a removed line", async () => {
        mocks.mutationRemoveFromCart.mockRejectedValue(new Error("not in cart"))
        const { result } = renderHook(() => useMutateRemoveFromCartSwr("course-1"))

        await act(async () => {
            await expect(result.current.trigger({ courseId: "course-1" })).rejects.toThrow("not in cart")
        })
        expect(result.current.error).toBeInstanceOf(Error)
    })
})
