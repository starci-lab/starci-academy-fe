/** @vitest-environment jsdom */
import { renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { QUERY_COURSE_SWR_KEY, useQueryCourseSwr } from "./useQueryCourseSwr"

/**
 * What these tests guard: the two decisions the hook's own header argues for.
 *
 * IT SENDS `displayId` AND NEVER `id`. The server answers a UUID with COURSE_NOT_FOUND for the very
 * course it returned that id for, so the variable name is checked at the wire rather than assumed.
 *
 * TWO COURSES IN ONE SESSION ARE TWO KEYS. Navigating from one course to another must produce a
 * second request, not the first course's detail served from cache while the reader decides whether
 * they are on the right page.
 */

const mocks = vi.hoisted(() => ({ queryCourse: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-course", () => ({
    queryCourse: mocks.queryCourse,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** Which course a rerendering test is standing on. */
interface DisplayIdProps {
    /** The short human-facing identifier the route carries. */
    displayId: string
}

/** One course, trimmed to the fields the document selects. */
const course = { id: "9b1c", displayId: "fullstack-mastery", label: "Fullstack Mastery" }

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { course: { success: true, message: "ok", data } },
})

beforeEach(() => {
    mocks.queryCourse.mockReset()
    mocks.queryCourse.mockResolvedValue(responseWith(course))
})

describe("QUERY_COURSE_SWR_KEY", () => {
    it("is a stable prefix, so every course read can be revalidated at once", () => {
        expect(QUERY_COURSE_SWR_KEY).toBe("QUERY_COURSE_SWR")
    })
})

describe("useQueryCourseSwr", () => {
    it("does not fetch before a display id is known", () => {
        const { result } = renderHook(() => useQueryCourseSwr(), { wrapper })
        expect(mocks.queryCourse).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBeUndefined()
    })

    it("sends the display id and never the primary key", async () => {
        const { result } = renderHook(
            () => useQueryCourseSwr({ displayId: "fullstack-mastery" }),
            { wrapper },
        )
        await waitFor(() => expect(result.current.data).toEqual(course))
        expect(mocks.queryCourse).toHaveBeenCalledWith({ request: { displayId: "fullstack-mastery" } })
    })

    it("reads a second course under its own key rather than serving the first from cache", async () => {
        const { rerender, result } = renderHook(
            ({ displayId }: DisplayIdProps) => useQueryCourseSwr({ displayId }),
            { wrapper, initialProps: { displayId: "fullstack-mastery" } },
        )
        await waitFor(() => expect(result.current.data).toEqual(course))

        const other = { id: "44ab", displayId: "systems-design", label: "Systems Design" }
        mocks.queryCourse.mockResolvedValue(responseWith(other))
        rerender({ displayId: "systems-design" })

        await waitFor(() => expect(result.current.data).toEqual(other))
        expect(mocks.queryCourse).toHaveBeenCalledTimes(2)
        expect(mocks.queryCourse).toHaveBeenLastCalledWith({ request: { displayId: "systems-design" } })
    })

    it("resolves to null for a course the server does not know", async () => {
        mocks.queryCourse.mockResolvedValue({
            data: { course: { success: false, message: "not found", error: "COURSE_NOT_FOUND_EXCEPTION" } },
        })
        const { result } = renderHook(() => useQueryCourseSwr({ displayId: "nope" }), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryCourse.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryCourseSwr({ displayId: "nope" }), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as a missing course", async () => {
        mocks.queryCourse.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(
            () => useQueryCourseSwr({ displayId: "fullstack-mastery" }),
            { wrapper },
        )
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })
})
