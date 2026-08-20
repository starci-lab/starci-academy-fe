/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_TRENDING_CONTENTS_SWR_KEY, useQueryTrendingContentsSwr } from "./useQueryTrendingContentsSwr"

/**
 * What these tests guard: trending rows carry the asking viewer's own reaction state, so the key
 * has to name the viewer; and an absent payload arrives as `[]`, so a rail renders "nothing is
 * trending" rather than crashing on a null it was not expecting.
 */

const mocks = vi.hoisted(() => ({ queryTrendingContents: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-trending-contents", () => ({
    queryTrendingContents: mocks.queryTrendingContents,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** One row, trimmed to the fields the document selects. */
const rows = [{ contentId: "content-1", label: "Idempotency keys", reactionCount: 12 }]

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { trendingContents: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.queryTrendingContents.mockReset()
    mocks.queryTrendingContents.mockResolvedValue(responseWith(rows))
})

describe("QUERY_TRENDING_CONTENTS_SWR_KEY", () => {
    it("is a stable array key a reaction can revalidate by name", () => {
        expect(QUERY_TRENDING_CONTENTS_SWR_KEY).toEqual(["QUERY_TRENDING_CONTENTS_SWR"])
    })
})

describe("useQueryTrendingContentsSwr", () => {
    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryTrendingContentsSwr(), { wrapper })
        expect(mocks.queryTrendingContents).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
    })

    it("hands back the rows, not the envelope", async () => {
        const { result } = renderHook(() => useQueryTrendingContentsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(rows))
        expect(mocks.queryTrendingContents).toHaveBeenCalledTimes(1)
    })

    it("makes an absent payload an empty array rather than a null a rail cannot render", async () => {
        mocks.queryTrendingContents.mockResolvedValue({
            data: { trendingContents: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" } },
        })
        const { result } = renderHook(() => useQueryTrendingContentsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual([]))
        expect(result.current.data).not.toBeNull()
    })

    it("makes a missing response body an empty array too", async () => {
        mocks.queryTrendingContents.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryTrendingContentsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual([]))
    })

    it("surfaces a transport failure as an error rather than as an empty list", async () => {
        mocks.queryTrendingContents.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryTrendingContentsSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("reads again under a new key when the viewer changes", async () => {
        const { result } = renderHook(() => useQueryTrendingContentsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(rows))

        const other = [{ contentId: "content-2", label: "Backpressure", reactionCount: 3 }]
        mocks.queryTrendingContents.mockResolvedValue(responseWith(other))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual(other))
        expect(mocks.queryTrendingContents).toHaveBeenCalledTimes(2)
    })
})
