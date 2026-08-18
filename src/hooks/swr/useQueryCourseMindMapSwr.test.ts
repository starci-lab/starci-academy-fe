/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { QUERY_COURSE_MIND_MAP_SWR_KEY, useQueryCourseMindMapSwr } from "./useQueryCourseMindMapSwr"

/**
 * What these tests guard: one course is one map, and no course is no request. The payload field
 * here is NOT optional-chained past - `courseMindMap.data` - so an envelope that arrives without
 * the field at all rejects rather than settling as an empty map, and this pins which of the two
 * this hook does.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryCourseMindMap: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-course-mind-map", () => ({
    queryCourseMindMap: mocks.queryCourseMindMap,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One map, trimmed to the fields the document selects. */
const map = { nodes: [{ id: "node-1", label: "Caching" }], edges: [] }

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryCourseMindMap.mockReset()
    mocks.queryCourseMindMap.mockResolvedValue({
        data: { courseMindMap: { success: true, message: "ok", data: map } },
    })
})

describe("useQueryCourseMindMapSwr", () => {
    it("reads nothing before a course is known", () => {
        renderHook(() => useQueryCourseMindMapSwr())
        expect(keyOf()).toBeNull()
    })

    it("gives each course its own cache entry", () => {
        renderHook(() => useQueryCourseMindMapSwr("course-1"))
        expect(keyOf()).toEqual([QUERY_COURSE_MIND_MAP_SWR_KEY, "course-1"])

        renderHook(() => useQueryCourseMindMapSwr("course-2"))
        expect(keyOf()).toEqual([QUERY_COURSE_MIND_MAP_SWR_KEY, "course-2"])
    })

    it("sends the course and hands back the map, not the envelope", async () => {
        renderHook(() => useQueryCourseMindMapSwr("course-1"))
        await expect(fetcherOf()()).resolves.toEqual(map)
        expect(mocks.queryCourseMindMap).toHaveBeenCalledWith({ request: { courseId: "course-1" } })
    })

    it("resolves to null when the server answered without a map", async () => {
        mocks.queryCourseMindMap.mockResolvedValue({
            data: { courseMindMap: { success: false, message: "not found" } },
        })
        renderHook(() => useQueryCourseMindMapSwr("course-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryCourseMindMap.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryCourseMindMapSwr("course-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })
})
