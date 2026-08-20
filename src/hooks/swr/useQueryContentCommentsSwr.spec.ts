/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import {
    QUERY_CONTENT_COMMENTS_SWR_KEY,
    useQueryContentCommentsSwr,
} from "./useQueryContentCommentsSwr"

/**
 * What these tests guard: the THREAD is part of the key. `parentCommentId: null` reads the top
 * level and an id reads one thread's replies, so a key that ignored it would show a thread's
 * replies as the page's comments. The page and the limit are in it for the same reason.
 *
 * SWR is replaced so the fetcher's own refusal is reachable: the key is null whenever the content
 * is unknown, and a guard nobody can reach is a guard nobody notices breaking.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryContentComments: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-content-comments", () => ({
    queryContentComments: mocks.queryContentComments,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One page of comments, trimmed to the fields the document selects. */
const page = { data: [{ id: "comment-1", body: "Useful" }], total: 1 }

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.useSWR.mockReset()
    mocks.queryContentComments.mockReset()
    mocks.queryContentComments.mockResolvedValue({
        data: { contentComments: { success: true, message: "ok", data: page } },
    })
})

describe("useQueryContentCommentsSwr", () => {
    it("holds the key null until both the content and the viewer are known", () => {
        renderHook(() => useQueryContentCommentsSwr())
        expect(keyOf()).toBeNull()

        setSessionToken(undefined)
        renderHook(() => useQueryContentCommentsSwr({ contentId: "content-1" }))
        expect(keyOf()).toBeNull()
    })

    it("reads the top level by default, and says so in the key", () => {
        renderHook(() => useQueryContentCommentsSwr({ contentId: "content-1" }))
        expect(keyOf()).toEqual([
            QUERY_CONTENT_COMMENTS_SWR_KEY, "content-1", null, 1, 20, expect.any(String),
        ])
    })

    it("gives a thread, a page and a limit their own cache entries", () => {
        renderHook(() => useQueryContentCommentsSwr({ contentId: "content-1" }))
        const topLevel = keyOf()

        renderHook(() => useQueryContentCommentsSwr({ contentId: "content-1", parentCommentId: "comment-1" }))
        expect(keyOf()).not.toEqual(topLevel)

        renderHook(() => useQueryContentCommentsSwr({ contentId: "content-1", page: 2 }))
        expect(keyOf()).not.toEqual(topLevel)

        renderHook(() => useQueryContentCommentsSwr({ contentId: "content-1", limit: 5 }))
        expect(keyOf()).not.toEqual(topLevel)
    })

    it("re-reads under a new key when the viewer changes", () => {
        const hook = renderHook(() => useQueryContentCommentsSwr({ contentId: "content-1" }))
        const resting = keyOf()
        hook.rerender()
        act(() => setSessionToken("a-second-viewer"))
        expect(keyOf()).not.toEqual(resting)
    })

    it("sends the whole scope and hands back the page, not the envelope", async () => {
        renderHook(() => useQueryContentCommentsSwr({
            contentId: "content-1", parentCommentId: "comment-1", page: 3, limit: 5,
        }))
        await expect(fetcherOf()()).resolves.toEqual(page)
        expect(mocks.queryContentComments).toHaveBeenCalledWith({
            request: { contentId: "content-1", parentCommentId: "comment-1", page: 3, limit: 5 },
        })
    })

    it("resolves to null when the server answered without a page", async () => {
        mocks.queryContentComments.mockResolvedValue({
            data: { contentComments: { success: false, message: "not found", error: "NOT_FOUND" } },
        })
        renderHook(() => useQueryContentCommentsSwr({ contentId: "content-1" }))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryContentComments.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryContentCommentsSwr({ contentId: "content-1" }))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("refuses to read comments for no content", async () => {
        renderHook(() => useQueryContentCommentsSwr())
        await expect(fetcherOf()()).rejects.toThrow("Content id not found")
        expect(mocks.queryContentComments).not.toHaveBeenCalled()
    })
})
