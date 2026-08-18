/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_MY_KPIS_SWR_KEY, useQueryMyKpisSwr } from "./useQueryMyKpisSwr"

/**
 * What these tests guard: the ABSENT-versus-EMPTY distinction and the viewer scope. A week with
 * no targets set is a real answer and must arrive as `null`, not as `undefined`, because
 * `undefined` is what SWR already uses for "still on its way". And the key carries the viewer, so
 * the next reader on this tab must never be shown the previous reader's figures.
 */

const mocks = vi.hoisted(() => ({ queryMyKpis: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-my-kpis", () => ({
    queryMyKpis: mocks.queryMyKpis,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** One week of targets, trimmed to the fields the document selects. */
const week = { xpTarget: 500, xpEarned: 320, lessonsTarget: 10, lessonsCompleted: 4 }

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { myKpis: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.queryMyKpis.mockReset()
    mocks.queryMyKpis.mockResolvedValue(responseWith(week))
})

describe("QUERY_MY_KPIS_SWR_KEY", () => {
    it("is a stable array key, so whatever changes a target can name it", () => {
        expect(QUERY_MY_KPIS_SWR_KEY).toEqual(["QUERY_MY_KPIS_SWR"])
    })
})

describe("useQueryMyKpisSwr", () => {
    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryMyKpisSwr(), { wrapper })
        expect(mocks.queryMyKpis).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBeUndefined()
    })

    it("hands back the targets, not the envelope", async () => {
        const { result } = renderHook(() => useQueryMyKpisSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(week))
        expect(mocks.queryMyKpis).toHaveBeenCalledTimes(1)
    })

    it("resolves to null when the server answered without a payload", async () => {
        mocks.queryMyKpis.mockResolvedValue({
            data: { myKpis: { success: false, message: "no week yet", error: "NOT_FOUND" } },
        })
        const { result } = renderHook(() => useQueryMyKpisSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryMyKpis.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryMyKpisSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as an empty week", async () => {
        mocks.queryMyKpis.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryMyKpisSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("reads again under a new key when the viewer changes", async () => {
        const { result } = renderHook(() => useQueryMyKpisSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(week))

        const other = { ...week, xpEarned: 0 }
        mocks.queryMyKpis.mockResolvedValue(responseWith(other))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual(other))
        expect(mocks.queryMyKpis).toHaveBeenCalledTimes(2)
    })
})
