/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_COURSE_OUTLINE_SWR_KEY, useQueryCourseOutlineSwr } from "./useQueryCourseOutlineSwr"

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryCourseOutline: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-course-outline", () => ({
    queryCourseOutline: mocks.queryCourseOutline,
}))

const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]
const fetcherOf = (): ((key: readonly [string, string, string]) => Promise<unknown>) =>
    mocks.useSWR.mock.calls.at(-1)?.[1]

beforeEach(() => {
    setSessionToken("viewer-one-token")
    mocks.useSWR.mockReset()
    mocks.queryCourseOutline.mockReset().mockResolvedValue(null)
})

describe("useQueryCourseOutlineSwr", () => {
    it("holds the key null until both viewer and display id are known", () => {
        renderHook(() => useQueryCourseOutlineSwr())
        expect(keyOf()).toBeNull()

        setSessionToken(undefined)
        renderHook(() => useQueryCourseOutlineSwr("system-design-mastery"))
        expect(keyOf()).toBeNull()
    })

    it("names both viewer and display id in the cache key", () => {
        const hook = renderHook(() => useQueryCourseOutlineSwr("system-design-mastery"))
        const firstKey = keyOf()
        expect(firstKey).toEqual([
            QUERY_COURSE_OUTLINE_SWR_KEY,
            expect.any(String),
            "system-design-mastery",
        ])

        act(() => setSessionToken("viewer-two-token"))
        hook.rerender()
        expect(keyOf()).not.toEqual(firstKey)
    })

    it("reads the requested display id back from the SWR key", async () => {
        renderHook(() => useQueryCourseOutlineSwr("system-design-mastery"))
        await fetcherOf()([QUERY_COURSE_OUTLINE_SWR_KEY, "viewer-key", "fullstack-mastery"])
        expect(mocks.queryCourseOutline).toHaveBeenCalledWith("fullstack-mastery")
    })
})
