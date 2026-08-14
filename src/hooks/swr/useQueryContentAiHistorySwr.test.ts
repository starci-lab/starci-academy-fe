/** @vitest-environment jsdom */
import { createElement, type PropsWithChildren } from "react"
import { renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import {
    QUERY_CONTENT_AI_HISTORY_SWR_KEY,
    useQueryContentAiHistorySwr,
} from "./useQueryContentAiHistorySwr"

const mocks = vi.hoisted(() => ({ queryContentAiHistory: vi.fn() }))
vi.mock("../../modules/api/graphql/queries/query-content-ai-history", () => ({
    queryContentAiHistory: mocks.queryContentAiHistory,
}))

const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

const payload = { messages: [
    { role: "user", content: "Why abort?" },
    { role: "assistant", content: "It cancels stale requests." },
] }

beforeEach(() => {
    setSessionToken("content-ai-history-token")
    mocks.queryContentAiHistory.mockReset()
    mocks.queryContentAiHistory.mockResolvedValue({
        data: { contentAiSessionMessages: { success: true, message: "ok", data: payload } },
    })
})

describe("useQueryContentAiHistorySwr", () => {
    it("keys by viewer/session and unwraps the oldest-first transcript", async () => {
        expect(QUERY_CONTENT_AI_HISTORY_SWR_KEY).toBe("QUERY_CONTENT_AI_HISTORY_SWR")
        const { result } = renderHook(() => useQueryContentAiHistorySwr("session-1"), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(payload))
        expect(mocks.queryContentAiHistory).toHaveBeenCalledWith({ request: { sessionId: "session-1" } })
    })

    it("stays idle until a session is selected", async () => {
        const { result } = renderHook(() => useQueryContentAiHistorySwr(null), { wrapper })
        expect(result.current.data).toBeUndefined()
        await new Promise((resolve) => setTimeout(resolve, 0))
        expect(mocks.queryContentAiHistory).not.toHaveBeenCalled()
    })

    it("resolves an envelope refusal to null", async () => {
        mocks.queryContentAiHistory.mockResolvedValue({
            data: { contentAiSessionMessages: { success: false, message: "not owned" } },
        })
        const { result } = renderHook(() => useQueryContentAiHistorySwr("session-1"), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })
})
