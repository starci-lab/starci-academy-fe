/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MUTATE_ADD_TO_CART_SWR_KEY, useMutateAddToCartSwr } from "./useMutateAddToCartSwr"

/**
 * What these tests guard: THE KEY CARRIES THE COURSE, which is what stops a grid of cards sharing
 * one running state - twelve spinners for one press. Two hooks on two courses must be able to run
 * independently, and one with no course at all must refuse the press rather than add an unnamed
 * course.
 */

const mocks = vi.hoisted(() => ({ mutationAddToCart: vi.fn() }))

vi.mock("../../modules/api/graphql/mutations/mutation-add-to-cart", () => ({
    mutationAddToCart: mocks.mutationAddToCart,
}))

/** What the transport answers for an accepted press. */
const accepted = { data: { addToCart: { success: true, message: "Added" } } }

beforeEach(() => {
    mocks.mutationAddToCart.mockReset()
    mocks.mutationAddToCart.mockResolvedValue(accepted)
})

describe("MUTATE_ADD_TO_CART_SWR_KEY", () => {
    it("is a stable prefix the course is appended to", () => {
        expect(MUTATE_ADD_TO_CART_SWR_KEY).toBe("MUTATE_ADD_TO_CART_SWR")
    })
})

describe("useMutateAddToCartSwr", () => {
    it("rests until pressed", () => {
        const { result } = renderHook(() => useMutateAddToCartSwr("course-1"))
        expect(mocks.mutationAddToCart).not.toHaveBeenCalled()
        expect(result.current.isMutating).toBe(false)
        expect(result.current.data).toBeUndefined()
    })

    it("sends the course the press carries and hands back the response", async () => {
        const { result } = renderHook(() => useMutateAddToCartSwr("course-1"))

        await act(async () => {
            await expect(result.current.trigger({ courseId: "course-1" })).resolves.toEqual(accepted)
        })
        expect(mocks.mutationAddToCart).toHaveBeenCalledWith({ courseId: "course-1" })
    })

    it("refuses the press while no course is named, rather than adding an unnamed one", async () => {
        const { result } = renderHook(() => useMutateAddToCartSwr())

        await act(async () => {
            await expect(result.current.trigger({ courseId: "course-1" })).rejects.toThrow()
        })
        expect(mocks.mutationAddToCart).not.toHaveBeenCalled()
    })

    it("keeps one card's running state off the card beside it", async () => {
        let settle: (value: unknown) => void = () => undefined
        mocks.mutationAddToCart.mockReturnValue(new Promise((resolve) => { settle = resolve }))

        const { result } = renderHook(() => ({
            pressed: useMutateAddToCartSwr("course-1"),
            neighbour: useMutateAddToCartSwr("course-2"),
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

    it("reports a refused press as an error rather than as a full cart", async () => {
        mocks.mutationAddToCart.mockRejectedValue(new Error("already in cart"))
        const { result } = renderHook(() => useMutateAddToCartSwr("course-1"))

        await act(async () => {
            await expect(result.current.trigger({ courseId: "course-1" })).rejects.toThrow("already in cart")
        })
        expect(result.current.error).toBeInstanceOf(Error)
    })
})
