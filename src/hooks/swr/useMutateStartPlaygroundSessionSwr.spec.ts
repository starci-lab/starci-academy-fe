/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    MUTATE_START_PLAYGROUND_SESSION_SWR_KEY,
    useMutateStartPlaygroundSessionSwr,
} from "./useMutateStartPlaygroundSessionSwr"

/**
 * What these tests guard: the key carries the LAB, so a catalog of labs is a catalog where starting
 * one does not put every other start control into the running state; and a hook with no lab refuses
 * the press rather than opening a session against whichever lab happens to be first.
 */

const mocks = vi.hoisted(() => ({ mutationStartPlaygroundSession: vi.fn() }))

vi.mock("@/modules/api/graphql/mutations/mutation-start-playground-session", () => ({
    mutationStartPlaygroundSession: mocks.mutationStartPlaygroundSession,
}))

/** What the transport answers for an opened session. */
const opened = {
    data: {
        createPlaygroundSession: {
            success: true,
            message: "ok",
            data: { id: "session-1", pairingCode: "A1B2", mode: "guided", steps: [] },
        },
    },
}

beforeEach(() => {
    mocks.mutationStartPlaygroundSession.mockReset()
    mocks.mutationStartPlaygroundSession.mockResolvedValue(opened)
})

describe("MUTATE_START_PLAYGROUND_SESSION_SWR_KEY", () => {
    it("is a stable prefix the lab is appended to", () => {
        expect(MUTATE_START_PLAYGROUND_SESSION_SWR_KEY).toBe("MUTATE_START_PLAYGROUND_SESSION_SWR")
    })
})

describe("useMutateStartPlaygroundSessionSwr", () => {
    it("opens nothing until the reader presses", () => {
        const { result } = renderHook(() => useMutateStartPlaygroundSessionSwr("playground-1"))
        expect(mocks.mutationStartPlaygroundSession).not.toHaveBeenCalled()
        expect(result.current.isMutating).toBe(false)
    })

    it("wraps the trigger argument as the request and hands back the session", async () => {
        const { result } = renderHook(() => useMutateStartPlaygroundSessionSwr("playground-1"))

        const request = { playgroundId: "playground-1", mode: "guided" } as const
        await act(async () => {
            await expect(result.current.trigger(request)).resolves.toEqual(opened)
        })
        expect(mocks.mutationStartPlaygroundSession).toHaveBeenCalledWith({ request })
    })

    it("lets the caller leave the mode to the server", async () => {
        const { result } = renderHook(() => useMutateStartPlaygroundSessionSwr("playground-1"))

        await act(async () => {
            await result.current.trigger({ playgroundId: "playground-1" })
        })
        expect(mocks.mutationStartPlaygroundSession).toHaveBeenCalledWith({
            request: { playgroundId: "playground-1" },
        })
    })

    it("refuses the press while no lab is named", async () => {
        const { result } = renderHook(() => useMutateStartPlaygroundSessionSwr())

        await act(async () => {
            await expect(result.current.trigger({ playgroundId: "playground-1" })).rejects.toThrow()
        })
        expect(mocks.mutationStartPlaygroundSession).not.toHaveBeenCalled()
    })

    it("keeps one lab's running state off the lab beside it", async () => {
        let settle: (value: unknown) => void = () => undefined
        mocks.mutationStartPlaygroundSession.mockReturnValue(new Promise((resolve) => { settle = resolve }))

        const { result } = renderHook(() => ({
            pressed: useMutateStartPlaygroundSessionSwr("playground-1"),
            neighbour: useMutateStartPlaygroundSessionSwr("playground-2"),
        }))

        let inFlight: Promise<unknown> = Promise.resolve()
        act(() => {
            inFlight = result.current.pressed.trigger({ playgroundId: "playground-1" })
        })
        expect(result.current.pressed.isMutating).toBe(true)
        expect(result.current.neighbour.isMutating).toBe(false)

        await act(async () => {
            settle(opened)
            await inFlight
        })
        expect(result.current.pressed.isMutating).toBe(false)
    })

    it("reports a transport failure as an error rather than as an opened session", async () => {
        mocks.mutationStartPlaygroundSession.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useMutateStartPlaygroundSessionSwr("playground-1"))

        await act(async () => {
            await expect(result.current.trigger({ playgroundId: "playground-1" }))
                .rejects.toThrow("offline")
        })
        expect(result.current.error).toBeInstanceOf(Error)
    })
})
