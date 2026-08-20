/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import {
    QUERY_MOCK_INTERVIEW_ATTEMPT_BY_SESSION_SWR_KEY,
    useQueryMockInterviewAttemptBySessionSwr,
} from "./useQueryMockInterviewAttemptBySessionSwr"

/**
 * What these tests guard: the course travels BOTH as a request field and as the enrollment header,
 * and the caller decides how often the attempt is re-read - grading is asynchronous, so the result
 * page polls while it waits and the resting caller does not poll at all.
 *
 * SWR is replaced so the fetcher's own refusal is reachable: the key is null whenever the course or
 * the session is unknown, and a guard nobody can reach is a guard nobody notices breaking.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryMockInterviewAttemptBySession: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("../../modules/api/graphql/queries/query-mock-interview-attempt-by-session", () => ({
    queryMockInterviewAttemptBySession: mocks.queryMockInterviewAttemptBySession,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** The options the hook handed SWR on its last render. */
const optionsOf = (): { refreshInterval: number } => mocks.useSWR.mock.calls.at(-1)?.[2]

/** One graded attempt, trimmed to the fields the document selects. */
const attempt = { id: "attempt-1", score: 78, processedAt: "2025-03-01T00:00:00Z" }

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.useSWR.mockReset()
    mocks.queryMockInterviewAttemptBySession.mockReset()
    mocks.queryMockInterviewAttemptBySession.mockResolvedValue({
        data: { myMockInterviewAttemptBySessionId: { success: true, message: "ok", data: attempt } },
    })
})

describe("useQueryMockInterviewAttemptBySessionSwr", () => {
    it("holds the key null until the viewer, the course and the session are all known", () => {
        setSessionToken(undefined)
        renderHook(() => useQueryMockInterviewAttemptBySessionSwr("course-1", "session-1"))
        expect(keyOf()).toBeNull()

        setSessionToken("token-under-test")
        renderHook(() => useQueryMockInterviewAttemptBySessionSwr(undefined, "session-1"))
        expect(keyOf()).toBeNull()

        renderHook(() => useQueryMockInterviewAttemptBySessionSwr("course-1", undefined))
        expect(keyOf()).toBeNull()
    })

    it("names the viewer, the course and the session in the key", () => {
        const hook = renderHook(() => useQueryMockInterviewAttemptBySessionSwr("course-1", "session-1"))
        const resting = keyOf()
        expect(resting).toEqual([
            QUERY_MOCK_INTERVIEW_ATTEMPT_BY_SESSION_SWR_KEY, expect.any(String), "course-1", "session-1",
        ])

        renderHook(() => useQueryMockInterviewAttemptBySessionSwr("course-1", "session-2"))
        expect(keyOf()).not.toEqual(resting)

        hook.rerender()
        act(() => setSessionToken("a-second-viewer"))
        expect(keyOf()).not.toEqual(resting)
    })

    it("rests without polling unless the caller asks for it", () => {
        renderHook(() => useQueryMockInterviewAttemptBySessionSwr("course-1", "session-1"))
        expect(optionsOf().refreshInterval).toBe(0)

        renderHook(() => useQueryMockInterviewAttemptBySessionSwr("course-1", "session-1", 3_000))
        expect(optionsOf().refreshInterval).toBe(3_000)
    })

    it("sends the course as a field and as the enrollment header, and unwraps the attempt", async () => {
        renderHook(() => useQueryMockInterviewAttemptBySessionSwr("course-1", "session-1"))
        await expect(fetcherOf()()).resolves.toEqual(attempt)
        expect(mocks.queryMockInterviewAttemptBySession).toHaveBeenCalledWith({
            request: { courseId: "course-1", sessionId: "session-1" },
            headers: { "X-Course-Id": "course-1" },
        })
    })

    it("resolves to null when the session has not been graded yet", async () => {
        mocks.queryMockInterviewAttemptBySession.mockResolvedValue({
            data: { myMockInterviewAttemptBySessionId: { success: false, message: "not graded" } },
        })
        renderHook(() => useQueryMockInterviewAttemptBySessionSwr("course-1", "session-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryMockInterviewAttemptBySession.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryMockInterviewAttemptBySessionSwr("course-1", "session-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("refuses to read an attempt without both the course and the session", async () => {
        renderHook(() => useQueryMockInterviewAttemptBySessionSwr(undefined, "session-1"))
        await expect(fetcherOf()()).rejects.toThrow("Session id not found")

        renderHook(() => useQueryMockInterviewAttemptBySessionSwr("course-1", undefined))
        await expect(fetcherOf()()).rejects.toThrow("Session id not found")
        expect(mocks.queryMockInterviewAttemptBySession).not.toHaveBeenCalled()
    })
})
