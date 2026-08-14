/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useMutateCreateContentAiSessionSwr } from "./useMutateCreateContentAiSessionSwr"

const mocks = vi.hoisted(() => ({ mutation: vi.fn() }))
vi.mock("../../modules/api/graphql/mutations/mutation-create-content-ai-session", () => ({
    mutationCreateContentAiSession: mocks.mutation,
}))

beforeEach(() => mocks.mutation.mockReset())

describe("useMutateCreateContentAiSessionSwr", () => {
    it("unwraps a created session identity", async () => {
        mocks.mutation.mockResolvedValue({ data: { createContentAiSession: {
            success: true, message: "ok", data: { id: "session-1" },
        } } })
        const { result } = renderHook(() => useMutateCreateContentAiSessionSwr())
        const request = { scope: "content" as const, contentId: "content-1" }
        await act(async () => expect(result.current.trigger(request)).resolves.toEqual({ id: "session-1" }))
        expect(mocks.mutation).toHaveBeenCalledWith({ request })
    })

    it("preserves a successful null id instead of inventing a conversation", async () => {
        mocks.mutation.mockResolvedValue({ data: { createContentAiSession: {
            success: true, message: "no enrollment", data: { id: null },
        } } })
        const { result } = renderHook(() => useMutateCreateContentAiSessionSwr())
        await act(async () => expect(result.current.trigger({ scope: "global" })).resolves.toEqual({ id: null }))
    })

    it("rejects an envelope refusal", async () => {
        mocks.mutation.mockResolvedValue({ data: { createContentAiSession: {
            success: false, message: "not authenticated",
        } } })
        const { result } = renderHook(() => useMutateCreateContentAiSessionSwr())
        await act(async () => expect(result.current.trigger({})).rejects.toThrow("not authenticated"))
    })
})
