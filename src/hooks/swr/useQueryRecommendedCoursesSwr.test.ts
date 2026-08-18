/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_RECOMMENDED_COURSES_SWR_KEY, useQueryRecommendedCoursesSwr } from "./useQueryRecommendedCoursesSwr"

/**
 * What these tests guard: this hook reaches ONE level further than its siblings - the payload is a
 * page and the rail wants its `items`. That extra hop is the thing worth pinning: a change of
 * shape upstream would otherwise surface as a rail that renders nothing without erroring.
 */

const mocks = vi.hoisted(() => ({ queryRecommendedCourses: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-recommended-courses", () => ({
    queryRecommendedCourses: mocks.queryRecommendedCourses,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** One recommendation, trimmed to the fields the document selects. */
const items = [{ courseId: "course-1", label: "Systems Design", reason: "continues your track" }]

/** Wrap a page of items in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { recommendedCourses: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.queryRecommendedCourses.mockReset()
    mocks.queryRecommendedCourses.mockResolvedValue(responseWith({ items, total: 1 }))
})

describe("QUERY_RECOMMENDED_COURSES_SWR_KEY", () => {
    it("is a stable array key a caller can revalidate by name", () => {
        expect(QUERY_RECOMMENDED_COURSES_SWR_KEY).toEqual(["QUERY_RECOMMENDED_COURSES_SWR"])
    })
})

describe("useQueryRecommendedCoursesSwr", () => {
    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryRecommendedCoursesSwr(), { wrapper })
        expect(mocks.queryRecommendedCourses).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
    })

    it("hands back the items out of the page, not the page and not the envelope", async () => {
        const { result } = renderHook(() => useQueryRecommendedCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(items))
        expect(mocks.queryRecommendedCourses).toHaveBeenCalledTimes(1)
    })

    it("resolves to null when the page arrived without items", async () => {
        mocks.queryRecommendedCourses.mockResolvedValue(responseWith({ total: 0 }))
        const { result } = renderHook(() => useQueryRecommendedCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when the server answered without a payload", async () => {
        mocks.queryRecommendedCourses.mockResolvedValue({
            data: { recommendedCourses: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" } },
        })
        const { result } = renderHook(() => useQueryRecommendedCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryRecommendedCourses.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryRecommendedCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as no recommendations", async () => {
        mocks.queryRecommendedCourses.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryRecommendedCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("reads again under a new key when the viewer changes", async () => {
        const { result } = renderHook(() => useQueryRecommendedCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(items))

        mocks.queryRecommendedCourses.mockResolvedValue(responseWith({ items: [], total: 0 }))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual([]))
        expect(mocks.queryRecommendedCourses).toHaveBeenCalledTimes(2)
    })
})
