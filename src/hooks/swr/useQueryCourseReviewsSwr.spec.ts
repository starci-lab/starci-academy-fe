/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_COURSE_REVIEWS_SWR_KEY, useQueryCourseReviewsSwr } from "./useQueryCourseReviewsSwr"

/**
 * What these tests guard: the DELIBERATE ABSENCE of the viewer from this key, which is the
 * opposite of the price hook beside it. A rating is the same for everybody, so signing in must NOT
 * refetch and must not create a second cache entry - and a signed-out reader, the one this request
 * exists for, must be served.
 */

const mocks = vi.hoisted(() => ({ queryCourseReviews: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-course-reviews", () => ({
    queryCourseReviews: mocks.queryCourseReviews,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** Which course a rerendering test is reading reviews for. */
interface CourseProps {
    /** The course under the cursor. */
    courseId: string
}

/** One page of reviews, trimmed to the fields the document selects. */
const page = { averageRating: 4.6, total: 2, items: [{ reviewId: "review-1", rating: 5 }] }

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { courseReviews: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken(undefined)
    mocks.queryCourseReviews.mockReset()
    mocks.queryCourseReviews.mockResolvedValue(responseWith(page))
})

describe("QUERY_COURSE_REVIEWS_SWR_KEY", () => {
    it("is a stable prefix a written review can revalidate against", () => {
        expect(QUERY_COURSE_REVIEWS_SWR_KEY).toBe("QUERY_COURSE_REVIEWS_SWR")
    })
})

describe("useQueryCourseReviewsSwr", () => {
    it("does not fetch before a course is known", () => {
        const { result } = renderHook(() => useQueryCourseReviewsSwr(), { wrapper })
        expect(mocks.queryCourseReviews).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
    })

    it("serves a signed-out reader, because that is who reads reviews", async () => {
        const { result } = renderHook(() => useQueryCourseReviewsSwr("course-1"), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(page))
        expect(mocks.queryCourseReviews).toHaveBeenCalledWith({ request: { courseId: "course-1" } })
    })

    it("does not read again when a reader signs in, because a rating is not personal", async () => {
        const { result } = renderHook(() => useQueryCourseReviewsSwr("course-1"), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(page))

        act(() => setSessionToken("token-under-test"))
        await waitFor(() => expect(result.current.data).toEqual(page))
        expect(mocks.queryCourseReviews).toHaveBeenCalledTimes(1)
    })

    it("reads a second course under its own key", async () => {
        const { rerender, result } = renderHook(
            ({ courseId }: CourseProps) => useQueryCourseReviewsSwr(courseId),
            { wrapper, initialProps: { courseId: "course-1" } },
        )
        await waitFor(() => expect(result.current.data).toEqual(page))

        const other = { averageRating: 3, total: 1, items: [] }
        mocks.queryCourseReviews.mockResolvedValue(responseWith(other))
        rerender({ courseId: "course-2" })

        await waitFor(() => expect(result.current.data).toEqual(other))
        expect(mocks.queryCourseReviews).toHaveBeenLastCalledWith({ request: { courseId: "course-2" } })
    })

    it("resolves to null when the server answered without a payload", async () => {
        mocks.queryCourseReviews.mockResolvedValue({
            data: { courseReviews: { success: false, message: "not found", error: "COURSE_NOT_FOUND" } },
        })
        const { result } = renderHook(() => useQueryCourseReviewsSwr("course-1"), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryCourseReviews.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryCourseReviewsSwr("course-1"), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as an unrated course", async () => {
        mocks.queryCourseReviews.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryCourseReviewsSwr("course-1"), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })
})
