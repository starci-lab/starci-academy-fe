/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_COURSE_PRICE_PREVIEW_SWR_KEY, useQueryCoursePricePreviewSwr } from "./useQueryCoursePricePreviewSwr"

/**
 * What these tests guard: BOTH halves of the key must be known before anything is asked for. A
 * price is personal - the loyalty tier reads from how many courses this learner already joined -
 * so a guest makes no request at all, and a change of viewer re-prices rather than leaving the
 * previous learner's figure on a card.
 *
 * The fetcher also reads the course id back OFF the key rather than closing over the parameter,
 * which is why the id in flight and the id in the key cannot disagree after a re-render.
 */

const mocks = vi.hoisted(() => ({ queryCoursePricePreview: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-course-price-preview", () => ({
    queryCoursePricePreview: mocks.queryCoursePricePreview,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** Which course a rerendering test is pricing. */
interface CourseProps {
    /** The course under the cursor. */
    courseId: string
}

/** One preview, trimmed to the fields the document selects. */
const preview = { basePrice: 990000, finalPrice: 792000, loyaltyDiscountPercent: 20 }

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { coursePricePreview: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.queryCoursePricePreview.mockReset()
    mocks.queryCoursePricePreview.mockResolvedValue(responseWith(preview))
})

describe("QUERY_COURSE_PRICE_PREVIEW_SWR_KEY", () => {
    it("is a stable prefix, so a change of enrolment can reprice every course", () => {
        expect(QUERY_COURSE_PRICE_PREVIEW_SWR_KEY).toBe("QUERY_COURSE_PRICE_PREVIEW_SWR")
    })
})

describe("useQueryCoursePricePreviewSwr", () => {
    it("stays idle for a guest, because the loyalty tier cannot be computed for nobody", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryCoursePricePreviewSwr("course-1"), { wrapper })
        expect(mocks.queryCoursePricePreview).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBeUndefined()
    })

    it("stays idle before a course is known, even with a viewer signed in", () => {
        const { result } = renderHook(() => useQueryCoursePricePreviewSwr(), { wrapper })
        expect(mocks.queryCoursePricePreview).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
    })

    it("prices the course named in the key", async () => {
        const { result } = renderHook(() => useQueryCoursePricePreviewSwr("course-1"), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(preview))
        expect(mocks.queryCoursePricePreview).toHaveBeenCalledWith({ request: { courseId: "course-1" } })
    })

    it("prices a second course under its own key rather than reusing the first", async () => {
        const { rerender, result } = renderHook(
            ({ courseId }: CourseProps) => useQueryCoursePricePreviewSwr(courseId),
            { wrapper, initialProps: { courseId: "course-1" } },
        )
        await waitFor(() => expect(result.current.data).toEqual(preview))

        const other = { basePrice: 490000, finalPrice: 490000, loyaltyDiscountPercent: 0 }
        mocks.queryCoursePricePreview.mockResolvedValue(responseWith(other))
        rerender({ courseId: "course-2" })

        await waitFor(() => expect(result.current.data).toEqual(other))
        expect(mocks.queryCoursePricePreview).toHaveBeenLastCalledWith({ request: { courseId: "course-2" } })
    })

    it("reprices when the viewer changes, so no learner sees another's discount", async () => {
        const { result } = renderHook(() => useQueryCoursePricePreviewSwr("course-1"), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(preview))

        const other = { basePrice: 990000, finalPrice: 990000, loyaltyDiscountPercent: 0 }
        mocks.queryCoursePricePreview.mockResolvedValue(responseWith(other))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual(other))
        expect(mocks.queryCoursePricePreview).toHaveBeenCalledTimes(2)
    })

    it("resolves to null when the server answered without a payload", async () => {
        mocks.queryCoursePricePreview.mockResolvedValue({
            data: { coursePricePreview: { success: false, message: "not found", error: "COURSE_NOT_FOUND" } },
        })
        const { result } = renderHook(() => useQueryCoursePricePreviewSwr("course-1"), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryCoursePricePreview.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryCoursePricePreviewSwr("course-1"), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as a free course", async () => {
        mocks.queryCoursePricePreview.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryCoursePricePreviewSwr("course-1"), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })
})
