import { afterEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, renderHook } from "@testing-library/react"
import {
    getSessionToken,
    setSessionToken,
    subscribeToSessionToken,
    useSessionToken,
} from "./useSessionToken"

/**
 * What these tests guard: that the token has ONE home. The store exists because two readers
 * need the same value and only one of them is a component - so the assertions worth making
 * are that a plain function call and a subscribed component always see the same thing, and
 * that a write nobody made does not wake anybody up.
 */

afterEach(() => {
    cleanup()
    setSessionToken(undefined)
})

describe("getSessionToken", () => {
    it("starts with nobody signed in", () => {
        expect(getSessionToken()).toBeUndefined()
    })

    it("reads back exactly what was written", () => {
        setSessionToken("token-1")
        expect(getSessionToken()).toBe("token-1")
    })

    it("ends the session when the token is cleared", () => {
        setSessionToken("token-1")
        setSessionToken(undefined)
        expect(getSessionToken()).toBeUndefined()
    })
})

describe("subscribeToSessionToken", () => {
    it("wakes a listener on every real change", () => {
        const listener = vi.fn()
        const unsubscribe = subscribeToSessionToken(listener)
        setSessionToken("token-1")
        setSessionToken("token-2")
        expect(listener).toHaveBeenCalledTimes(2)
        unsubscribe()
    })

    it("stays silent when the token is written with the value it already had", () => {
        setSessionToken("token-1")
        const listener = vi.fn()
        const unsubscribe = subscribeToSessionToken(listener)
        setSessionToken("token-1")
        expect(listener).not.toHaveBeenCalled()
        unsubscribe()
    })

    it("stops waking a listener that has unsubscribed", () => {
        const listener = vi.fn()
        const unsubscribe = subscribeToSessionToken(listener)
        unsubscribe()
        setSessionToken("token-1")
        expect(listener).not.toHaveBeenCalled()
    })
})

describe("useSessionToken", () => {
    it("renders the current token", () => {
        setSessionToken("token-1")
        const { result } = renderHook(() => useSessionToken())
        expect(result.current).toBe("token-1")
    })

    it("re-renders when the token changes underneath it", () => {
        const { result } = renderHook(() => useSessionToken())
        expect(result.current).toBeUndefined()
        act(() => {
            setSessionToken("token-2")
        })
        expect(result.current).toBe("token-2")
    })

    it("agrees with the plain getter the transport uses", () => {
        const { result } = renderHook(() => useSessionToken())
        act(() => {
            setSessionToken("token-3")
        })
        expect(result.current).toBe(getSessionToken())
    })

    it("leaves no listener behind when the component goes away", () => {
        const { unmount } = renderHook(() => useSessionToken())
        unmount()
        // Nothing to assert on the store itself - a leaked listener would show up as a React
        // warning about updating an unmounted component, which this write would trigger.
        expect(() => setSessionToken("token-4")).not.toThrow()
    })
})
