import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useMockInterviewSocketIo } from "./useMockInterviewSocketIo"

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
    return { handlers, managerHandlers, emit, socket }
})

/** Who the hook thinks is signed in. Mutable, because "nobody" is one of the states under test. */
const session = vi.hoisted(() => ({ token: undefined as string | undefined }))

/** The io factory, so a test can prove no socket is opened at all. */
const connect = vi.hoisted(() => vi.fn())

vi.mock("next-intl", () => ({ useLocale: () => "en" }))
vi.mock("socket.io-client", () => ({ io: connect }))
vi.mock("../auth/useSessionToken", () => ({ useSessionToken: () => session.token }))

/** One turn's worth of parameters, with the callbacks a test wants to watch. */
const turn = (onDelta: () => void, onDone: (error?: string) => void) => ({
    sessionId: "session-1",
    courseId: "course-1",
    promptId: "prompt-1",
    promptTitle: "Distributed cache",
    phase: "requirements",
    history: [],
    latestAnswer: "",
    onDelta,
    onDone,
})

describe("useMockInterviewSocketIo", () => {
    beforeEach(() => {
        session.token = "test-token"
        connect.mockReset().mockReturnValue(socketHarness.socket)
        socketHarness.handlers.clear()
        socketHarness.managerHandlers.clear()
        socketHarness.emit.mockClear()
        socketHarness.socket.disconnect.mockClear()
        socketHarness.socket.connected = true
    })

    it("streams only the matching interview turn and completes it", async () => {
        const onDelta = vi.fn()
        const onDone = vi.fn()
        const { result } = renderHook(() => useMockInterviewSocketIo())

        act(() => socketHarness.handlers.get("connect")?.())
        await waitFor(() => expect(result.current.state).toBe("connected"))

        act(() => result.current.ask({
            sessionId: "session-1",
            courseId: "course-1",
            promptId: "prompt-1",
            promptTitle: "Distributed cache",
            phase: "requirements",
            history: [],
            latestAnswer: "",
            onDelta,
            onDone,
        }))

        const askCall = socketHarness.emit.mock.calls.find(([event]) => event === "mock_interview.ask.publication")
        const streamId = askCall?.[1].data.streamId as string
        act(() => socketHarness.handlers.get("mock_interview.chunk.subscription")?.({
            data: { streamId, delta: "What scale?", done: true },
        }))

        expect(onDelta).toHaveBeenCalledWith("What scale?")
        expect(onDone).toHaveBeenCalledWith(undefined)
        expect(result.current.isStreaming).toBe(false)
    })

    it("reports reconnecting and aborts the active server stream", () => {
        const onDone = vi.fn()
        const { result } = renderHook(() => useMockInterviewSocketIo())

        act(() => result.current.ask({
            sessionId: "session-1",
            courseId: "course-1",
            promptId: "prompt-1",
            promptTitle: "Distributed cache",
            phase: "requirements",
            history: [],
            latestAnswer: "",
            onDelta: vi.fn(),
            onDone,
        }))
        act(() => result.current.abort())
        act(() => socketHarness.handlers.get("disconnect")?.())

        expect(socketHarness.emit).toHaveBeenCalledWith(
            "mock_interview.abort.publication",
            expect.objectContaining({ locale: "en" }),
        )
        expect(onDone).toHaveBeenCalledWith("ABORTED")
        expect(result.current.state).toBe("reconnecting")
    })

    it("opens no socket at all while nobody is signed in", () => {
        session.token = undefined
        const { result } = renderHook(() => useMockInterviewSocketIo())
        expect(connect).not.toHaveBeenCalled()
        expect(result.current.state).toBe("idle")
        expect(result.current.isConnected).toBe(false)
    })

    it("answers an ask with no socket immediately, rather than leaving the reader waiting", () => {
        session.token = undefined
        const onDone = vi.fn()
        const { result } = renderHook(() => useMockInterviewSocketIo())

        act(() => result.current.ask(turn(vi.fn(), onDone)))
        expect(onDone).toHaveBeenCalledWith("SOCKET_DISCONNECTED")
        expect(socketHarness.emit).not.toHaveBeenCalled()
        expect(result.current.isStreaming).toBe(false)
    })

    it("answers an ask on a socket that is not connected the same way", () => {
        socketHarness.socket.connected = false
        const onDone = vi.fn()
        const { result } = renderHook(() => useMockInterviewSocketIo())

        act(() => result.current.ask(turn(vi.fn(), onDone)))
        expect(onDone).toHaveBeenCalledWith("SOCKET_DISCONNECTED")
        expect(socketHarness.emit).not.toHaveBeenCalled()
    })

    it("ends the turn still running when a second ask arrives", () => {
        const firstDone = vi.fn()
        const secondDone = vi.fn()
        const { result } = renderHook(() => useMockInterviewSocketIo())

        act(() => result.current.ask(turn(vi.fn(), firstDone)))
        act(() => result.current.ask(turn(vi.fn(), secondDone)))
        expect(firstDone).toHaveBeenCalledWith("ABORTED")
        expect(secondDone).not.toHaveBeenCalled()
        expect(result.current.isStreaming).toBe(true)
    })

    it("keeps streaming while chunks are still arriving, and ignores an empty delta", () => {
        const onDelta = vi.fn()
        const onDone = vi.fn()
        const { result } = renderHook(() => useMockInterviewSocketIo())

        act(() => result.current.ask(turn(onDelta, onDone)))
        const streamId = socketHarness.emit.mock.calls
            .find(([event]) => event === "mock_interview.ask.publication")?.[1].data.streamId as string

        act(() => socketHarness.handlers.get("mock_interview.chunk.subscription")?.({
            data: { streamId, done: false },
        }))
        act(() => socketHarness.handlers.get("mock_interview.chunk.subscription")?.({
            data: { streamId, delta: "", done: false },
        }))
        expect(onDelta).not.toHaveBeenCalled()

        act(() => socketHarness.handlers.get("mock_interview.chunk.subscription")?.({
            data: { streamId, delta: "What scale?", done: false },
        }))
        expect(onDelta).toHaveBeenCalledWith("What scale?")
        expect(onDone).not.toHaveBeenCalled()
        expect(result.current.isStreaming).toBe(true)
    })

    it("ignores a chunk that belongs to no turn this surface is holding", () => {
        const { result } = renderHook(() => useMockInterviewSocketIo())
        act(() => socketHarness.handlers.get("mock_interview.chunk.subscription")?.({
            data: { streamId: "orphan", delta: "stray", done: true },
        }))
        expect(result.current.isStreaming).toBe(false)
    })

    it("aborting with nothing running tells the server nothing", () => {
        const { result } = renderHook(() => useMockInterviewSocketIo())
        act(() => result.current.abort())
        expect(socketHarness.emit).not.toHaveBeenCalled()
        expect(result.current.isStreaming).toBe(false)
    })

    it("ends an unfinished turn and closes the socket when the surface goes away", () => {
        const onDone = vi.fn()
        const { result, unmount } = renderHook(() => useMockInterviewSocketIo())

        act(() => result.current.ask(turn(vi.fn(), onDone)))
        unmount()
        expect(onDone).toHaveBeenCalledWith("SOCKET_DISCONNECTED")
        expect(socketHarness.socket.disconnect).toHaveBeenCalledTimes(1)
    })

    it("reports the manager's own reconnection lifecycle", async () => {
        const { result } = renderHook(() => useMockInterviewSocketIo())

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
