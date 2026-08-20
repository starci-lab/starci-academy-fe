/** @vitest-environment jsdom */
import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { getSessionToken, setSessionToken } from "./useSessionToken"
import { refreshSession, useSessionRefresh } from "./useSessionRefresh"

/**
 * What these tests guard: the four ways a session dies quietly.
 *
 * THE RACE. One refresh rotates the HttpOnly cookie, so two callers must share one request or the
 * second one presents a cookie the server has already replaced and the reader is signed out by a
 * renewal that succeeded.
 *
 * THE EXPIRY. The renewal is scheduled from the token's own `exp`, ahead of it by the window the
 * server allows. A token whose expiry cannot be read at all must schedule NOTHING rather than
 * guess - a wrong guess is either a renewal storm or a session that dies mid-sentence.
 *
 * THE FAILURE. A refresh that is refused, or that never arrives, ends the session rather than
 * leaving a stale token in place for the transport to keep presenting.
 *
 * THE RESTORE. On a cold load there is no token in memory, only the cookie, so the hook says it is
 * restoring until that question is answered - and stops saying so even when the answer is "no".
 */

const mocks = vi.hoisted(() => ({ refresh: vi.fn() }))

vi.mock("@/modules/api/graphql/mutations/mutation-refresh-token", () => ({
    mutationRefreshToken: mocks.refresh,
}))

/** The window the hook renews inside, in milliseconds. */
const REFRESH_AHEAD_MS = 45_000

/** A fixed moment, so every scheduled delay in these tests is arithmetic rather than luck. */
const NOW = Date.UTC(2025, 0, 1)

/** A successful renewal envelope. */
const renewed = (accessToken: string) => ({
    data: { refreshToken: { success: true, message: "ok", data: { accessToken } } },
})

/**
 * Build a token whose payload says when it expires.
 *
 * @param expiresAtMs - When the token expires, as milliseconds since the epoch.
 * @param urlSafe - Encode the payload with the URL-safe alphabet, as Keycloak does.
 */
const tokenExpiringAt = (expiresAtMs: number, urlSafe = false): string => {
    // The filler is chosen so the standard alphabet produces BOTH `+` and `/`, which is the only
    // way the URL-safe variant differs - a token without them would not test the normalisation.
    const payload = JSON.stringify({ exp: Math.floor(expiresAtMs / 1000), note: "þÿþ" })
    const encoded = window.btoa(payload)
    return `header.${urlSafe ? encoded.replace(/\+/g, "-").replace(/\//g, "_") : encoded}.signature`
}

/** Wrap a payload as a token, however malformed the payload is. */
const tokenWithPayload = (payload: string): string => `header.${payload}.signature`

/** Replace `document.visibilityState`, which jsdom exposes read-only. */
const setVisibility = (state: "visible" | "hidden") => {
    Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => state,
    })
}

beforeEach(() => {
    setSessionToken("expired-token")
    mocks.refresh.mockReset()
    setVisibility("visible")
})

afterEach(() => {
    cleanup()
    setSessionToken(undefined)
})

describe("refreshSession", () => {
    it("replaces the stale access token with the cookie-backed refresh result", async () => {
        mocks.refresh.mockResolvedValue(renewed("fresh-token"))
        await refreshSession()
        expect(getSessionToken()).toBe("fresh-token")
        expect(mocks.refresh).toHaveBeenCalledWith({ minValiditySeconds: 45 })
    })

    it("ends a session whose refresh cookie can no longer renew it", async () => {
        mocks.refresh.mockResolvedValue({
            data: { refreshToken: { success: false, message: "expired" } },
        })
        await refreshSession()
        expect(getSessionToken()).toBeUndefined()
    })

    it("ends the session when the server said yes but sent no token", async () => {
        mocks.refresh.mockResolvedValue({
            data: { refreshToken: { success: true, message: "ok" } },
        })
        await refreshSession()
        expect(getSessionToken()).toBeUndefined()
    })

    it("ends the session when there is no response body at all", async () => {
        mocks.refresh.mockResolvedValue({ data: undefined })
        await refreshSession()
        expect(getSessionToken()).toBeUndefined()
    })

    it("ends the session when the renewal never reached a verdict", async () => {
        mocks.refresh.mockRejectedValue(new Error("network"))
        await refreshSession()
        expect(getSessionToken()).toBeUndefined()
    })

    it("coalesces callers because one refresh rotates the HttpOnly cookie", async () => {
        let resolve!: (value: unknown) => void
        mocks.refresh.mockReturnValue(new Promise((done) => { resolve = done }))
        const first = refreshSession()
        const second = refreshSession()
        expect(first).toBe(second)
        expect(mocks.refresh).toHaveBeenCalledTimes(1)

        resolve(renewed("fresh-token"))
        await Promise.all([first, second])
        expect(getSessionToken()).toBe("fresh-token")
    })

    it("frees the shared slot once settled, so a later renewal is a new request", async () => {
        mocks.refresh.mockResolvedValue(renewed("first-token"))
        await refreshSession()
        mocks.refresh.mockResolvedValue(renewed("second-token"))
        await refreshSession()
        expect(mocks.refresh).toHaveBeenCalledTimes(2)
        expect(getSessionToken()).toBe("second-token")
    })

    it("frees the shared slot after a rejection too, so the session can still recover", async () => {
        mocks.refresh.mockRejectedValue(new Error("network"))
        await refreshSession()
        expect(getSessionToken()).toBeUndefined()

        mocks.refresh.mockResolvedValue(renewed("recovered-token"))
        await refreshSession()
        expect(mocks.refresh).toHaveBeenCalledTimes(2)
        expect(getSessionToken()).toBe("recovered-token")
    })
})

describe("useSessionRefresh on a cold page load", () => {
    it("says it is restoring until the HttpOnly session has answered", async () => {
        setSessionToken(undefined)
        let resolve!: (value: unknown) => void
        mocks.refresh.mockReturnValue(new Promise((done) => { resolve = done }))

        const { result } = renderHook(() => useSessionRefresh())
        expect(result.current.isRestoring).toBe(true)
        expect(mocks.refresh).toHaveBeenCalledTimes(1)

        await act(async () => {
            resolve(renewed(tokenWithPayload("not-base64")))
        })
        expect(result.current.isRestoring).toBe(false)
        expect(getSessionToken()).toBe(tokenWithPayload("not-base64"))
    })

    it("stops restoring even when the cookie could not renew anything", async () => {
        setSessionToken(undefined)
        mocks.refresh.mockResolvedValue({
            data: { refreshToken: { success: false, message: "expired" } },
        })

        const { result } = renderHook(() => useSessionRefresh())
        await act(async () => {
            await refreshSession()
        })
        expect(result.current.isRestoring).toBe(false)
        expect(getSessionToken()).toBeUndefined()
    })

    it("does not restore when a token is already in memory", () => {
        setSessionToken(tokenWithPayload("not-base64"))
        const { result } = renderHook(() => useSessionRefresh())
        expect(result.current.isRestoring).toBe(false)
        expect(mocks.refresh).not.toHaveBeenCalled()
    })

    it("lets a restore finish after the surface is gone, without tracking it any longer", async () => {
        setSessionToken(undefined)
        let resolve!: (value: unknown) => void
        mocks.refresh.mockReturnValue(new Promise((done) => { resolve = done }))

        const { result, unmount } = renderHook(() => useSessionRefresh())
        expect(result.current.isRestoring).toBe(true)

        unmount()
        await act(async () => {
            resolve(renewed("late-token"))
        })
        // The renewal still lands in the store - the transport needs it - but the surface that
        // asked for it has gone, so nothing tries to tell it the restore is over.
        expect(getSessionToken()).toBe("late-token")
    })
})

describe("useSessionRefresh scheduling", () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(NOW)
        mocks.refresh.mockResolvedValue(renewed(tokenWithPayload("not-base64")))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("renews one refresh window before the token expires, and not a moment earlier", async () => {
        setSessionToken(tokenExpiringAt(NOW + 300_000))
        renderHook(() => useSessionRefresh())

        await act(async () => {
            vi.advanceTimersByTime(300_000 - REFRESH_AHEAD_MS - 1)
        })
        expect(mocks.refresh).not.toHaveBeenCalled()

        await act(async () => {
            vi.advanceTimersByTime(1)
        })
        expect(mocks.refresh).toHaveBeenCalledTimes(1)
    })

    it("reads a URL-safe payload, which is the alphabet Keycloak actually uses", async () => {
        setSessionToken(tokenExpiringAt(NOW + 300_000, true))
        renderHook(() => useSessionRefresh())

        await act(async () => {
            vi.advanceTimersByTime(300_000 - REFRESH_AHEAD_MS)
        })
        expect(mocks.refresh).toHaveBeenCalledTimes(1)
    })

    it("renews immediately for a token that is already inside its refresh window", async () => {
        setSessionToken(tokenExpiringAt(NOW - 60_000))
        renderHook(() => useSessionRefresh())

        await act(async () => {
            vi.advanceTimersByTime(0)
        })
        expect(mocks.refresh).toHaveBeenCalledTimes(1)
    })

    it("schedules nothing for a token that carries no payload segment", async () => {
        setSessionToken("opaque-token")
        renderHook(() => useSessionRefresh())

        await act(async () => {
            vi.advanceTimersByTime(3_600_000)
        })
        expect(mocks.refresh).not.toHaveBeenCalled()

        act(() => {
            window.dispatchEvent(new Event("focus"))
        })
        expect(mocks.refresh).not.toHaveBeenCalled()
    })

    it("schedules nothing for a payload that cannot be decoded at all", async () => {
        setSessionToken(tokenWithPayload("!!!not-base64!!!"))
        renderHook(() => useSessionRefresh())

        await act(async () => {
            vi.advanceTimersByTime(3_600_000)
        })
        expect(mocks.refresh).not.toHaveBeenCalled()
    })

    it("schedules nothing for a payload with no numeric expiry claim", async () => {
        setSessionToken(tokenWithPayload(window.btoa(JSON.stringify({ sub: "user-1" }))))
        renderHook(() => useSessionRefresh())

        await act(async () => {
            vi.advanceTimersByTime(3_600_000)
        })
        expect(mocks.refresh).not.toHaveBeenCalled()
    })

    it("renews when the reader comes back to a tab whose token is nearly out", async () => {
        setSessionToken(tokenExpiringAt(NOW + 30_000))
        renderHook(() => useSessionRefresh())

        act(() => {
            window.dispatchEvent(new Event("focus"))
        })
        expect(mocks.refresh).toHaveBeenCalledTimes(1)
    })

    it("leaves a token with time left alone when the tab is focused", () => {
        setSessionToken(tokenExpiringAt(NOW + 600_000))
        renderHook(() => useSessionRefresh())

        act(() => {
            window.dispatchEvent(new Event("focus"))
        })
        expect(mocks.refresh).not.toHaveBeenCalled()
    })

    it("renews when a hidden tab becomes visible inside the refresh window", () => {
        setSessionToken(tokenExpiringAt(NOW + 30_000))
        renderHook(() => useSessionRefresh())

        setVisibility("hidden")
        act(() => {
            document.dispatchEvent(new Event("visibilitychange"))
        })
        expect(mocks.refresh).not.toHaveBeenCalled()

        setVisibility("visible")
        act(() => {
            document.dispatchEvent(new Event("visibilitychange"))
        })
        expect(mocks.refresh).toHaveBeenCalledTimes(1)
    })

    it("stops listening and cancels the timer once the surface is gone", async () => {
        setSessionToken(tokenExpiringAt(NOW + 300_000))
        const { unmount } = renderHook(() => useSessionRefresh())
        unmount()

        act(() => {
            window.dispatchEvent(new Event("focus"))
            document.dispatchEvent(new Event("visibilitychange"))
        })
        await act(async () => {
            vi.advanceTimersByTime(3_600_000)
        })
        expect(mocks.refresh).not.toHaveBeenCalled()
    })

    it("re-schedules against the new token when one arrives", async () => {
        setSessionToken(tokenExpiringAt(NOW + 300_000))
        renderHook(() => useSessionRefresh())

        act(() => {
            setSessionToken(tokenExpiringAt(NOW + 600_000))
        })
        await act(async () => {
            vi.advanceTimersByTime(300_000 - REFRESH_AHEAD_MS)
        })
        expect(mocks.refresh).not.toHaveBeenCalled()

        await act(async () => {
            vi.advanceTimersByTime(300_000)
        })
        expect(mocks.refresh).toHaveBeenCalledTimes(1)
    })
})
