/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest"
import { createElement, type PropsWithChildren } from "react"
import { renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import {
    QUERY_MY_WEEKLY_STATS_SWR_KEY,
    useQueryMyWeeklyStatsSwr,
} from "./useQueryMyWeeklyStatsSwr"

/**
 * What these tests guard: the unwrapping, the loading contract, and the DEDUPLICATION that
 * the shared key buys. Two surfaces on the dashboard read this hook, so the test that two
 * mounts make one request is not a performance note - it is the reason the key is a constant
 * rather than a string written twice.
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

/** A healthy payload: a live streak and one day behind it. */
const stats = {
    streak: 3,
    longestStreak: 11,
    days: [{ date: "2026-08-03", active: true }],
}

beforeEach(() => {
    mocks.queryMyWeeklyStats.mockReset()
    mocks.queryMyWeeklyStats.mockResolvedValue({
        data: { myWeeklyStats: { success: true, message: "ok", data: stats } },
    })
})

describe("QUERY_MY_WEEKLY_STATS_SWR_KEY", () => {
    it("is a stable array key, so a revalidating caller can name it", () => {
        expect(QUERY_MY_WEEKLY_STATS_SWR_KEY).toEqual(["QUERY_MY_WEEKLY_STATS_SWR"])
    })
})

describe("useQueryMyWeeklyStatsSwr", () => {
    it("starts with no data and no error", () => {
        const { result } = renderHook(() => useQueryMyWeeklyStatsSwr(), { wrapper })
        expect(result.current.data).toBeUndefined()
        expect(result.current.error).toBeUndefined()
    })

    it("hands back the payload, not the envelope", async () => {
        const { result } = renderHook(() => useQueryMyWeeklyStatsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(stats))
    })

    it("sends no arguments, because the query declares none", async () => {
        const { result } = renderHook(() => useQueryMyWeeklyStatsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(stats))
        expect(mocks.queryMyWeeklyStats.mock.calls[0][0]).toBeUndefined()
    })

    it("serves two mounts from ONE request, because they share the key", async () => {
        const shared = ({ children }: PropsWithChildren) =>
            createElement(SWRConfig, { value: { provider: () => new Map() } }, children)
        const both = renderHook(
            () => [useQueryMyWeeklyStatsSwr(), useQueryMyWeeklyStatsSwr()] as const,
            { wrapper: shared },
        )
        await waitFor(() => expect(both.result.current[0].data).toEqual(stats))
        expect(both.result.current[1].data).toEqual(stats)
        expect(mocks.queryMyWeeklyStats).toHaveBeenCalledTimes(1)
    })

    it("resolves to null when the server answered without a payload", async () => {
        mocks.queryMyWeeklyStats.mockResolvedValue({
            data: {
                myWeeklyStats: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" },
            },
        })
        const { result } = renderHook(() => useQueryMyWeeklyStatsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryMyWeeklyStats.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryMyWeeklyStatsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as an empty week", async () => {
        mocks.queryMyWeeklyStats.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryMyWeeklyStatsSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("exposes the SWR surface a component needs", async () => {
        const { result } = renderHook(() => useQueryMyWeeklyStatsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(stats))
        expect(result.current.mutate).toBeTypeOf("function")
        expect(result.current.isLoading).toBe(false)
    })
})
