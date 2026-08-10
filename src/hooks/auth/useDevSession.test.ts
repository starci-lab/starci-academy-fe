import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, renderHook, waitFor } from "@testing-library/react"
import { getSessionToken, setSessionToken } from "./useSessionToken"
import { useDevSession } from "./useDevSession"

/**
 * What these tests guard.
 *
 * The one assertion that MATTERS here is not that the button works - it is that a token which
 * arrives ends up in the same store a real sign-in writes to. A dev door that kept its own notion
 * of "signed in" would open screens the bearer link still treats as anonymous, and every hour
 * spent testing through it would be testing something no reader can reach.
 *
 * The rest guard the failure paths, because this control has two that look identical from the
 * outside and need different fixes: the route answered and refused (it is off, or the provider
 * would not grant), versus nothing answered at all (the dev server is down).
 */

/** A response body good enough for the hook, without standing up a real `Response`. */
const okResponse = (body: unknown): Response =>
    ({ ok: true, json: async () => body }) as Response

/** A refusal - the shape the route returns when it is switched off. */
const refusedResponse = (): Response =>
    ({ ok: false, json: async () => ({ error: "not-found" }) }) as Response

beforeEach(() => {
    setSessionToken(undefined)
})

afterEach(() => {
    cleanup()
    setSessionToken(undefined)
    vi.unstubAllGlobals()
})

describe("useDevSession", () => {
    it("stores the token in the SAME place a real sign-in writes to", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => okResponse({ accessToken: "token-from-route" })))
        const { result } = renderHook(() => useDevSession())

        act(() => {
            result.current.onPress()
        })

        await waitFor(() => {
            expect(getSessionToken()).toBe("token-from-route")
        })
    })

    it("reports the signed-in caller exactly once, after the token is stored", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => okResponse({ accessToken: "token-2" })))
        // Reading the store from inside the callback is the whole point: a caller told it is
        // signed in before the token lands would close a dialog over an anonymous page.
        const seen: Array<string | undefined> = []
        const { result } = renderHook(() => useDevSession({ onSignedIn: () => seen.push(getSessionToken()) }))

        act(() => {
            result.current.onPress()
        })

        await waitFor(() => {
            expect(seen).toEqual(["token-2"])
        })
    })

    it("posts, so the door is not reachable from an image tag on some other page", async () => {
        const fetchSpy = vi.fn(async () => okResponse({ accessToken: "token-3" }))
        vi.stubGlobal("fetch", fetchSpy)
        const { result } = renderHook(() => useDevSession())

        act(() => {
            result.current.onPress()
        })

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledWith("/api/dev-session", { method: "POST" })
        })
    })

    it("calls a refusal a refusal, and leaves nobody signed in", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => refusedResponse()))
        const { result } = renderHook(() => useDevSession())

        act(() => {
            result.current.onPress()
        })

        await waitFor(() => {
            expect(result.current.failure).toBe("refused")
        })
        expect(getSessionToken()).toBeUndefined()
    })

    it("tells a dead dev server apart from a refusal", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => {
            throw new Error("connection refused")
        }))
        const { result } = renderHook(() => useDevSession())

        act(() => {
            result.current.onPress()
        })

        await waitFor(() => {
            expect(result.current.failure).toBe("transport")
        })
    })

    it("refuses a 200 that carries no token, rather than storing an empty session", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => okResponse({})))
        const { result } = renderHook(() => useDevSession())

        act(() => {
            result.current.onPress()
        })

        await waitFor(() => {
            expect(result.current.failure).toBe("refused")
        })
        expect(getSessionToken()).toBeUndefined()
    })

    it("stops pending whichever way the attempt ends", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => refusedResponse()))
        const { result } = renderHook(() => useDevSession())

        act(() => {
            result.current.onPress()
        })

        await waitFor(() => {
            expect(result.current.isPending).toBe(false)
        })
    })
})
