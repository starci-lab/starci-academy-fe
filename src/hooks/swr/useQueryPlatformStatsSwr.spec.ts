/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest"
import { createElement, type PropsWithChildren } from "react"
import { renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import {
    QUERY_PLATFORM_STATS_SWR_KEY,
    useQueryPlatformStatsSwr,
} from "./useQueryPlatformStatsSwr"

/**
 * What these tests guard: the unwrapping and the loading contract. The query module is
 * replaced, so nothing here reaches the network - what is being tested is that the hook
 * hands a component the payload and not the envelope, and that "no data" and "not loaded"
 * stay distinguishable.
 */

const mocks = vi.hoisted(() => ({
    queryPlatformStats: vi.fn(),
}))

vi.mock("../../modules/api/graphql/queries/query-platform-stats", () => ({
    queryPlatformStats: mocks.queryPlatformStats,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) =>
    createElement(
        SWRConfig,
        { value: { provider: () => new Map(), dedupingInterval: 0 } },
        children,
    )

/** The counters a healthy response carries. */
const counters = {
    totalLearners: 1200,
    totalLessons: 340,
    totalCourses: 12,
    totalBadgesEarned: 890,
}

beforeEach(() => {
    mocks.queryPlatformStats.mockReset()
})

describe("QUERY_PLATFORM_STATS_SWR_KEY", () => {
    it("is a stable array key, so a revalidating caller can name it", () => {
        expect(QUERY_PLATFORM_STATS_SWR_KEY).toEqual(["QUERY_PLATFORM_STATS_SWR"])
    })
})

describe("useQueryPlatformStatsSwr", () => {
    it("starts with no data and no error", () => {
        mocks.queryPlatformStats.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryPlatformStatsSwr(), { wrapper })
        expect(result.current.data).toBeUndefined()
        expect(result.current.error).toBeUndefined()
    })

    it("hands back the payload, not the envelope", async () => {
        mocks.queryPlatformStats.mockResolvedValue({
            data: { platformStats: { success: true, message: "ok", data: counters } },
        })
        const { result } = renderHook(() => useQueryPlatformStatsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(counters))
    })

    it("calls the query exactly once for one mount", async () => {
        mocks.queryPlatformStats.mockResolvedValue({
            data: { platformStats: { success: true, message: "ok", data: counters } },
        })
        const { result } = renderHook(() => useQueryPlatformStatsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(counters))
        expect(mocks.queryPlatformStats).toHaveBeenCalledTimes(1)
    })

    it("resolves to null when the server answered without a payload", async () => {
        mocks.queryPlatformStats.mockResolvedValue({
            data: { platformStats: { success: false, message: "unavailable", error: "UPSTREAM" } },
        })
        const { result } = renderHook(() => useQueryPlatformStatsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryPlatformStats.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryPlatformStatsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as empty data", async () => {
        mocks.queryPlatformStats.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryPlatformStatsSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("exposes the SWR surface a component needs", async () => {
        mocks.queryPlatformStats.mockResolvedValue({
            data: { platformStats: { success: true, message: "ok", data: counters } },
        })
        const { result } = renderHook(() => useQueryPlatformStatsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(counters))
        expect(result.current.mutate).toBeTypeOf("function")
        expect(result.current.isLoading).toBe(false)
    })
})
