/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { useQueryCourseLeaderboardSwr } from "./useQueryCourseLeaderboardSwr"

/**
 * What these tests guard: the cache identity and the fetcher, read at the seam where the hook hands
 * both to SWR. SWR itself is replaced, which is what makes the fetcher's own refusal reachable -
 * the key is null whenever the course is unknown, so nothing else can ever call it that way, and a
 * guard nobody can reach is a guard nobody notices breaking.
 *
 * The board is per COURSE and per VIEWER: it carries the asking learner's own standing, so two
 * viewers must not share an entry and two courses must not either.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryCourseLeaderboard: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-course-leaderboard", () => ({
    queryCourseLeaderboard: mocks.queryCourseLeaderboard,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** A board, trimmed to the fields the document selects. */
const board = { rows: [{ userId: "user-1", rank: 1, xp: 900 }], viewerRank: 1 }

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.useSWR.mockReset()
    mocks.queryCourseLeaderboard.mockReset()
    mocks.queryCourseLeaderboard.mockResolvedValue({
        data: { courseLeaderboard: { success: true, message: "ok", data: board } },
    })
})

describe("useQueryCourseLeaderboardSwr", () => {
    it("holds the key null until both the course and the viewer are known", () => {
        renderHook(() => useQueryCourseLeaderboardSwr())
        expect(keyOf()).toBeNull()

        setSessionToken(undefined)
        renderHook(() => useQueryCourseLeaderboardSwr("course-1"))
        expect(keyOf()).toBeNull()
    })

    it("names the course and the viewer in the key, so neither is shared", () => {
        const first = renderHook(() => useQueryCourseLeaderboardSwr("course-1"))
        const keyForFirstViewer = keyOf()
        expect(keyForFirstViewer).toEqual(["QUERY_COURSE_LEADERBOARD_SWR", "course-1", expect.any(String)])

        first.rerender()
        act(() => setSessionToken("a-second-viewer"))
        expect(keyOf()).not.toEqual(keyForFirstViewer)

        renderHook(() => useQueryCourseLeaderboardSwr("course-2"))
        expect(keyOf()).not.toEqual(keyForFirstViewer)
    })

    it("asks for one page of standing and hands back the board, not the envelope", async () => {
        renderHook(() => useQueryCourseLeaderboardSwr("course-1"))

        await expect(fetcherOf()()).resolves.toEqual(board)
        expect(mocks.queryCourseLeaderboard).toHaveBeenCalledWith({
            request: { courseId: "course-1", limit: 100 },
        })
    })

    it("resolves to null when the server answered without a board", async () => {
        mocks.queryCourseLeaderboard.mockResolvedValue({
            data: { courseLeaderboard: { success: false, message: "no board", error: "NOT_FOUND" } },
        })
        renderHook(() => useQueryCourseLeaderboardSwr("course-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryCourseLeaderboard.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryCourseLeaderboardSwr("course-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("refuses to read a board for no course rather than asking for everybody's", async () => {
        renderHook(() => useQueryCourseLeaderboardSwr(undefined))
        await expect(fetcherOf()()).rejects.toThrow("Course id not found")
        expect(mocks.queryCourseLeaderboard).not.toHaveBeenCalled()
    })

    it("lets a transport failure through as a rejection rather than as an empty board", async () => {
        mocks.queryCourseLeaderboard.mockRejectedValue(new Error("offline"))
        renderHook(() => useQueryCourseLeaderboardSwr("course-1"))
        await expect(fetcherOf()()).rejects.toThrow("offline")
    })
})
