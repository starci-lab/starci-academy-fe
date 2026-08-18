/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MUTATE_SET_FOLLOW_SWR_KEY, useMutateSetFollowSwr } from "./useMutateSetFollowSwr"

/**
 * What these tests guard: this SETS a state rather than toggling one, so both directions have to
 * reach the wire as written. A hook that only sent "follow" would leave an unfollow pressed on a
 * row that never changed.
 */

const mocks = vi.hoisted(() => ({ mutationSetFollow: vi.fn() }))

vi.mock("../../modules/api/graphql/mutations/mutation-set-follow", () => ({
    mutationSetFollow: mocks.mutationSetFollow,
}))

/** What the transport answers for a recorded follow change. */
const recorded = { data: { setFollow: { success: true, message: "ok" } } }

beforeEach(() => {
    mocks.mutationSetFollow.mockReset()
    mocks.mutationSetFollow.mockResolvedValue(recorded)
})

describe("MUTATE_SET_FOLLOW_SWR_KEY", () => {
    it("is one stable key", () => {
        expect(MUTATE_SET_FOLLOW_SWR_KEY).toBe("MUTATE_SET_FOLLOW_SWR")
    })
})

describe("useMutateSetFollowSwr", () => {
    it("follows nobody until the reader presses", () => {
        const { result } = renderHook(() => useMutateSetFollowSwr())
        expect(mocks.mutationSetFollow).not.toHaveBeenCalled()
        expect(result.current.isMutating).toBe(false)
    })

    it("wraps the trigger argument as the request and hands back the response", async () => {
        const { result } = renderHook(() => useMutateSetFollowSwr())

        const request = { userId: "user-1", follow: true }
        await act(async () => {
            await expect(result.current.trigger(request)).resolves.toEqual(recorded)
        })
        expect(mocks.mutationSetFollow).toHaveBeenCalledWith({ request })
    })

    it("sends the unfollow direction just as plainly as the follow", async () => {
        const { result } = renderHook(() => useMutateSetFollowSwr())

        await act(async () => {
            await result.current.trigger({ userId: "user-1", follow: false })
        })
        expect(mocks.mutationSetFollow).toHaveBeenCalledWith({
            request: { userId: "user-1", follow: false },
        })
    })

    it("reports a transport failure as an error rather than as a recorded follow", async () => {
        mocks.mutationSetFollow.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useMutateSetFollowSwr())

        await act(async () => {
            await expect(result.current.trigger({ userId: "user-1", follow: true }))
                .rejects.toThrow("offline")
        })
        expect(result.current.error).toBeInstanceOf(Error)
    })
})
