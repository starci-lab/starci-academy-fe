/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
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

/** Who the hook thinks is signed in. Mutable, because "nobody" is one of the states under test. */
const session = vi.hoisted(() => ({ token: undefined as string | undefined }))

vi.mock("next-intl", () => ({ useLocale: () => "vi" }))
vi.mock("socket.io-client", () => ({ io: socketHarness.io }))
vi.mock("../auth/useSessionToken", () => ({ useSessionToken: () => session.token }))

beforeEach(() => {
    session.token = "test-token"
    socketHarness.handlers.clear()
    socketHarness.managerHandlers.clear()
    socketHarness.emit.mockClear()
    socketHarness.io.mockClear()
    socketHarness.socket.disconnect.mockClear()
    socketHarness.socket.connected = true
    vi.spyOn(crypto, "randomUUID")
        .mockReturnValueOnce("00000000-0000-4000-8000-000000000001")
        .mockReturnValueOnce("00000000-0000-4000-8000-000000000002")
})

afterEach(() => {
    // The stream id spy is per-test; leaving it in place would queue answers across tests.
    vi.restoreAllMocks()
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

    it("sends the advisor experience and forwards validated terminal fit metadata", () => {
        const onDone = vi.fn()
        const { result } = renderHook(() => useContentAiStream())
        act(() => result.current.ask({
            sessionId: "session-1",
            question: "Which fullstack course fits?",
            experience: "course_advisor",
            onDelta: vi.fn(),
            onDone,
        }))
        const ask = socketHarness.emit.mock.calls.find(([event]) => event === "content_ai.ask.publication")
        expect(ask?.[1].data.experience).toBe("course_advisor")
        const courseAdvisor = {
            intent: "recommend",
            recommendations: [{ courseDisplayId: "fullstack-mastery", reason: "Matches the goal", confidence: "high" }],
        }
        act(() => socketHarness.handlers.get("content_ai.chunk.subscription")?.({
            data: { streamId: ask?.[1].data.streamId, delta: "", done: true, courseAdvisor },
        }))
        expect(onDone).toHaveBeenCalledWith(undefined, courseAdvisor)
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

    it("opens no socket at all while nobody is signed in", () => {
        session.token = undefined
        const { result } = renderHook(() => useContentAiStream())
        expect(socketHarness.io).not.toHaveBeenCalled()
        expect(result.current.state).toBe("idle")
        expect(result.current.isConnected).toBe(false)
    })

    it("answers an ask with no socket immediately, rather than leaving the reader waiting", () => {
        session.token = undefined
        const onDone = vi.fn()
        const { result } = renderHook(() => useContentAiStream())

        act(() => result.current.ask({ sessionId: "session-1", question: "Hello", onDelta: vi.fn(), onDone }))
        expect(onDone).toHaveBeenCalledWith("SOCKET_DISCONNECTED")
        expect(socketHarness.emit).not.toHaveBeenCalled()
        expect(result.current.isStreaming).toBe(false)
    })

    it("answers an ask on a socket that is not connected the same way", () => {
        socketHarness.socket.connected = false
        const onDone = vi.fn()
        const { result } = renderHook(() => useContentAiStream())

        act(() => result.current.ask({ sessionId: "session-1", question: "Hello", onDelta: vi.fn(), onDone }))
        expect(onDone).toHaveBeenCalledWith("SOCKET_DISCONNECTED")
        expect(socketHarness.emit).not.toHaveBeenCalled()
    })

    it("aborts the stream still running when a second ask arrives", () => {
        const firstDone = vi.fn()
        const secondDone = vi.fn()
        const { result } = renderHook(() => useContentAiStream())

        act(() => result.current.ask({
            sessionId: "session-1", question: "First", onDelta: vi.fn(), onDone: firstDone,
        }))
        const firstStreamId = socketHarness.emit.mock.calls
            .find(([event]) => event === "content_ai.ask.publication")?.[1].data.streamId as string

        act(() => result.current.ask({
            sessionId: "session-1", question: "Second", onDelta: vi.fn(), onDone: secondDone,
        }))
        // The server is told to stop the exact stream that is being replaced, and the reader who
        // was waiting on it is told why rather than left with a half-written answer.
        expect(socketHarness.emit).toHaveBeenCalledWith(
            "content_ai.abort.publication",
            { locale: "vi", data: { streamId: firstStreamId } },
        )
        expect(firstDone).toHaveBeenCalledWith("ABORTED")
        expect(secondDone).not.toHaveBeenCalled()
        expect(result.current.isStreaming).toBe(true)
    })

    it("keeps streaming while chunks are still arriving", () => {
        const onDelta = vi.fn()
        const onDone = vi.fn()
        const { result } = renderHook(() => useContentAiStream())

        act(() => result.current.ask({
            sessionId: "session-1", question: "Explain", onDelta, onDone,
        }))
        const streamId = socketHarness.emit.mock.calls
            .find(([event]) => event === "content_ai.ask.publication")?.[1].data.streamId as string

        act(() => socketHarness.handlers.get("content_ai.chunk.subscription")?.({
            data: { streamId, delta: "Abort", done: false },
        }))
        expect(onDelta).toHaveBeenCalledWith("Abort")
        expect(onDone).not.toHaveBeenCalled()
        expect(result.current.isStreaming).toBe(true)
    })

    it("ignores a chunk that carries no payload", () => {
        const onDelta = vi.fn()
        const onDone = vi.fn()
        const { result } = renderHook(() => useContentAiStream())

        act(() => result.current.ask({
            sessionId: "session-1", question: "Explain", onDelta, onDone,
        }))
        act(() => socketHarness.handlers.get("content_ai.chunk.subscription")?.({}))
        expect(onDelta).not.toHaveBeenCalled()
        expect(onDone).not.toHaveBeenCalled()
        expect(result.current.isStreaming).toBe(true)
    })

    it("ignores a chunk that arrives when nothing is being asked", () => {
        const { result } = renderHook(() => useContentAiStream())
        act(() => socketHarness.handlers.get("content_ai.chunk.subscription")?.({
            data: { streamId: "orphan", delta: "stray", done: true },
        }))
        expect(result.current.isStreaming).toBe(false)
    })

    it("aborting with nothing running tells the server nothing", () => {
        const { result } = renderHook(() => useContentAiStream())
        act(() => result.current.abort())
        expect(socketHarness.emit).not.toHaveBeenCalled()
        expect(result.current.isStreaming).toBe(false)
    })

    it("ends the stream and closes the socket when the surface goes away", () => {
        const onDone = vi.fn()
        const { result, unmount } = renderHook(() => useContentAiStream())

        act(() => result.current.ask({
            sessionId: "session-1", question: "Explain", onDelta: vi.fn(), onDone,
        }))
        unmount()
        expect(onDone).toHaveBeenCalledWith("SOCKET_DISCONNECTED")
        expect(socketHarness.socket.disconnect).toHaveBeenCalled()
    })

    it("reports the manager's own reconnection lifecycle", async () => {
        const { result } = renderHook(() => useContentAiStream())

        act(() => socketHarness.handlers.get("connect_error")?.())
        await waitFor(() => expect(result.current.state).toBe("reconnecting"))

        act(() => socketHarness.handlers.get("connect")?.())
        await waitFor(() => expect(result.current.isConnected).toBe(true))

        act(() => socketHarness.managerHandlers.get("reconnect_attempt")?.())
        await waitFor(() => expect(result.current.state).toBe("reconnecting"))

        act(() => socketHarness.managerHandlers.get("reconnect_failed")?.())
        await waitFor(() => expect(result.current.state).toBe("failed"))
        expect(result.current.isConnected).toBe(false)
    })
})
