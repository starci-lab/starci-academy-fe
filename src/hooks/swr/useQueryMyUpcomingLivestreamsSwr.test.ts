/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import {
    QUERY_MY_UPCOMING_LIVESTREAMS_SWR_KEY,
    useQueryMyUpcomingLivestreamsSwr,
} from "./useQueryMyUpcomingLivestreamsSwr"

/**
 * What these tests guard: upcoming sessions are the ones THIS viewer is enrolled for, so the key
 * has to name them - a rail listing the previous reader's sessions is an invitation to a call
 * nobody may join.
 */

const mocks = vi.hoisted(() => ({ queryMyUpcomingLivestreams: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-my-upcoming-livestreams", () => ({
    queryMyUpcomingLivestreams: mocks.queryMyUpcomingLivestreams,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** One session, trimmed to the fields the document selects. */
const rows = [{ livestreamId: "live-1", label: "Design review", startsAt: "2025-04-01T09:00:00Z" }]

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { myUpcomingLivestreams: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.queryMyUpcomingLivestreams.mockReset()
    mocks.queryMyUpcomingLivestreams.mockResolvedValue(responseWith(rows))
})

describe("QUERY_MY_UPCOMING_LIVESTREAMS_SWR_KEY", () => {
    it("is a stable array key a caller can revalidate by name", () => {
        expect(QUERY_MY_UPCOMING_LIVESTREAMS_SWR_KEY).toEqual(["QUERY_MY_UPCOMING_LIVESTREAMS_SWR"])
    })
})

describe("useQueryMyUpcomingLivestreamsSwr", () => {
    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryMyUpcomingLivestreamsSwr(), { wrapper })
        expect(mocks.queryMyUpcomingLivestreams).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
    })

    it("hands back the sessions, not the envelope", async () => {
        const { result } = renderHook(() => useQueryMyUpcomingLivestreamsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(rows))
        expect(mocks.queryMyUpcomingLivestreams).toHaveBeenCalledTimes(1)
    })

    it("keeps a diary with nothing in it as an empty array rather than as null", async () => {
        mocks.queryMyUpcomingLivestreams.mockResolvedValue(responseWith([]))
        const { result } = renderHook(() => useQueryMyUpcomingLivestreamsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual([]))
        expect(result.current.data).not.toBeNull()
    })

    it("resolves to null when the server answered without a payload", async () => {
        mocks.queryMyUpcomingLivestreams.mockResolvedValue({
            data: { myUpcomingLivestreams: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" } },
        })
        const { result } = renderHook(() => useQueryMyUpcomingLivestreamsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryMyUpcomingLivestreams.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryMyUpcomingLivestreamsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as an empty diary", async () => {
        mocks.queryMyUpcomingLivestreams.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryMyUpcomingLivestreamsSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("reads again under a new key when the viewer changes", async () => {
        const { result } = renderHook(() => useQueryMyUpcomingLivestreamsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(rows))

        mocks.queryMyUpcomingLivestreams.mockResolvedValue(responseWith([]))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual([]))
        expect(mocks.queryMyUpcomingLivestreams).toHaveBeenCalledTimes(2)
    })
})
