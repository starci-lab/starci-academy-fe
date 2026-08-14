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

vi.mock("socket.io-client", () => ({ io: relay.io }))
vi.mock("@/hooks/auth/useSessionToken", () => ({ useSessionToken: () => "test-session-token" }))

import { usePlaygroundSocketIo } from "./usePlaygroundSocketIo"

describe("usePlaygroundSocketIo", () => {
    beforeEach(() => {
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
})
