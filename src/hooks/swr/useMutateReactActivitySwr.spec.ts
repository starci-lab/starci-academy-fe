/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ReactionType } from "@/modules/api/graphql/queries/types/reactions"
import { MUTATE_REACT_ACTIVITY_SWR_KEY, useMutateReactActivitySwr } from "./useMutateReactActivitySwr"

/**
 * What these tests guard: the request travels EXACTLY as the caller wrote it, including the
 * removal - the schema's own comment says a null `type` removes the viewer's reaction, so it is
 * `null` rather than an absent field, and a hook that dropped it would turn "take my reaction back"
 * into "leave it as it was".
 */

const mocks = vi.hoisted(() => ({ mutationReactActivity: vi.fn() }))

vi.mock("../../modules/api/graphql/mutations/mutation-react-activity", () => ({
    mutationReactActivity: mocks.mutationReactActivity,
}))

/** What the transport answers for a recorded reaction. */
const recorded = { data: { reactActivity: { success: true, message: "ok" } } }

beforeEach(() => {
    mocks.mutationReactActivity.mockReset()
    mocks.mutationReactActivity.mockResolvedValue(recorded)
})

describe("MUTATE_REACT_ACTIVITY_SWR_KEY", () => {
    it("is one stable key", () => {
        expect(MUTATE_REACT_ACTIVITY_SWR_KEY).toBe("MUTATE_REACT_ACTIVITY_SWR")
    })
})

describe("useMutateReactActivitySwr", () => {
    it("reacts to nothing until the reader presses", () => {
        const { result } = renderHook(() => useMutateReactActivitySwr())
        expect(mocks.mutationReactActivity).not.toHaveBeenCalled()
        expect(result.current.isMutating).toBe(false)
    })

    it("wraps the trigger argument as the request and hands back the response", async () => {
        const { result } = renderHook(() => useMutateReactActivitySwr())

        const request = { activityId: "activity-1", type: ReactionType.Like }
        await act(async () => {
            await expect(result.current.trigger(request)).resolves.toEqual(recorded)
        })
        expect(mocks.mutationReactActivity).toHaveBeenCalledWith({ request })
    })

    it("carries a cleared reaction through as null rather than dropping the field", async () => {
        const { result } = renderHook(() => useMutateReactActivitySwr())

        await act(async () => {
            await result.current.trigger({ activityId: "activity-1", type: null })
        })
        expect(mocks.mutationReactActivity).toHaveBeenCalledWith({
            request: { activityId: "activity-1", type: null },
        })
    })

    it("reports a transport failure as an error rather than as a recorded reaction", async () => {
        mocks.mutationReactActivity.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useMutateReactActivitySwr())

        await act(async () => {
            await expect(result.current.trigger({ activityId: "activity-1", type: ReactionType.Like }))
                .rejects.toThrow("offline")
        })
        expect(result.current.error).toBeInstanceOf(Error)
    })
})
