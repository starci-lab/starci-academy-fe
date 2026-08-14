/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useMutateDeleteContentAiSessionSwr } from "./useMutateDeleteContentAiSessionSwr"

const mocks = vi.hoisted(() => ({ mutation: vi.fn() }))
vi.mock("../../modules/api/graphql/mutations/mutation-delete-content-ai-session", () => ({
    mutationDeleteContentAiSession: mocks.mutation,
}))

beforeEach(() => mocks.mutation.mockReset())

describe("useMutateDeleteContentAiSessionSwr", () => {
    it("unwraps the permanent deletion result", async () => {
        mocks.mutation.mockResolvedValue({ data: { deleteContentAiSession: {
            success: true, message: "ok", data: { cleared: true },
        } } })
        const { result } = renderHook(() => useMutateDeleteContentAiSessionSwr())
        const request = { sessionId: "session-1" }
        await act(async () => expect(result.current.trigger(request)).resolves.toEqual({ cleared: true }))
        expect(mocks.mutation).toHaveBeenCalledWith({ request })
    })

    it("rejects an envelope refusal", async () => {
        mocks.mutation.mockResolvedValue({ data: { deleteContentAiSession: {
            success: false, message: "not owned",
        } } })
        const { result } = renderHook(() => useMutateDeleteContentAiSessionSwr())
        await act(async () => expect(result.current.trigger({ sessionId: "session-1" }))
            .rejects.toThrow("not owned"))
    })
})
