/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import {
    QUERY_COURSES_CHECKOUT_PREVIEW_SWR_KEY,
    useQueryCoursesCheckoutPreviewSwr,
} from "./useQueryCoursesCheckoutPreviewSwr"

/**
 * What these tests guard: the SET is part of the key, SORTED. Removing a line re-prices the whole
 * order because the bundle bonus depends on how many courses there are, so a key that ignored the
 * set would show the previous order's totals beside the new list. Sorted, because the same basket
 * read in two orders must be one cache entry and not two.
 *
 * An empty cart asks for nothing at all - there is no order to price.
 */

const mocks = vi.hoisted(() => ({ queryCoursesCheckoutPreview: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-courses-checkout-preview", () => ({
    queryCoursesCheckoutPreview: mocks.queryCoursesCheckoutPreview,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** Which basket a rerendering test is pricing. */
interface BasketProps {
    /** The cart's courses, in whatever order the cart holds them. */
    ids: ReadonlyArray<string>
}

/** One priced order, trimmed to the fields the document selects. */
const totals = { subtotal: 1480000, bundleDiscount: 148000, total: 1332000 }

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { coursesCheckoutPreview: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.queryCoursesCheckoutPreview.mockReset()
    mocks.queryCoursesCheckoutPreview.mockResolvedValue(responseWith(totals))
})

describe("QUERY_COURSES_CHECKOUT_PREVIEW_SWR_KEY", () => {
    it("is a stable array prefix a caller can revalidate by name", () => {
        expect(QUERY_COURSES_CHECKOUT_PREVIEW_SWR_KEY).toEqual(["QUERY_COURSES_CHECKOUT_PREVIEW_SWR"])
    })
})

describe("useQueryCoursesCheckoutPreviewSwr", () => {
    it("prices nothing for an empty cart", () => {
        const { result } = renderHook(() => useQueryCoursesCheckoutPreviewSwr([]), { wrapper })
        expect(mocks.queryCoursesCheckoutPreview).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
    })

    it("prices nothing while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryCoursesCheckoutPreviewSwr(["course-1"]), { wrapper })
        expect(mocks.queryCoursesCheckoutPreview).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
    })

    it("sends the courses sorted, so one basket is one request", async () => {
        const { result } = renderHook(
            () => useQueryCoursesCheckoutPreviewSwr(["course-b", "course-a"]),
            { wrapper },
        )
        await waitFor(() => expect(result.current.data).toEqual(totals))
        expect(mocks.queryCoursesCheckoutPreview).toHaveBeenCalledWith({
            courseIds: ["course-a", "course-b"],
        })
    })

    it("treats the same basket written in another order as the same cache entry", async () => {
        const { rerender, result } = renderHook(
            ({ ids }: BasketProps) => useQueryCoursesCheckoutPreviewSwr(ids),
            { wrapper, initialProps: { ids: ["course-a", "course-b"] } },
        )
        await waitFor(() => expect(result.current.data).toEqual(totals))

        rerender({ ids: ["course-b", "course-a"] })
        await waitFor(() => expect(result.current.data).toEqual(totals))
        expect(mocks.queryCoursesCheckoutPreview).toHaveBeenCalledTimes(1)
    })

    it("re-prices the whole order when a line is removed", async () => {
        const { rerender, result } = renderHook(
            ({ ids }: BasketProps) => useQueryCoursesCheckoutPreviewSwr(ids),
            { wrapper, initialProps: { ids: ["course-a", "course-b"] } },
        )
        await waitFor(() => expect(result.current.data).toEqual(totals))

        const smaller = { subtotal: 990000, bundleDiscount: 0, total: 990000 }
        mocks.queryCoursesCheckoutPreview.mockResolvedValue(responseWith(smaller))
        rerender({ ids: ["course-a"] })

        await waitFor(() => expect(result.current.data).toEqual(smaller))
        expect(mocks.queryCoursesCheckoutPreview).toHaveBeenLastCalledWith({ courseIds: ["course-a"] })
    })

    it("re-prices when the viewer changes, so no basket keeps another learner's totals", async () => {
        const { result } = renderHook(() => useQueryCoursesCheckoutPreviewSwr(["course-a"]), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(totals))

        const other = { subtotal: 1480000, bundleDiscount: 0, total: 1480000 }
        mocks.queryCoursesCheckoutPreview.mockResolvedValue(responseWith(other))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual(other))
        expect(mocks.queryCoursesCheckoutPreview).toHaveBeenCalledTimes(2)
    })

    it("resolves to null when the server answered without totals", async () => {
        mocks.queryCoursesCheckoutPreview.mockResolvedValue({
            data: { coursesCheckoutPreview: { success: false, message: "unavailable", error: "INTERNAL" } },
        })
        const { result } = renderHook(() => useQueryCoursesCheckoutPreviewSwr(["course-a"]), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryCoursesCheckoutPreview.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryCoursesCheckoutPreviewSwr(["course-a"]), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("leaves the rows alone by failing on its own, as an error", async () => {
        mocks.queryCoursesCheckoutPreview.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryCoursesCheckoutPreviewSwr(["course-a"]), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })
})
