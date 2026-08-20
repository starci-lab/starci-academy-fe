/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import {
    QUERY_CONTENT_REACTIONS_SWR_KEY,
    useQueryContentReactionsSwr,
} from "./useQueryContentReactionsSwr"

/**
 * What these tests guard: the summary carries the asking viewer's OWN reaction alongside the
 * counts, so it is not a public answer - the key names the viewer, and signing out must not leave
 * the previous reader's heart lit on the row.
 *
 * SWR is replaced so the fetcher's own refusal is reachable: the key is null whenever the content
 * is unknown, and a guard nobody can reach is a guard nobody notices breaking.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryContentReactions: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-content-reactions", () => ({
    queryContentReactions: mocks.queryContentReactions,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** A summary, trimmed to the fields the document selects. */
const summary = { total: 12, myReaction: "like" }

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.useSWR.mockReset()
    mocks.queryContentReactions.mockReset()
    mocks.queryContentReactions.mockResolvedValue({
        data: { contentReactions: { success: true, message: "ok", data: summary } },
    })
})

describe("useQueryContentReactionsSwr", () => {
    it("holds the key null until both the content and the viewer are known", () => {
        renderHook(() => useQueryContentReactionsSwr())
        expect(keyOf()).toBeNull()

        setSessionToken(undefined)
        renderHook(() => useQueryContentReactionsSwr("content-1"))
        expect(keyOf()).toBeNull()
    })

    it("names the content and the viewer in the key", () => {
        const hook = renderHook(() => useQueryContentReactionsSwr("content-1"))
        const resting = keyOf()
        expect(resting).toEqual([QUERY_CONTENT_REACTIONS_SWR_KEY, "content-1", expect.any(String)])

        hook.rerender()
        act(() => setSessionToken("a-second-viewer"))
        expect(keyOf()).not.toEqual(resting)
    })

    it("hands back the summary with the viewer's own reaction, not the envelope", async () => {
        renderHook(() => useQueryContentReactionsSwr("content-1"))
        await expect(fetcherOf()()).resolves.toEqual(summary)
        expect(mocks.queryContentReactions).toHaveBeenCalledWith({ request: { contentId: "content-1" } })
    })

    it("resolves to null when the server answered without a summary", async () => {
        mocks.queryContentReactions.mockResolvedValue({
            data: { contentReactions: { success: false, message: "not found", error: "NOT_FOUND" } },
        })
        renderHook(() => useQueryContentReactionsSwr("content-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryContentReactions.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryContentReactionsSwr("content-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("refuses to read reactions for no content", async () => {
        renderHook(() => useQueryContentReactionsSwr(undefined))
        await expect(fetcherOf()()).rejects.toThrow("Content id not found")
        expect(mocks.queryContentReactions).not.toHaveBeenCalled()
    })
})
