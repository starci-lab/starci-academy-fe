/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import {
    QUERY_MY_CONTRIBUTION_CALENDAR_SWR_KEY,
    useQueryMyContributionCalendarSwr,
} from "./useQueryMyContributionCalendarSwr"

/**
 * What these tests guard: the YEAR is part of both the key and the request, and "no year given"
 * is its own key rather than a second entry for whichever year happened to be asked for first.
 * Reading 2024 must not leave 2025 showing 2024's squares, and the calendar belongs to one viewer.
 */

const mocks = vi.hoisted(() => ({ queryMyContributionCalendar: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-my-contribution-calendar", () => ({
    queryMyContributionCalendar: mocks.queryMyContributionCalendar,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** Which calendar year a rerendering test is reading. */
interface YearProps {
    /** The year on screen, or `undefined` for the current one. */
    year?: number
}

/** One active day, trimmed to the fields the document selects. */
const days = [{ date: "2025-03-01", count: 3 }]

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { myContributionCalendar: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.queryMyContributionCalendar.mockReset()
    mocks.queryMyContributionCalendar.mockResolvedValue(responseWith(days))
})

describe("QUERY_MY_CONTRIBUTION_CALENDAR_SWR_KEY", () => {
    it("is a stable array key a caller can revalidate by name", () => {
        expect(QUERY_MY_CONTRIBUTION_CALENDAR_SWR_KEY).toEqual(["QUERY_MY_CONTRIBUTION_CALENDAR_SWR"])
    })
})

describe("useQueryMyContributionCalendarSwr", () => {
    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryMyContributionCalendarSwr(2025), { wrapper })
        expect(mocks.queryMyContributionCalendar).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
    })

    it("sends no request variables at all when no year was asked for", async () => {
        const { result } = renderHook(() => useQueryMyContributionCalendarSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(days))
        expect(mocks.queryMyContributionCalendar).toHaveBeenCalledWith({ request: undefined })
    })

    it("sends the year it was given, so one calendar is not served for another", async () => {
        const { result } = renderHook(() => useQueryMyContributionCalendarSwr(2024), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(days))
        expect(mocks.queryMyContributionCalendar).toHaveBeenCalledWith({ request: { year: 2024 } })
    })

    it("reads a second year under its own key rather than serving the first from cache", async () => {
        const { rerender, result } = renderHook(
            ({ year }: YearProps) => useQueryMyContributionCalendarSwr(year),
            { wrapper, initialProps: { year: 2024 } },
        )
        await waitFor(() => expect(result.current.data).toEqual(days))

        const later = [{ date: "2025-01-02", count: 9 }]
        mocks.queryMyContributionCalendar.mockResolvedValue(responseWith(later))
        rerender({ year: 2025 })

        await waitFor(() => expect(result.current.data).toEqual(later))
        expect(mocks.queryMyContributionCalendar).toHaveBeenCalledTimes(2)
    })

    it("makes an absent payload an empty year rather than a null the grid cannot render", async () => {
        mocks.queryMyContributionCalendar.mockResolvedValue({
            data: { myContributionCalendar: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" } },
        })
        const { result } = renderHook(() => useQueryMyContributionCalendarSwr(2025), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual([]))
    })

    it("makes a missing response body an empty year too", async () => {
        mocks.queryMyContributionCalendar.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryMyContributionCalendarSwr(2025), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual([]))
    })

    it("surfaces a transport failure as an error rather than as a blank year", async () => {
        mocks.queryMyContributionCalendar.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryMyContributionCalendarSwr(2025), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("reads again under a new key when the viewer changes", async () => {
        const { result } = renderHook(() => useQueryMyContributionCalendarSwr(2025), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(days))

        mocks.queryMyContributionCalendar.mockResolvedValue(responseWith([]))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual([]))
        expect(mocks.queryMyContributionCalendar).toHaveBeenCalledTimes(2)
    })
})
