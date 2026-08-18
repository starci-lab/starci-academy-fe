/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_CONTENT_SWR_KEY, useQueryContentSwr } from "./useQueryContentSwr"

/**
 * What these tests guard: a lesson is read WITH the viewer in the key, because what comes back
 * depends on entitlement - a premium lesson is a paragraph of preview for one reader and the whole
 * thing for another, and one cached copy for both is how a signed-out reader ends up holding paid
 * content.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryContent: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-content", () => ({ queryContent: mocks.queryContent }))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One lesson, trimmed to the fields the document selects. */
const content = { id: "content-1", title: "Idempotency keys", isPremium: true }

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.useSWR.mockReset()
    mocks.queryContent.mockReset()
    mocks.queryContent.mockResolvedValue({
        data: { content: { success: true, message: "ok", data: content } },
    })
})

describe("useQueryContentSwr", () => {
    it("holds the key null until both the lesson and the viewer are known", () => {
        renderHook(() => useQueryContentSwr())
        expect(keyOf()).toBeNull()

        setSessionToken(undefined)
        renderHook(() => useQueryContentSwr({ id: "content-1" }))
        expect(keyOf()).toBeNull()
    })

    it("names the lesson and the viewer in the key, so entitlement is never shared", () => {
        const hook = renderHook(() => useQueryContentSwr({ id: "content-1" }))
        const resting = keyOf()
        expect(resting).toEqual([QUERY_CONTENT_SWR_KEY, "content-1", expect.any(String)])

        renderHook(() => useQueryContentSwr({ id: "content-2" }))
        expect(keyOf()).not.toEqual(resting)

        hook.rerender()
        act(() => setSessionToken("a-second-viewer"))
        expect(keyOf()).not.toEqual(resting)
    })

    it("sends the lesson id and hands back the lesson, not the envelope", async () => {
        renderHook(() => useQueryContentSwr({ id: "content-1" }))
        await expect(fetcherOf()()).resolves.toEqual(content)
        expect(mocks.queryContent).toHaveBeenCalledWith({ request: { id: "content-1" } })
    })

    it("resolves to null for a lesson the server will not serve", async () => {
        mocks.queryContent.mockResolvedValue({
            data: { content: { success: false, message: "not entitled", error: "FORBIDDEN" } },
        })
        renderHook(() => useQueryContentSwr({ id: "content-1" }))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryContent.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryContentSwr({ id: "content-1" }))
        await expect(fetcherOf()()).resolves.toBeNull()
    })
})
