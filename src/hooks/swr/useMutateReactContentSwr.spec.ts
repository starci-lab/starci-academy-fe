/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ReactionType } from "@/modules/api/graphql/queries/types/reactions"
import { MUTATE_REACT_CONTENT_SWR_KEY, useMutateReactContentSwr } from "./useMutateReactContentSwr"

/**
 * What these tests guard: the request travels exactly as written, including the removal - the
 * schema takes a null `type` to mean "take my reaction back", so a hook that dropped the field
 * would turn an undo into a no-op the reader would keep pressing.
 */

const mocks = vi.hoisted(() => ({ mutationReactContent: vi.fn() }))

vi.mock("@/modules/api/graphql/mutations/mutation-react-content", () => ({
    mutationReactContent: mocks.mutationReactContent,
}))

/** What the transport answers for a recorded reaction. */
const recorded = {
    data: { reactToContent: { success: true, message: "ok", data: { total: 3, myReaction: "like" } } },
}

beforeEach(() => {
    mocks.mutationReactContent.mockReset()
    mocks.mutationReactContent.mockResolvedValue(recorded)
})

describe("MUTATE_REACT_CONTENT_SWR_KEY", () => {
    it("is one stable key", () => {
        expect(MUTATE_REACT_CONTENT_SWR_KEY).toBe("MUTATE_REACT_CONTENT_SWR")
    })
})

describe("useMutateReactContentSwr", () => {
    it("reacts to nothing until the reader presses", () => {
        const { result } = renderHook(() => useMutateReactContentSwr())
        expect(mocks.mutationReactContent).not.toHaveBeenCalled()
        expect(result.current.isMutating).toBe(false)
    })

    it("wraps the trigger argument as the request and hands back the refreshed summary", async () => {
        const { result } = renderHook(() => useMutateReactContentSwr())

        const request = { contentId: "content-1", type: ReactionType.Love }
        await act(async () => {
            await expect(result.current.trigger(request)).resolves.toEqual(recorded)
        })
        expect(mocks.mutationReactContent).toHaveBeenCalledWith({ request })
    })

    it("carries a cleared reaction through as null rather than dropping the field", async () => {
        const { result } = renderHook(() => useMutateReactContentSwr())

        await act(async () => {
            await result.current.trigger({ contentId: "content-1", type: null })
        })
        expect(mocks.mutationReactContent).toHaveBeenCalledWith({
            request: { contentId: "content-1", type: null },
        })
    })

    it("reports a transport failure as an error rather than as a recorded reaction", async () => {
        mocks.mutationReactContent.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useMutateReactContentSwr())

        await act(async () => {
            await expect(result.current.trigger({ contentId: "content-1", type: ReactionType.Love }))
                .rejects.toThrow("offline")
        })
        expect(result.current.error).toBeInstanceOf(Error)
    })
})
