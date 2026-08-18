/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import {
    QUERY_COURSE_PERSONAL_PROJECT_SWR_KEY,
    useQueryCoursePersonalProjectSwr,
} from "./useQueryCoursePersonalProjectSwr"

/**
 * What these tests guard: a personal project is the most personal thing on the course - the
 * learner's own repository and their own graded tasks - so the viewer comes FIRST in the key, and
 * nothing is read at all until both the viewer and the course are known.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryCoursePersonalProject: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-course-personal-project", () => ({
    queryCoursePersonalProject: mocks.queryCoursePersonalProject,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One project, trimmed to the fields the document selects. */
const project = { githubUrl: "https://github.com/learner/project", tasks: [] }

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.useSWR.mockReset()
    mocks.queryCoursePersonalProject.mockReset().mockResolvedValue(project)
})

describe("useQueryCoursePersonalProjectSwr", () => {
    it("holds the key null until both the course and the viewer are known", () => {
        renderHook(() => useQueryCoursePersonalProjectSwr())
        expect(keyOf()).toBeNull()

        setSessionToken(undefined)
        renderHook(() => useQueryCoursePersonalProjectSwr("fullstack-mastery"))
        expect(keyOf()).toBeNull()
    })

    it("names the viewer and the course in the key", () => {
        const hook = renderHook(() => useQueryCoursePersonalProjectSwr("fullstack-mastery"))
        const resting = keyOf()
        expect(resting).toEqual([
            QUERY_COURSE_PERSONAL_PROJECT_SWR_KEY, expect.any(String), "fullstack-mastery",
        ])

        renderHook(() => useQueryCoursePersonalProjectSwr("systems-design"))
        expect(keyOf()).not.toEqual(resting)

        hook.rerender()
        act(() => setSessionToken("a-second-viewer"))
        expect(keyOf()).not.toEqual(resting)
    })

    it("passes the display id to the query module and hands back what it returns", async () => {
        renderHook(() => useQueryCoursePersonalProjectSwr("fullstack-mastery"))
        await expect(fetcherOf()()).resolves.toEqual(project)
        expect(mocks.queryCoursePersonalProject).toHaveBeenCalledWith("fullstack-mastery")
    })

    it("asks for an empty course rather than the word undefined if it is ever run without one", async () => {
        renderHook(() => useQueryCoursePersonalProjectSwr())
        await fetcherOf()()
        expect(mocks.queryCoursePersonalProject).toHaveBeenCalledWith("")
    })
})
