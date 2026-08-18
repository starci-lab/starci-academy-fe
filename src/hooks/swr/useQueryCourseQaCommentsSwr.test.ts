/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { useQueryCourseQaCommentsSwr } from "./useQueryCourseQaCommentsSwr"

/**
 * What these tests guard: THE SCOPE IS EITHER-OR. A thread has a parent comment and no course; the
 * top level has a course and no parent. Either one is enough to read, and the request drops the
 * course entirely once a thread is named - sending both would ask the server for a thread that
 * also has to belong to a course, which is not a question it answers.
 *
 * Nothing at all is read when neither is present, or before the viewer is known.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryCourseQaComments: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-course-qa-comments", () => ({
    queryCourseQaComments: mocks.queryCourseQaComments,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One page of questions, trimmed to the fields the document selects. */
const page = { data: [{ id: "comment-1", body: "Why two indexes?" }], total: 1 }

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.useSWR.mockReset()
    mocks.queryCourseQaComments.mockReset()
    mocks.queryCourseQaComments.mockResolvedValue({
        data: { contentComments: { success: true, message: "ok", data: page } },
    })
})

describe("useQueryCourseQaCommentsSwr", () => {
    it("reads nothing when neither a course nor a thread was named", () => {
        renderHook(() => useQueryCourseQaCommentsSwr())
        expect(keyOf()).toBeNull()
    })

    it("reads nothing before the viewer is known", () => {
        setSessionToken(undefined)
        renderHook(() => useQueryCourseQaCommentsSwr({ courseId: "course-1" }))
        expect(keyOf()).toBeNull()
    })

    it("accepts a thread on its own, with no course at all", () => {
        renderHook(() => useQueryCourseQaCommentsSwr({ parentCommentId: "comment-1" }))
        expect(keyOf()).toEqual([
            "QUERY_COURSE_QA_COMMENTS_SWR", undefined, "comment-1", 1, 20, expect.any(String),
        ])
    })

    it("gives the top level, a thread, a page and a limit their own cache entries", () => {
        renderHook(() => useQueryCourseQaCommentsSwr({ courseId: "course-1" }))
        const topLevel = keyOf()
        expect(topLevel).toEqual([
            "QUERY_COURSE_QA_COMMENTS_SWR", "course-1", null, 1, 20, expect.any(String),
        ])

        renderHook(() => useQueryCourseQaCommentsSwr({ courseId: "course-1", page: 2 }))
        expect(keyOf()).not.toEqual(topLevel)

        renderHook(() => useQueryCourseQaCommentsSwr({ courseId: "course-1", limit: 5 }))
        expect(keyOf()).not.toEqual(topLevel)
    })

    it("re-reads under a new key when the viewer changes", () => {
        const hook = renderHook(() => useQueryCourseQaCommentsSwr({ courseId: "course-1" }))
        const resting = keyOf()
        hook.rerender()
        act(() => setSessionToken("a-second-viewer"))
        expect(keyOf()).not.toEqual(resting)
    })

    it("sends the course only while reading the top level", async () => {
        renderHook(() => useQueryCourseQaCommentsSwr({ courseId: "course-1" }))
        await expect(fetcherOf()()).resolves.toEqual(page)
        expect(mocks.queryCourseQaComments).toHaveBeenCalledWith({
            request: { courseId: "course-1", parentCommentId: null, page: 1, limit: 20 },
        })
    })

    it("drops the course from the request once a thread is named", async () => {
        renderHook(() => useQueryCourseQaCommentsSwr({
            courseId: "course-1", parentCommentId: "comment-1", page: 2, limit: 5,
        }))
        await fetcherOf()()
        expect(mocks.queryCourseQaComments).toHaveBeenCalledWith({
            request: { parentCommentId: "comment-1", page: 2, limit: 5 },
        })
    })

    it("resolves to null when the server answered without a page", async () => {
        mocks.queryCourseQaComments.mockResolvedValue({
            data: { contentComments: { success: false, message: "not found" } },
        })
        renderHook(() => useQueryCourseQaCommentsSwr({ courseId: "course-1" }))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryCourseQaComments.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryCourseQaCommentsSwr({ courseId: "course-1" }))
        await expect(fetcherOf()()).resolves.toBeNull()
    })
})
