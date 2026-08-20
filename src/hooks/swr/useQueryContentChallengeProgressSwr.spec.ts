/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import {
    QUERY_CONTENT_CHALLENGE_PROGRESS_SWR_KEY,
    useQueryContentChallengeProgressSwr,
} from "./useQueryContentChallengeProgressSwr"

/**
 * What these tests guard: progress is reached through TWO levels of envelope - the payload carries
 * a `completionTasks` list the caller actually wants - and it belongs to one learner on one course,
 * so both are in the key.
 *
 * SWR is replaced so the fetcher's own refusal is reachable: the key is null whenever the course is
 * unknown, and a guard nobody can reach is a guard nobody notices breaking.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryContentChallengeProgress: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-content-challenge-progress", () => ({
    queryContentChallengeProgress: mocks.queryContentChallengeProgress,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** The rows the caller wants, one level below the payload. */
const completionTasks = [{ challengeSubmissionId: "submission-1", isPassed: true }]

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.useSWR.mockReset()
    mocks.queryContentChallengeProgress.mockReset()
    mocks.queryContentChallengeProgress.mockResolvedValue({
        data: {
            challengeSubmissionProgress: { success: true, message: "ok", data: { completionTasks } },
        },
    })
})

describe("useQueryContentChallengeProgressSwr", () => {
    it("holds the key null until both the course and the viewer are known", () => {
        renderHook(() => useQueryContentChallengeProgressSwr())
        expect(keyOf()).toBeNull()

        setSessionToken(undefined)
        renderHook(() => useQueryContentChallengeProgressSwr("course-1"))
        expect(keyOf()).toBeNull()
    })

    it("names the course and the viewer in the key", () => {
        const hook = renderHook(() => useQueryContentChallengeProgressSwr("course-1"))
        const resting = keyOf()
        expect(resting).toEqual([
            QUERY_CONTENT_CHALLENGE_PROGRESS_SWR_KEY, "course-1", expect.any(String),
        ])

        hook.rerender()
        act(() => setSessionToken("a-second-viewer"))
        expect(keyOf()).not.toEqual(resting)
    })

    it("reaches past both envelopes to the completion rows", async () => {
        renderHook(() => useQueryContentChallengeProgressSwr("course-1"))
        await expect(fetcherOf()()).resolves.toEqual(completionTasks)
        expect(mocks.queryContentChallengeProgress).toHaveBeenCalledWith({
            request: { courseId: "course-1" },
        })
    })

    it("resolves to null when the payload carried no rows", async () => {
        mocks.queryContentChallengeProgress.mockResolvedValue({
            data: { challengeSubmissionProgress: { success: true, message: "ok", data: {} } },
        })
        renderHook(() => useQueryContentChallengeProgressSwr("course-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryContentChallengeProgress.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryContentChallengeProgressSwr("course-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("refuses to read progress for no course", async () => {
        renderHook(() => useQueryContentChallengeProgressSwr(undefined))
        await expect(fetcherOf()()).rejects.toThrow("Course id not found")
        expect(mocks.queryContentChallengeProgress).not.toHaveBeenCalled()
    })
})
