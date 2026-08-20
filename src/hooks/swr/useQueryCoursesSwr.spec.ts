/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest"
import { createElement, type PropsWithChildren } from "react"
import { renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { SortBy, SortOrder } from "../../modules/api/graphql/types"
import { QUERY_COURSES_SWR_KEY, useQueryCoursesSwr } from "./useQueryCoursesSwr"

/**
 * What these tests guard: that the filters reach the query AND the cache key. A hook that
 * passed the filters down but keyed on the prefix alone would look correct on first load and
 * then serve page one for every page, which is the exact bug the key design here prevents.
 */

/** The only part of a courses call these tests read: which page was asked for. */
type PagedCoursesCall = { readonly request: { readonly filters: { readonly pageNumber?: number } } }

const mocks = vi.hoisted(() => ({
    queryCourses: vi.fn(),
    defaultCoursesSorts: [{ by: "title", order: "ASC" }],
}))

vi.mock("../../modules/api/graphql/queries/query-courses", () => ({
    queryCourses: mocks.queryCourses,
    defaultCoursesSorts: mocks.defaultCoursesSorts,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) =>
    createElement(
        SWRConfig,
        { value: { provider: () => new Map(), dedupingInterval: 0 } },
        children,
    )

/** One row, trimmed to the fields the document selects. */
const row = {
    id: "course-1",
    displayId: "C-001",
    title: "Systems Design",
    slug: "systems-design",
    description: "How large systems are actually put together.",
    originalPrice: 1990000,
    enrollmentCount: 42,
    isEnrolled: null,
}

/** A healthy response carrying one page of one row. */
const page = { count: 1, data: [row] }

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({ data: { courses: { success: true, message: "ok", data } } })

beforeEach(() => {
    mocks.queryCourses.mockReset()
    mocks.queryCourses.mockResolvedValue(responseWith(page))
})

describe("QUERY_COURSES_SWR_KEY", () => {
    it("is a stable prefix a caller can revalidate against", () => {
        expect(QUERY_COURSES_SWR_KEY).toBe("QUERY_COURSES_SWR")
    })
})

describe("useQueryCoursesSwr", () => {
    it("hands back the page payload, not the envelope", async () => {
        const { result } = renderHook(() => useQueryCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(page))
    })

    it("sends the default sort when the caller has no opinion", async () => {
        const { result } = renderHook(() => useQueryCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(page))
        expect(mocks.queryCourses.mock.calls[0][0]).toEqual({
            request: { filters: { sorts: mocks.defaultCoursesSorts } },
        })
    })

    it("passes the caller's filters straight through to the query", async () => {
        const filters = {
            pageNumber: 2,
            limit: 12,
            sorts: [{ by: SortBy.CreatedAt, order: SortOrder.Desc }],
        }
        const { result } = renderHook(() => useQueryCoursesSwr({ filters }), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(page))
        expect(mocks.queryCourses.mock.calls[0][0]).toEqual({ request: { filters } })
    })

    it("caches two different pages separately instead of one overwriting the other", async () => {
        const sorts = [{ by: SortBy.Title, order: SortOrder.Asc }]
        const firstPage = { count: 2, data: [row] }
        const secondPage = { count: 2, data: [{ ...row, id: "course-2" }] }
        mocks.queryCourses.mockImplementation(async (params: PagedCoursesCall) =>
            responseWith(params.request.filters.pageNumber === 1 ? secondPage : firstPage))

        const one = renderHook(
            () => useQueryCoursesSwr({ filters: { pageNumber: 0, sorts } }),
            { wrapper },
        )
        await waitFor(() => expect(one.result.current.data).toEqual(firstPage))

        const two = renderHook(
            () => useQueryCoursesSwr({ filters: { pageNumber: 1, sorts } }),
            { wrapper },
        )
        await waitFor(() => expect(two.result.current.data).toEqual(secondPage))
        expect(one.result.current.data).toEqual(firstPage)
        expect(mocks.queryCourses).toHaveBeenCalledTimes(2)
    })

    it("resolves to null when the server answered without a page", async () => {
        mocks.queryCourses.mockResolvedValue({
            data: { courses: { success: false, message: "nope", error: "FORBIDDEN" } },
        })
        const { result } = renderHook(() => useQueryCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as an empty list", async () => {
        mocks.queryCourses.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("exposes the SWR surface a component needs", async () => {
        const { result } = renderHook(() => useQueryCoursesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(page))
        expect(result.current.mutate).toBeTypeOf("function")
        expect(result.current.isLoading).toBe(false)
    })
})
