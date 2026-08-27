/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useJobVerdictSocketIo, type JobVerdict } from "./useJobVerdictSocketIo"

/**
 * What these tests guard: the two things a judging subscription gets wrong silently.
 *
 * THE FILTER. One socket carries every job this viewer owns, so a verdict for somebody else's
 * submission arriving on this page must be dropped. Without that, a page waiting on job A reports
 * job B's result - and the reader has no way to tell.
 *
 * THE RESTING STATE. `undefined` as the job is not "wait for one", it is "there is nothing to wait
 * for", and it must open no socket at all. Judging carries on server-side while the client is
 * deaf, so losing the connection is a state and never an error: the verdict already received stays
 * where it is.
 */

const socketHarness = vi.hoisted(() => {
    const handlers = new Map<string, (...args: Array<unknown>) => void>()
    const socket = {
        on: vi.fn((event: string, handler: (...args: Array<unknown>) => void) => {
            handlers.set(event, handler)
            return socket
        }),
        off: vi.fn((event: string) => {
            handlers.delete(event)
            return socket
        }),
        emit: vi.fn(),
        disconnect: vi.fn(),
    }
    return { handlers, socket, io: vi.fn(() => socket) }
})

/** Who the hook thinks is signed in. Mutable, because "nobody" is one of the states under test. */
const session = vi.hoisted(() => ({ token: undefined as string | undefined }))

vi.mock("socket.io-client", () => ({ io: socketHarness.io }))
vi.mock("../auth/useSessionToken", () => ({ useSessionToken: () => session.token }))

/** Which job a rerendering test is subscribed to. */
interface JobProps {
    /** The job to watch, or `undefined` for the resting state. */
    jobId?: string
}

/** A verdict as the API publishes it. */
const verdictFor = (jobId: string): JobVerdict => ({
    jobId,
    verdict: "ACCEPTED",
    passedTestcases: 12,
    totalTestcases: 12,
})

beforeEach(() => {
    session.token = "test-token"
    socketHarness.handlers.clear()
    socketHarness.socket.on.mockClear()
    socketHarness.socket.off.mockClear()
    socketHarness.socket.emit.mockClear()
    socketHarness.socket.disconnect.mockClear()
    socketHarness.io.mockClear()
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com")
})

afterEach(() => {
    vi.unstubAllEnvs()
})

describe("useJobVerdictSocketIo", () => {
    it("subscribes to nothing before the first submission", () => {
        const { result } = renderHook(() => useJobVerdictSocketIo())
        expect(socketHarness.io).not.toHaveBeenCalled()
        expect(result.current.verdict).toBeUndefined()
        expect(result.current.isConnected).toBe(false)
    })

    it("subscribes to nothing while nobody is signed in", () => {
        session.token = undefined
        const { result } = renderHook(() => useJobVerdictSocketIo("job-1"))
        expect(socketHarness.io).not.toHaveBeenCalled()
        expect(result.current.isConnected).toBe(false)
    })

    it("opens the notifications namespace on the configured API with the viewer's token", () => {
        renderHook(() => useJobVerdictSocketIo("job-1"))
        expect(socketHarness.io).toHaveBeenCalledWith(
            "https://api.example.com/job_notifications",
            expect.objectContaining({ auth: { token: "test-token" }, transports: ["websocket"] }),
        )
    })

    it("falls back to the local API when none is configured", () => {
        vi.stubEnv("NEXT_PUBLIC_API_URL", undefined)
        renderHook(() => useJobVerdictSocketIo("job-1"))
        expect(socketHarness.io).toHaveBeenCalledWith(
            "http://localhost:3001/job_notifications",
            expect.anything(),
        )
    })

    it("reports the verdict for the job this page is waiting on", () => {
        const { result } = renderHook(() => useJobVerdictSocketIo("job-1"))
        act(() => socketHarness.handlers.get("connect")?.())
        expect(result.current.isConnected).toBe(true)
        expect(result.current.connectionState).toBe("connected")
        expect(socketHarness.socket.emit).toHaveBeenCalledWith(
            "job_notifications.subscribe_job_notification.publication",
            { data: { jobId: "job-1" }, locale: "en" },
        )

        act(() => socketHarness.handlers.get("job_notifications.job_status_updated.subscription")?.({
            data: verdictFor("job-1"),
        }))
        expect(result.current.verdict).toEqual(verdictFor("job-1"))
    })

    it("drops a verdict belonging to another submission on the same socket", () => {
        const { result } = renderHook(() => useJobVerdictSocketIo("job-1"))
        act(() => socketHarness.handlers.get("job_notifications.job_status_updated.subscription")?.({
            data: verdictFor("job-2"),
        }))
        expect(result.current.verdict).toBeUndefined()
    })

    it("treats a lost connection as a state, keeping the verdict already received", () => {
        const { result } = renderHook(() => useJobVerdictSocketIo("job-1"))
        act(() => socketHarness.handlers.get("connect")?.())
        act(() => socketHarness.handlers.get("job_notifications.job_status_updated.subscription")?.({
            data: verdictFor("job-1"),
        }))

        act(() => socketHarness.handlers.get("disconnect")?.())
        expect(result.current.isConnected).toBe(false)
        expect(result.current.connectionState).toBe("disconnected")
        // Judging carries on server-side while the client is deaf, so what was heard stands.
        expect(result.current.verdict).toEqual(verdictFor("job-1"))
    })

    it("closes the old subscription and opens a new one when a second job is submitted", () => {
        const { rerender, result } = renderHook(
            ({ jobId }: JobProps) => useJobVerdictSocketIo(jobId),
            { initialProps: { jobId: "job-1" } as JobProps },
        )
        act(() => socketHarness.handlers.get("connect")?.())
        expect(result.current.isConnected).toBe(true)

        rerender({ jobId: "job-2" })
        expect(socketHarness.socket.disconnect).toHaveBeenCalledTimes(1)
        expect(socketHarness.io).toHaveBeenCalledTimes(2)
        expect(result.current.isConnected).toBe(false)
    })

    it("stops listening and closes the socket when the page goes away", () => {
        const { unmount } = renderHook(() => useJobVerdictSocketIo("job-1"))
        unmount()
        expect(socketHarness.socket.off).toHaveBeenCalledWith(
            "job_notifications.job_status_updated.subscription",
            expect.any(Function),
        )
        expect(socketHarness.socket.disconnect).toHaveBeenCalledTimes(1)
    })

    it("rejoins the same job room after reconnecting", () => {
        renderHook(() => useJobVerdictSocketIo("job-1"))
        act(() => socketHarness.handlers.get("connect")?.())
        act(() => socketHarness.handlers.get("disconnect")?.())
        act(() => socketHarness.handlers.get("connect")?.())

        expect(socketHarness.socket.emit).toHaveBeenCalledTimes(2)
        expect(socketHarness.socket.emit).toHaveBeenLastCalledWith(
            "job_notifications.subscribe_job_notification.publication",
            { data: { jobId: "job-1" }, locale: "en" },
        )
    })
})
