/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useMutateTouchContentAiSessionSwr } from "./useMutateTouchContentAiSessionSwr"

const mocks = vi.hoisted(() => ({ mutation: vi.fn() }))
vi.mock("../../modules/api/graphql/mutations/mutation-touch-content-ai-session", () => ({
    mutationTouchContentAiSession: mocks.mutation,
}))

beforeEach(() => mocks.mutation.mockReset())

describe("useMutateTouchContentAiSessionSwr", () => {
    it("unwraps the recency update", async () => {
        mocks.mutation.mockResolvedValue({ data: { touchContentAiSession: {
            success: true, message: "ok", data: { touched: true },
        } } })
        const { result } = renderHook(() => useMutateTouchContentAiSessionSwr())
        const request = { sessionId: "session-1" }
        await act(async () => expect(result.current.trigger(request)).resolves.toEqual({ touched: true }))
        expect(mocks.mutation).toHaveBeenCalledWith({ request })
    })

    it("rejects a missing payload", async () => {
        mocks.mutation.mockResolvedValue({ data: { touchContentAiSession: {
            success: true, message: "missing",
        } } })
        const { result } = renderHook(() => useMutateTouchContentAiSessionSwr())
        await act(async () => expect(result.current.trigger({ sessionId: "session-1" }))
            .rejects.toThrow("missing"))
    })

    it("speaks for a server that refused without saying why", async () => {
        mocks.mutation.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useMutateTouchContentAiSessionSwr())
        await act(async () => expect(result.current.trigger({ sessionId: "session-1" }))
            .rejects.toThrow("Content-AI conversation recency could not be updated."))
    })
})
