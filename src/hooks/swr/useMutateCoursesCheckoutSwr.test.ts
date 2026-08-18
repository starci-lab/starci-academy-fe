/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MUTATE_COURSES_CHECKOUT_SWR_KEY, useMutateCoursesCheckoutSwr } from "./useMutateCoursesCheckoutSwr"

/**
 * What these tests guard: the order is COPIED out of the readonly cart before it is sent, and the
 * two optional return addresses travel exactly as given - including as `undefined`, because a
 * provider handed an empty string sends the payer nowhere.
 *
 * ONE KEY, because there is one cart and one press that pays for it. The running state is pinned
 * as it actually behaves: `useSWRMutation` holds `isMutating` locally, so the key does not share it
 * between hooks - the single checkout control is what keeps one press to one order.
 */

const mocks = vi.hoisted(() => ({ mutationCoursesCheckout: vi.fn() }))

vi.mock("../../modules/api/graphql/mutations/mutation-courses-checkout", () => ({
    mutationCoursesCheckout: mocks.mutationCoursesCheckout,
}))

/** What the transport answers for an opened payment. */
const opened = {
    data: { coursesCheckout: { success: true, message: "ok", data: { payUrl: "https://pay.example.com/1" } } },
}

beforeEach(() => {
    mocks.mutationCoursesCheckout.mockReset()
    mocks.mutationCoursesCheckout.mockResolvedValue(opened)
})

describe("MUTATE_COURSES_CHECKOUT_SWR_KEY", () => {
    it("is one stable key, because there is one cart", () => {
        expect(MUTATE_COURSES_CHECKOUT_SWR_KEY).toBe("MUTATE_COURSES_CHECKOUT_SWR")
    })
})

describe("useMutateCoursesCheckoutSwr", () => {
    it("opens no payment until the reader presses", () => {
        const { result } = renderHook(() => useMutateCoursesCheckoutSwr())
        expect(mocks.mutationCoursesCheckout).not.toHaveBeenCalled()
        expect(result.current.isMutating).toBe(false)
    })

    it("sends the whole order, with both return addresses when they are given", async () => {
        const { result } = renderHook(() => useMutateCoursesCheckoutSwr())

        await act(async () => {
            await expect(result.current.trigger({
                courseIds: ["course-a", "course-b"],
                paymentType: "sepay",
                returnUrl: "https://app.example.com/done",
                cancelUrl: "https://app.example.com/cart",
            })).resolves.toEqual(opened)
        })
        expect(mocks.mutationCoursesCheckout).toHaveBeenCalledWith({
            courseIds: ["course-a", "course-b"],
            paymentType: "sepay",
            returnUrl: "https://app.example.com/done",
            cancelUrl: "https://app.example.com/cart",
        })
    })

    it("leaves the return addresses undefined when the caller omitted them", async () => {
        const { result } = renderHook(() => useMutateCoursesCheckoutSwr())

        await act(async () => {
            await result.current.trigger({ courseIds: ["course-a"], paymentType: "payos" })
        })
        expect(mocks.mutationCoursesCheckout).toHaveBeenCalledWith({
            courseIds: ["course-a"],
            paymentType: "payos",
            returnUrl: undefined,
            cancelUrl: undefined,
        })
    })

    it("copies the order rather than sending the cart's own array", async () => {
        const { result } = renderHook(() => useMutateCoursesCheckoutSwr())

        const courseIds = ["course-a"]
        await act(async () => {
            await result.current.trigger({ courseIds, paymentType: "sepay" })
        })
        const sent = mocks.mutationCoursesCheckout.mock.calls[0][0].courseIds
        expect(sent).toEqual(courseIds)
        expect(sent).not.toBe(courseIds)
    })

    it("reports the order in flight on the hook that pressed, and settles it", async () => {
        let settle: (value: unknown) => void = () => undefined
        mocks.mutationCoursesCheckout.mockReturnValue(new Promise((resolve) => { settle = resolve }))

        const { result } = renderHook(() => ({
            pressed: useMutateCoursesCheckoutSwr(),
            watching: useMutateCoursesCheckoutSwr(),
        }))

        let inFlight: Promise<unknown> = Promise.resolve()
        act(() => {
            inFlight = result.current.pressed.trigger({ courseIds: ["course-a"], paymentType: "sepay" })
        })
        expect(result.current.pressed.isMutating).toBe(true)
        // `useSWRMutation` keeps `isMutating` in LOCAL state, so sharing the key does NOT share the
        // running flag: only the control that pressed disables itself. One checkout button is the
        // reason that is still safe, not the key.
        expect(result.current.watching.isMutating).toBe(false)

        await act(async () => {
            settle(opened)
            await inFlight
        })
        expect(result.current.pressed.isMutating).toBe(false)
        expect(result.current.pressed.data).toEqual(opened)
    })

    it("reports a transport failure as an error rather than as an opened payment", async () => {
        mocks.mutationCoursesCheckout.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useMutateCoursesCheckoutSwr())

        await act(async () => {
            await expect(result.current.trigger({ courseIds: ["course-a"], paymentType: "sepay" }))
                .rejects.toThrow("offline")
        })
        expect(result.current.error).toBeInstanceOf(Error)
    })
})
