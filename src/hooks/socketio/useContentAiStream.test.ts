/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useContentAiStream } from "./useContentAiStream"

const socketHarness = vi.hoisted(() => {
    const handlers = new Map<string, (...args: Array<unknown>) => void>()
    const managerHandlers = new Map<string, (...args: Array<unknown>) => void>()
    const emit = vi.fn()
    const socket = {
        connected: true,
        on: vi.fn((event: string, handler: (...args: Array<unknown>) => void) => {
            handlers.set(event, handler)
            return socket
        }),
        off: vi.fn((event: string) => {
            handlers.delete(event)
            return socket
        }),
        emit,
        disconnect: vi.fn(),
        io: {
            on: vi.fn((event: string, handler: (...args: Array<unknown>) => void) => {
                managerHandlers.set(event, handler)
            }),
            off: vi.fn((event: string) => managerHandlers.delete(event)),
        },
    }
    return { handlers, managerHandlers, emit, socket, io: vi.fn(() => socket) }
})

vi.mock("next-intl", () => ({ useLocale: () => "vi" }))
vi.mock("socket.io-client", () => ({ io: socketHarness.io }))
vi.mock("../auth/useSessionToken", () => ({ useSessionToken: () => "test-token" }))

beforeEach(() => {
    socketHarness.handlers.clear()
    socketHarness.managerHandlers.clear()
    socketHarness.emit.mockClear()
    socketHarness.io.mockClear()
    socketHarness.socket.connected = true
    vi.spyOn(crypto, "randomUUID")
        .mockReturnValueOnce("00000000-0000-4000-8000-000000000001")
        .mockReturnValueOnce("00000000-0000-4000-8000-000000000002")
})

describe("useContentAiStream", () => {
    it("connects to the authenticated namespace and streams only the matching ask", async () => {
        const onDelta = vi.fn()
        const onDone = vi.fn()
        const { result } = renderHook(() => useContentAiStream())
        expect(socketHarness.io).toHaveBeenCalledWith(
            expect.stringContaining("/content_ai"),
            expect.objectContaining({ auth: { token: "test-token" } }),
        )
        act(() => socketHarness.handlers.get("connect")?.())
        await waitFor(() => expect(result.current.state).toBe("connected"))

        act(() => result.current.ask({
            sessionId: "session-1",
            contentId: "content-1",
            question: "Explain lines 14-21",
            history: [],
            onDelta,
            onDone,
        }))
        const ask = socketHarness.emit.mock.calls.find(([event]) => event === "content_ai.ask.publication")
        expect(ask?.[1]).toMatchObject({
            locale: "vi",
            data: { sessionId: "session-1", contentId: "content-1", question: "Explain lines 14-21" },
        })
        const streamId = ask?.[1].data.streamId as string
        act(() => socketHarness.handlers.get("content_ai.chunk.subscription")?.({
            data: { streamId: "another-stream", delta: "ignore", done: false },
        }))
        act(() => socketHarness.handlers.get("content_ai.chunk.subscription")?.({
            data: { streamId, delta: "AbortController cancels stale work.", done: true },
        }))
        expect(onDelta).toHaveBeenCalledOnce()
        expect(onDone).toHaveBeenCalledWith(undefined)
        expect(result.current.isStreaming).toBe(false)
    })

    it("forwards a paid-model quota rejection but does not latch sending closed", () => {
        const firstDone = vi.fn()
        const secondDone = vi.fn()
        const { result } = renderHook(() => useContentAiStream())
        act(() => result.current.ask({
            sessionId: "session-1", question: "First", onDelta: vi.fn(), onDone: firstDone,
        }))
        const firstAsk = socketHarness.emit.mock.calls.find(([event]) => event === "content_ai.ask.publication")
        act(() => socketHarness.handlers.get("content_ai.chunk.subscription")?.({
            data: {
                streamId: firstAsk?.[1].data.streamId,
                delta: "",
                done: true,
                error: "AI_QUOTA_EXHAUSTED_EXCEPTION",
            },
        }))
        expect(firstDone).toHaveBeenCalledWith("AI_QUOTA_EXHAUSTED_EXCEPTION")

        act(() => result.current.ask({
            sessionId: "session-1", question: "Try Auto again", onDelta: vi.fn(), onDone: secondDone,
        }))
        const askCalls = socketHarness.emit.mock.calls.filter(([event]) => event === "content_ai.ask.publication")
        expect(askCalls).toHaveLength(2)
        expect(secondDone).not.toHaveBeenCalled()
        expect(result.current.isStreaming).toBe(true)
    })

    it("aborts the exact active server stream and exposes reconnecting", () => {
        const onDone = vi.fn()
        const { result } = renderHook(() => useContentAiStream())
        act(() => result.current.ask({
            sessionId: "session-1", question: "Stop me", onDelta: vi.fn(), onDone,
        }))
        act(() => result.current.abort())
        expect(socketHarness.emit).toHaveBeenCalledWith(
            "content_ai.abort.publication",
            expect.objectContaining({ locale: "vi" }),
        )
        expect(onDone).toHaveBeenCalledWith("ABORTED")
        expect(result.current.isStreaming).toBe(false)

        act(() => socketHarness.handlers.get("disconnect")?.())
        expect(result.current.state).toBe("reconnecting")
    })
})
