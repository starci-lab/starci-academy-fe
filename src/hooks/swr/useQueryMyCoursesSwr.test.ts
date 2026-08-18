/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest"
import { createElement, type PropsWithChildren } from "react"
import { act, renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_MY_COURSES_SWR_KEY, useQueryMyCoursesSwr } from "./useQueryMyCoursesSwr"

/**
 * What these tests guard: the unwrapping and the EMPTY-versus-ABSENT distinction. The query
 * module is replaced, so nothing here reaches the network. The case that matters is the
 * learner enrolled in nothing: that must settle as `[]`, because the progress block renders
 * "you have not enrolled yet" for an empty array and a skeleton for an answer still in
 * flight, and collapsing the two would show the wrong one forever.
 */

const mocks = vi.hoisted(() => ({
    queryMyCourses: vi.fn(),
}))

vi.mock("../../modules/api/graphql/queries/query-my-courses", () => ({
    QueryMyCourses: { Query2: "query2" },
    queryMyCourses: mocks.queryMyCourses,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) =>
    createElement(
        SWRConfig,
        { value: { provider: () => new Map(), dedupingInterval: 0 } },
        children,
    )

/** One row, trimmed to the fields the document selects. */
const rows = [{ globalId: "course-1", label: "Systems Design", completionPercent: 40 }]

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { myCourses: { success: true, message: "ok", data } },
})

beforeEach(() => {
    // A viewer must exist before any of this fetches: the key is viewer-scoped, and with nobody
    // signed in the hook passes a null key and makes no request at all, by design.
    setSessionToken("token-under-test")
    mocks.queryMyCourses.mockReset()
    mocks.queryMyCourses.mockResolvedValue(responseWith(rows))
})

describe("QUERY_MY_COURSES_SWR_KEY", () => {
    it("is a stable array key, so a revalidating caller can name it", () => {
        expect(QUERY_MY_COURSES_SWR_KEY).toEqual(["QUERY_MY_COURSES_SWR"])
    })
})

describe("useQueryMyCoursesSwr", () => {
    it("starts with no data and no error", () => {
        const { result } = renderHook(() => useQueryMyCoursesSwr(), { wrapper })
        expect(result.current.data).toBeUndefined()
        expect(result.current.error).toBeUndefined()
    })

    it("hands back the rows, not the envelope", async () => {
        const { result } = renderHook(() => useQueryMyCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(rows))
    })

    it("selects the full dashboard query variant without request variables", async () => {
        const { result } = renderHook(() => useQueryMyCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(rows))
        expect(mocks.queryMyCourses).toHaveBeenCalledTimes(1)
        expect(mocks.queryMyCourses.mock.calls[0][0]).toEqual({ query: "query2" })
    })

    it("keeps an empty enrolment as an empty array rather than as null", async () => {
        mocks.queryMyCourses.mockResolvedValue(responseWith([]))
        const { result } = renderHook(() => useQueryMyCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual([]))
        expect(result.current.data).not.toBeNull()
    })

    it("resolves to null when the server answered without a payload", async () => {
        mocks.queryMyCourses.mockResolvedValue({
            data: { myCourses: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" } },
        })
        const { result } = renderHook(() => useQueryMyCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryMyCourses.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryMyCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as an empty list", async () => {
        mocks.queryMyCourses.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryMyCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("exposes the SWR surface a component needs", async () => {
        const { result } = renderHook(() => useQueryMyCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(rows))
        expect(result.current.mutate).toBeTypeOf("function")
        expect(result.current.isLoading).toBe(false)
    })

    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryMyCoursesSwr(), { wrapper })
        // This is the state the progress block draws as "sign in to see this": no request, no
        // loading, no skeleton shimmering at somebody who is not waiting for anything.
        expect(mocks.queryMyCourses).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBeUndefined()
    })

    it("never hands one viewer the enrolment fetched for another", async () => {
        const { result } = renderHook(() => useQueryMyCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(rows))

        mocks.queryMyCourses.mockResolvedValue(responseWith([]))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual([]))
        expect(mocks.queryMyCourses).toHaveBeenCalledTimes(2)
    })
})
