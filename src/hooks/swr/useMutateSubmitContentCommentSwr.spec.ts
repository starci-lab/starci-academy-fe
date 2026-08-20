/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    MUTATE_SUBMIT_CONTENT_COMMENT_SWR_KEY,
    useMutateSubmitContentCommentSwr,
} from "./useMutateSubmitContentCommentSwr"

/**
 * What these tests guard: the PARENT decides whether this is a comment or a reply, and it reaches
 * the wire either way - a hook that dropped it would post every reply as a new top-level comment,
 * which is the kind of mistake a reader only notices after they have sent it.
 */

const mocks = vi.hoisted(() => ({ mutationSubmitContentComment: vi.fn() }))

vi.mock("@/modules/api/graphql/mutations/mutation-submit-content-comment", () => ({
    mutationSubmitContentComment: mocks.mutationSubmitContentComment,
}))

/** What the transport answers for an accepted comment. */
const created = {
    data: { createComment: { success: true, message: "ok", data: { id: "comment-9", body: "Useful" } } },
}

beforeEach(() => {
    mocks.mutationSubmitContentComment.mockReset()
    mocks.mutationSubmitContentComment.mockResolvedValue(created)
})

describe("MUTATE_SUBMIT_CONTENT_COMMENT_SWR_KEY", () => {
    it("is one stable key", () => {
        expect(MUTATE_SUBMIT_CONTENT_COMMENT_SWR_KEY).toBe("MUTATE_SUBMIT_CONTENT_COMMENT_SWR")
    })
})

describe("useMutateSubmitContentCommentSwr", () => {
    it("posts nothing until the reader presses", () => {
        const { result } = renderHook(() => useMutateSubmitContentCommentSwr())
        expect(mocks.mutationSubmitContentComment).not.toHaveBeenCalled()
        expect(result.current.isMutating).toBe(false)
    })

    it("posts a top-level comment with no parent", async () => {
        const { result } = renderHook(() => useMutateSubmitContentCommentSwr())

        const request = { contentId: "content-1", body: "Useful" }
        await act(async () => {
            await expect(result.current.trigger(request)).resolves.toEqual(created)
        })
        expect(mocks.mutationSubmitContentComment).toHaveBeenCalledWith({ request })
    })

    it("carries the parent through, so a reply lands in its own thread", async () => {
        const { result } = renderHook(() => useMutateSubmitContentCommentSwr())

        await act(async () => {
            await result.current.trigger({
                contentId: "content-1", parentCommentId: "comment-1", body: "Agreed",
            })
        })
        expect(mocks.mutationSubmitContentComment).toHaveBeenCalledWith({
            request: { contentId: "content-1", parentCommentId: "comment-1", body: "Agreed" },
        })
    })

    it("reports a transport failure as an error rather than as a posted comment", async () => {
        mocks.mutationSubmitContentComment.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useMutateSubmitContentCommentSwr())

        await act(async () => {
            await expect(result.current.trigger({ contentId: "content-1", body: "Useful" }))
                .rejects.toThrow("offline")
        })
        expect(result.current.error).toBeInstanceOf(Error)
    })
})
