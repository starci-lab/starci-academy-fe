/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useMutateSetContentAiSessionArchivedSwr } from "./useMutateSetContentAiSessionArchivedSwr"

const mocks = vi.hoisted(() => ({ mutation: vi.fn() }))
vi.mock("../../modules/api/graphql/mutations/mutation-set-content-ai-session-archived", () => ({
    mutationSetContentAiSessionArchived: mocks.mutation,
}))

beforeEach(() => mocks.mutation.mockReset())

describe("useMutateSetContentAiSessionArchivedSwr", () => {
    it("returns the resulting reversible archive state", async () => {
        mocks.mutation.mockResolvedValue({ data: { setContentAiSessionArchived: {
            success: true, message: "ok", data: { archived: true },
        } } })
        const { result } = renderHook(() => useMutateSetContentAiSessionArchivedSwr())
        const request = { sessionId: "session-1", archived: true }
        await act(async () => expect(result.current.trigger(request)).resolves.toEqual({ archived: true }))
        expect(mocks.mutation).toHaveBeenCalledWith({ request })
    })

    it("rejects an ownership refusal", async () => {
        mocks.mutation.mockResolvedValue({ data: { setContentAiSessionArchived: {
            success: false, message: "not owned",
        } } })
        const { result } = renderHook(() => useMutateSetContentAiSessionArchivedSwr())
        await act(async () => expect(result.current.trigger({
            sessionId: "session-1", archived: false,
        })).rejects.toThrow("not owned"))
    })

    it("speaks for a server that refused without saying why", async () => {
        mocks.mutation.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useMutateSetContentAiSessionArchivedSwr())
        await act(async () => expect(result.current.trigger({
            sessionId: "session-1", archived: false,
        })).rejects.toThrow("Content-AI archive state could not be changed."))
    })
})
