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

vi.mock("next-intl", () => ({ useLocale: () => "en" }))
vi.mock("socket.io-client", () => ({ io: () => socketHarness.socket }))
vi.mock("../auth/useSessionToken", () => ({ useSessionToken: () => "test-token" }))

describe("useMockInterviewSocketIo", () => {
    beforeEach(() => {
        socketHarness.handlers.clear()
        socketHarness.managerHandlers.clear()
        socketHarness.emit.mockClear()
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
})
