/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_MY_JOB_READINESS_SWR_KEY, useQueryMyJobReadinessSwr } from "./useQueryMyJobReadinessSwr"

/**
 * What these tests guard: a readiness snapshot is entirely personal, so it must never be read out
 * of a cache entry the previous viewer filled, and "no snapshot yet" must arrive as `null` rather
 * than as a track list invented for a learner who has none.
 */

const mocks = vi.hoisted(() => ({ queryMyJobReadiness: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-my-job-readiness", () => ({
    queryMyJobReadiness: mocks.queryMyJobReadiness,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** A snapshot, trimmed to the fields the document selects. */
const readiness = {
    foundationTrack: { completionPercent: 60 },
    courseTracks: [{ courseId: "course-1", completionPercent: 25 }],
}

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { myJobReadiness: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.queryMyJobReadiness.mockReset()
    mocks.queryMyJobReadiness.mockResolvedValue(responseWith(readiness))
})

describe("QUERY_MY_JOB_READINESS_SWR_KEY", () => {
    it("is a stable array key a caller can revalidate by name", () => {
        expect(QUERY_MY_JOB_READINESS_SWR_KEY).toEqual(["QUERY_MY_JOB_READINESS_SWR"])
    })
})

describe("useQueryMyJobReadinessSwr", () => {
    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryMyJobReadinessSwr(), { wrapper })
        expect(mocks.queryMyJobReadiness).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
    })

    it("hands back the tracks, not the envelope", async () => {
        const { result } = renderHook(() => useQueryMyJobReadinessSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(readiness))
        expect(mocks.queryMyJobReadiness).toHaveBeenCalledTimes(1)
    })

    it("resolves to null when the server answered without a payload", async () => {
        mocks.queryMyJobReadiness.mockResolvedValue({
            data: { myJobReadiness: { success: false, message: "no snapshot", error: "NOT_FOUND" } },
        })
        const { result } = renderHook(() => useQueryMyJobReadinessSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryMyJobReadiness.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryMyJobReadinessSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as an empty snapshot", async () => {
        mocks.queryMyJobReadiness.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryMyJobReadinessSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("reads again under a new key when the viewer changes", async () => {
        const { result } = renderHook(() => useQueryMyJobReadinessSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(readiness))

        const other = { foundationTrack: { completionPercent: 0 }, courseTracks: [] }
        mocks.queryMyJobReadiness.mockResolvedValue(responseWith(other))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual(other))
        expect(mocks.queryMyJobReadiness).toHaveBeenCalledTimes(2)
    })
})
