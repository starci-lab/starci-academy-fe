/** @vitest-environment jsdom */
import { createElement, type PropsWithChildren } from "react"
import { renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import {
    QUERY_CONTENT_AI_SESSIONS_SWR_KEY,
    useQueryContentAiSessionsSwr,
} from "./useQueryContentAiSessionsSwr"

const mocks = vi.hoisted(() => ({ queryContentAiSessions: vi.fn() }))
vi.mock("../../modules/api/graphql/queries/query-content-ai-sessions", () => ({
    queryContentAiSessions: mocks.queryContentAiSessions,
}))

const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

const payload = { sessions: [{
    id: "session-1",
    title: "AbortController",
    updatedAt: "2026-08-15T00:00:00.000Z",
    messageCount: 2,
    scope: "content",
    originContentId: "content-1",
    originContentTitle: "Async patterns",
    snippet: null,
}] }

beforeEach(() => {
    setSessionToken("content-ai-test-token")
    mocks.queryContentAiSessions.mockReset()
    mocks.queryContentAiSessions.mockResolvedValue({
        data: { contentAiSessions: { success: true, message: "ok", data: payload } },
    })
})

describe("useQueryContentAiSessionsSwr", () => {
    it("uses a stable viewer-scoped key and unwraps the list", async () => {
        expect(QUERY_CONTENT_AI_SESSIONS_SWR_KEY).toBe("QUERY_CONTENT_AI_SESSIONS_SWR")
        const request = { scope: "content" as const, contentId: "content-1" }
        const { result } = renderHook(() => useQueryContentAiSessionsSwr(request), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(payload))
        expect(mocks.queryContentAiSessions).toHaveBeenCalledWith({ request })
    })

    it("uses an empty request for global history", async () => {
        const { result } = renderHook(() => useQueryContentAiSessionsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(payload))
        expect(mocks.queryContentAiSessions).toHaveBeenCalledWith({ request: {} })
    })

    it("does not query without an authenticated viewer", async () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryContentAiSessionsSwr(), { wrapper })
        expect(result.current.data).toBeUndefined()
        await new Promise((resolve) => setTimeout(resolve, 0))
        expect(mocks.queryContentAiSessions).not.toHaveBeenCalled()
    })

    it("keeps transport failures as errors instead of empty history", async () => {
        mocks.queryContentAiSessions.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryContentAiSessionsSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })
})
