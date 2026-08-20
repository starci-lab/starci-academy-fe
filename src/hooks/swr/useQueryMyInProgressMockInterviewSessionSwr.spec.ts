/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import {
    QUERY_MY_IN_PROGRESS_MOCK_INTERVIEW_SESSION_SWR_KEY,
    useQueryMyInProgressMockInterviewSessionSwr,
} from "./useQueryMyInProgressMockInterviewSessionSwr"

/**
 * What these tests guard: an unfinished interview belongs to ONE learner on ONE course, so both are
 * in the key - resuming somebody else's half-answered interview is the failure this prevents. The
 * course also travels as the enrollment header the backend guard reads.
 *
 * SWR is replaced so the fetcher's own refusal is reachable: the key is null whenever the course is
 * unknown, and a guard nobody can reach is a guard nobody notices breaking.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryMyInProgressMockInterviewSession: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("../../modules/api/graphql/queries/query-my-in-progress-mock-interview-session", () => ({
    queryMyInProgressMockInterviewSession: mocks.queryMyInProgressMockInterviewSession,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One unfinished interview, trimmed to the fields the document selects. */
const session = { id: "session-1", phase: "requirements", questionIndex: 2 }

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.useSWR.mockReset()
    mocks.queryMyInProgressMockInterviewSession.mockReset()
    mocks.queryMyInProgressMockInterviewSession.mockResolvedValue({
        data: { myInProgressMockInterviewSession: { success: true, message: "ok", data: session } },
    })
})

describe("useQueryMyInProgressMockInterviewSessionSwr", () => {
    it("holds the key null until both the viewer and the course are known", () => {
        renderHook(() => useQueryMyInProgressMockInterviewSessionSwr())
        expect(keyOf()).toBeNull()

        setSessionToken(undefined)
        renderHook(() => useQueryMyInProgressMockInterviewSessionSwr("course-1"))
        expect(keyOf()).toBeNull()
    })

    it("names the viewer and the course in the key", () => {
        const hook = renderHook(() => useQueryMyInProgressMockInterviewSessionSwr("course-1"))
        const resting = keyOf()
        expect(resting).toEqual([
            QUERY_MY_IN_PROGRESS_MOCK_INTERVIEW_SESSION_SWR_KEY, expect.any(String), "course-1",
        ])

        hook.rerender()
        act(() => setSessionToken("a-second-viewer"))
        expect(keyOf()).not.toEqual(resting)
    })

    it("sends the course as a field and as the enrollment header, and unwraps the session", async () => {
        renderHook(() => useQueryMyInProgressMockInterviewSessionSwr("course-1"))
        await expect(fetcherOf()()).resolves.toEqual(session)
        expect(mocks.queryMyInProgressMockInterviewSession).toHaveBeenCalledWith({
            request: { courseId: "course-1" },
            headers: { "X-Course-Id": "course-1" },
        })
    })

    it("resolves to null when there is nothing to resume", async () => {
        mocks.queryMyInProgressMockInterviewSession.mockResolvedValue({
            data: { myInProgressMockInterviewSession: { success: false, message: "none" } },
        })
        renderHook(() => useQueryMyInProgressMockInterviewSessionSwr("course-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryMyInProgressMockInterviewSession.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryMyInProgressMockInterviewSessionSwr("course-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("refuses to look for an interview on no course", async () => {
        renderHook(() => useQueryMyInProgressMockInterviewSessionSwr(undefined))
        await expect(fetcherOf()()).rejects.toThrow("Course id not found")
        expect(mocks.queryMyInProgressMockInterviewSession).not.toHaveBeenCalled()
    })
})
