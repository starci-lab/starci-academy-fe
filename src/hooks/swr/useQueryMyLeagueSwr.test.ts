/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_MY_LEAGUE_SWR_KEY, useQueryMyLeagueSwr } from "./useQueryMyLeagueSwr"

/**
 * What these tests guard: which league a reader is in is personal, and a learner who has not
 * placed yet is a real answer that must arrive as `null` rather than as an invented bronze tier.
 */

const mocks = vi.hoisted(() => ({ queryMyLeague: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-my-league", () => ({
    queryMyLeague: mocks.queryMyLeague,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** A weekly league, trimmed to the fields the document selects. */
const league = { tier: "gold", rank: 4, xp: 620 }

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { myLeague: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.queryMyLeague.mockReset()
    mocks.queryMyLeague.mockResolvedValue(responseWith(league))
})

describe("QUERY_MY_LEAGUE_SWR_KEY", () => {
    it("is a stable array key a caller can revalidate by name", () => {
        expect(QUERY_MY_LEAGUE_SWR_KEY).toEqual(["QUERY_MY_LEAGUE_SWR"])
    })
})

describe("useQueryMyLeagueSwr", () => {
    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryMyLeagueSwr(), { wrapper })
        expect(mocks.queryMyLeague).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
    })

    it("hands back the league, not the envelope", async () => {
        const { result } = renderHook(() => useQueryMyLeagueSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(league))
        expect(mocks.queryMyLeague).toHaveBeenCalledTimes(1)
    })

    it("resolves to null for a learner who has not placed this week", async () => {
        mocks.queryMyLeague.mockResolvedValue({
            data: { myLeague: { success: false, message: "not placed", error: "NOT_FOUND" } },
        })
        const { result } = renderHook(() => useQueryMyLeagueSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryMyLeague.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryMyLeagueSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as no league", async () => {
        mocks.queryMyLeague.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryMyLeagueSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("reads again under a new key when the viewer changes", async () => {
        const { result } = renderHook(() => useQueryMyLeagueSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(league))

        const other = { tier: "bronze", rank: 30, xp: 10 }
        mocks.queryMyLeague.mockResolvedValue(responseWith(other))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual(other))
        expect(mocks.queryMyLeague).toHaveBeenCalledTimes(2)
    })
})
