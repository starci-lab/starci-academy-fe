import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const relay = vi.hoisted(() => {
    const handlers = new Map<string, (payload?: unknown) => void>()
    const socket = {
        connected: true,
        on: vi.fn((event: string, handler: (payload?: unknown) => void) => { handlers.set(event, handler) }),
        off: vi.fn(),
        emit: vi.fn(),
        disconnect: vi.fn(),
    }
    return { handlers, socket, io: vi.fn(() => socket) }
})

/** Who the hook thinks is signed in. Mutable, because "nobody" is one of the states under test. */
const session = vi.hoisted(() => ({ token: undefined as string | undefined }))

vi.mock("socket.io-client", () => ({ io: relay.io }))
vi.mock("@/hooks/auth/useSessionToken", () => ({ useSessionToken: () => session.token }))

import { usePlaygroundSocketIo } from "./usePlaygroundSocketIo"

describe("usePlaygroundSocketIo", () => {
    beforeEach(() => {
        session.token = "test-session-token"
        relay.handlers.clear()
        relay.socket.on.mockClear()
        relay.socket.off.mockClear()
        relay.socket.emit.mockClear()
        relay.socket.disconnect.mockClear()
        relay.io.mockClear()
    })

    it("authenticates the browser relay and advances progress only from step:verified", () => {
        const hook = renderHook(() => usePlaygroundSocketIo())
        expect(relay.io).toHaveBeenCalledWith(expect.stringContaining("/playground_byom"), expect.objectContaining({ auth: { token: "test-session-token" } }))

        act(() => relay.handlers.get("connect")?.())
        act(() => hook.result.current.subscribe("session-1"))
        act(() => hook.result.current.verify())

        expect(relay.socket.emit).toHaveBeenCalledWith("browser:subscribe", { sessionId: "session-1" })
        expect(relay.socket.emit).toHaveBeenCalledWith("verify:now", { sessionId: "session-1" })
        expect(hook.result.current.passedStepIndexes).toEqual([])

        act(() => relay.handlers.get("step:verified")?.({ data: { stepIndex: 0 } }))

        expect(hook.result.current.verifiedStepIndex).toBe(0)
        expect(hook.result.current.passedStepIndexes).toEqual([0])
    })

    it("opens no relay at all while nobody is signed in", () => {
        session.token = undefined
        const hook = renderHook(() => usePlaygroundSocketIo())
        expect(relay.io).not.toHaveBeenCalled()
        expect(hook.result.current.state).toBe("idle")
    })

    it("re-subscribes to the session it was already watching when the relay comes back", () => {
        const hook = renderHook(() => usePlaygroundSocketIo())
        act(() => hook.result.current.subscribe("session-1"))
        relay.socket.emit.mockClear()

        act(() => relay.handlers.get("connect")?.())
        // Setup navigates into the live route while the relay reconnects; without this the agent
        // would be verifying a session nobody is listening to.
        expect(relay.socket.emit).toHaveBeenCalledWith("browser:subscribe", { sessionId: "session-1" })
        expect(hook.result.current.state).toBe("connected")
    })

    it("verifies nothing before a session has been subscribed to", () => {
        const hook = renderHook(() => usePlaygroundSocketIo())
        act(() => relay.handlers.get("connect")?.())
        relay.socket.emit.mockClear()

        act(() => hook.result.current.verify())
        expect(relay.socket.emit).not.toHaveBeenCalled()
    })

    it("drops the agent when the relay goes, and reports reconnecting rather than failed", () => {
        const hook = renderHook(() => usePlaygroundSocketIo())
        act(() => relay.handlers.get("connect")?.())
        act(() => relay.handlers.get("agent:connected")?.({}))
        expect(hook.result.current.agentConnected).toBe(true)

        act(() => relay.handlers.get("disconnect")?.())
        expect(hook.result.current.state).toBe("reconnecting")
        expect(hook.result.current.agentConnected).toBe(false)
    })

    it("believes an agent message that says the agent is gone", () => {
        const hook = renderHook(() => usePlaygroundSocketIo())
        act(() => relay.handlers.get("agent:connected")?.({ connected: false }))
        expect(hook.result.current.agentConnected).toBe(false)

        act(() => relay.handlers.get("agent:connected")?.({ connected: true }))
        expect(hook.result.current.agentConnected).toBe(true)

        act(() => relay.handlers.get("agent:disconnected")?.())
        expect(hook.result.current.agentConnected).toBe(false)
    })

    it("reports a relay that cannot be reached at all as failed", () => {
        const hook = renderHook(() => usePlaygroundSocketIo())
        act(() => relay.handlers.get("connect_error")?.())
        expect(hook.result.current.state).toBe("failed")
    })

    it("ignores a verification message that names no step", () => {
        const hook = renderHook(() => usePlaygroundSocketIo())
        act(() => relay.handlers.get("step:verified")?.({ data: {} }))
        expect(hook.result.current.verifiedStepIndex).toBeNull()
        expect(hook.result.current.passedStepIndexes).toEqual([])
    })

    it("keeps the passed steps in order and records each one once", () => {
        const hook = renderHook(() => usePlaygroundSocketIo())
        act(() => relay.handlers.get("step:verified")?.({ data: { stepIndex: 2 } }))
        act(() => relay.handlers.get("step:verified")?.({ data: { stepIndex: 0 } }))
        expect(hook.result.current.passedStepIndexes).toEqual([0, 2])

        act(() => relay.handlers.get("step:verified")?.({ data: { stepIndex: 2 } }))
        // Re-verifying a step the agent has already passed must not duplicate it: the progress
        // rail counts entries, so a repeat would read as more progress than was made.
        expect(hook.result.current.passedStepIndexes).toEqual([0, 2])
        expect(hook.result.current.verifiedStepIndex).toBe(2)
    })

    it("clears the progress of the session it was watching when another is subscribed to", () => {
        const hook = renderHook(() => usePlaygroundSocketIo())
        act(() => relay.handlers.get("step:verified")?.({ data: { stepIndex: 1 } }))
        expect(hook.result.current.passedStepIndexes).toEqual([1])

        act(() => hook.result.current.subscribe("session-2"))
        expect(hook.result.current.verifiedStepIndex).toBeNull()
        expect(hook.result.current.passedStepIndexes).toEqual([])
        expect(relay.socket.emit).toHaveBeenCalledWith("browser:subscribe", { sessionId: "session-2" })
    })

    it("stops listening and closes the relay when the layout goes away", () => {
        const hook = renderHook(() => usePlaygroundSocketIo())
        hook.unmount()
        expect(relay.socket.off).toHaveBeenCalledWith("step:verified", expect.any(Function))
        expect(relay.socket.disconnect).toHaveBeenCalledTimes(1)
    })
})
