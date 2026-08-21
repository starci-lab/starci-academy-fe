/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createElement, type PropsWithChildren } from "react"
import { act, cleanup, renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { setSessionToken } from "./useSessionToken"
import { useViewerKey } from "./useViewerKey"
import { useQueryMyWeeklyStatsSwr } from "../swr/useQueryMyWeeklyStatsSwr"

/**
 * What these tests guard - the two failures that made this file exist, not the hash.
 *
 * Both were reproduced against a running back end, and both were invisible to the type checker,
 * the linter and 326 other tests:
 *
 *   1. SIGNING IN CHANGED NOTHING. The standing rail said "sign in to see this" while the same
 *      query answered fine over the wire, because the key it was cached under never mentioned
 *      who was asking - so the refusal fetched a second before sign-in stayed the answer.
 *   2. SIGNING OUT CHANGED NOTHING EITHER, which is the worse half: the next viewer on that tab
 *      would read the previous viewer's figures out of the cache, and they look plausible.
 *
 * The third test is the one that stops a "fix" from re-introducing the first: with nobody signed
 * in there must be NO request at all. An auth-gated query fired without a token does not fail
 * once - SWR retries a rejected key on a backoff - which is how a signed-out dashboard ends up
 * shimmering at somebody who is not waiting for anything.
 */

const mocks = vi.hoisted(() => ({
    queryMyWeeklyStats: vi.fn(),
}))

vi.mock("../../modules/api/graphql/queries/query-my-weekly-stats", () => ({
    queryMyWeeklyStats: mocks.queryMyWeeklyStats,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) =>
    createElement(
        SWRConfig,
        { value: { provider: () => new Map(), dedupingInterval: 0 } },
        children,
    )

/** An answer that says which viewer asked for it, so a stale one is recognisable on sight. */
const answerFor = (streak: number) => ({
    data: { myWeeklyStats: { success: true, message: "ok", data: { streak, longestStreak: streak, days: [] } } },
})

/** Minimal token payload for proving refresh rotation without storing a real credential. */
const tokenFor = (subject: string, issuedAt: number): string => {
    const payload = window.btoa(JSON.stringify({ sub: subject, iat: issuedAt }))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "")
    return `header.${payload}.signature-${issuedAt}`
}

beforeEach(() => {
    setSessionToken(undefined)
    mocks.queryMyWeeklyStats.mockReset()
})

afterEach(() => {
    cleanup()
    setSessionToken(undefined)
})

describe("useViewerKey", () => {
    it("has no answer while nobody is signed in", () => {
        const { result } = renderHook(() => useViewerKey())
        expect(result.current).toBeUndefined()
    })

    it("gives two different tokens two different keys", () => {
        const { result } = renderHook(() => useViewerKey())
        act(() => {
            setSessionToken("token-a")
        })
        const first = result.current
        act(() => {
            setSessionToken("token-b")
        })
        expect(first).toBeDefined()
        expect(result.current).not.toBe(first)
    })

    it("keeps the same cache identity when one viewer's access token rotates", () => {
        const { result } = renderHook(() => useViewerKey())
        act(() => setSessionToken(tokenFor("viewer-1", 1)))
        const first = result.current

        act(() => setSessionToken(tokenFor("viewer-1", 2)))
        expect(result.current).toBe(first)

        act(() => setSessionToken(tokenFor("viewer-2", 3)))
        expect(result.current).not.toBe(first)
    })

    it("never puts the token itself in the key", () => {
        const { result } = renderHook(() => useViewerKey())
        act(() => {
            setSessionToken("a-bearer-token-nobody-should-see-in-a-cache")
        })
        expect(result.current).not.toContain("bearer")
        expect(result.current).not.toContain("a-bearer-token-nobody-should-see-in-a-cache")
    })
})

describe("a viewer-scoped SWR hook", () => {
    it("makes NO request while nobody is signed in", async () => {
        renderHook(() => useQueryMyWeeklyStatsSwr(), { wrapper })
        // Waiting first: asserting immediately would pass even if a request were queued.
        await new Promise((resolve) => {
            setTimeout(resolve, 50)
        })
        expect(mocks.queryMyWeeklyStats).not.toHaveBeenCalled()
    })

    it("fetches once a viewer signs in, WITHOUT a reload", async () => {
        mocks.queryMyWeeklyStats.mockResolvedValue(answerFor(4))
        const { result } = renderHook(() => useQueryMyWeeklyStatsSwr(), { wrapper })
        expect(result.current.data).toBeUndefined()

        act(() => {
            setSessionToken("token-a")
        })

        await waitFor(() => {
            expect(result.current.data?.streak).toBe(4)
        })
    })

    it("does not serve the previous viewer's answer to the next one", async () => {
        mocks.queryMyWeeklyStats.mockResolvedValue(answerFor(4))
        const { result } = renderHook(() => useQueryMyWeeklyStatsSwr(), { wrapper })
        act(() => {
            setSessionToken("token-a")
        })
        await waitFor(() => {
            expect(result.current.data?.streak).toBe(4)
        })

        mocks.queryMyWeeklyStats.mockResolvedValue(answerFor(11))
        act(() => {
            setSessionToken("token-b")
        })

        await waitFor(() => {
            expect(result.current.data?.streak).toBe(11)
        })
    })
})
