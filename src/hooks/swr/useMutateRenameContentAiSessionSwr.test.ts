/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useMutateRenameContentAiSessionSwr } from "./useMutateRenameContentAiSessionSwr"

const mocks = vi.hoisted(() => ({ mutation: vi.fn() }))
vi.mock("../../modules/api/graphql/mutations/mutation-rename-content-ai-session", () => ({
    mutationRenameContentAiSession: mocks.mutation,
}))

beforeEach(() => mocks.mutation.mockReset())

describe("useMutateRenameContentAiSessionSwr", () => {
    it("unwraps the backend rename result", async () => {
        mocks.mutation.mockResolvedValue({ data: { renameContentAiSession: {
            success: true, message: "ok", data: { renamed: true },
        } } })
        const { result } = renderHook(() => useMutateRenameContentAiSessionSwr())
        const request = { sessionId: "session-1", title: "Async cleanup" }
        await act(async () => expect(result.current.trigger(request)).resolves.toEqual({ renamed: true }))
        expect(mocks.mutation).toHaveBeenCalledWith({ request })
    })

    it("rejects a title-length refusal", async () => {
        mocks.mutation.mockResolvedValue({ data: { renameContentAiSession: {
            success: false, message: "title too long",
        } } })
        const { result } = renderHook(() => useMutateRenameContentAiSessionSwr())
        await act(async () => expect(result.current.trigger({
            sessionId: "session-1", title: "x",
        })).rejects.toThrow("title too long"))
    })
})
