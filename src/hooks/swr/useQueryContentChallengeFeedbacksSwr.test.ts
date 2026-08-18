/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import {
    QUERY_CONTENT_CHALLENGE_FEEDBACKS_SWR_KEY,
    useQueryContentChallengeFeedbacksSwr,
} from "./useQueryContentChallengeFeedbacksSwr"

/**
 * What these tests guard: the COURSE travels as a header, not as a request field - the backend
 * enrollment guard reads it there - and the feedback comes back in the order it was written, which
 * is what makes a graded attempt readable rather than a bag of remarks.
 *
 * SWR is replaced so the fetcher's own refusal is reachable: the key is null whenever the course or
 * the attempt is unknown, and a guard nobody can reach is a guard nobody notices breaking.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryContentChallengeFeedbacks: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-content-challenge-feedbacks", () => ({
    queryContentChallengeFeedbacks: mocks.queryContentChallengeFeedbacks,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** The remarks, two levels below the envelope. */
const feedbacks = [{ id: "feedback-1", sortIndex: 0, body: "Add a rate limit" }]

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.useSWR.mockReset()
    mocks.queryContentChallengeFeedbacks.mockReset()
    mocks.queryContentChallengeFeedbacks.mockResolvedValue({
        data: {
            userChallengeSubmissionFeedbacks: {
                success: true, message: "ok", data: { data: feedbacks, total: 1 },
            },
        },
    })
})

describe("useQueryContentChallengeFeedbacksSwr", () => {
    it("holds the key null until the course, the attempt and the viewer are all known", () => {
        renderHook(() => useQueryContentChallengeFeedbacksSwr())
        expect(keyOf()).toBeNull()

        renderHook(() => useQueryContentChallengeFeedbacksSwr("course-1"))
        expect(keyOf()).toBeNull()

        setSessionToken(undefined)
        renderHook(() => useQueryContentChallengeFeedbacksSwr("course-1", "attempt-1"))
        expect(keyOf()).toBeNull()
    })

    it("names the course, the attempt and the viewer in the key", () => {
        const hook = renderHook(() => useQueryContentChallengeFeedbacksSwr("course-1", "attempt-1"))
        const resting = keyOf()
        expect(resting).toEqual([
            QUERY_CONTENT_CHALLENGE_FEEDBACKS_SWR_KEY, "course-1", "attempt-1", expect.any(String),
        ])

        renderHook(() => useQueryContentChallengeFeedbacksSwr("course-1", "attempt-2"))
        expect(keyOf()).not.toEqual(resting)

        hook.rerender()
        act(() => setSessionToken("a-second-viewer"))
        expect(keyOf()).not.toEqual(resting)
    })

    it("passes the course as the enrollment header and asks for the remarks in order", async () => {
        renderHook(() => useQueryContentChallengeFeedbacksSwr("course-1", "attempt-1"))
        await expect(fetcherOf()()).resolves.toEqual(feedbacks)
        expect(mocks.queryContentChallengeFeedbacks).toHaveBeenCalledWith({
            request: {
                submissionAttemptId: "attempt-1",
                filters: { pageNumber: 0, limit: 100, sorts: [{ by: "sortIndex", order: "ASC" }] },
            },
            headers: { "X-Course-Id": "course-1" },
        })
    })

    it("resolves to null when the server answered without a page", async () => {
        mocks.queryContentChallengeFeedbacks.mockResolvedValue({
            data: { userChallengeSubmissionFeedbacks: { success: false, message: "denied" } },
        })
        renderHook(() => useQueryContentChallengeFeedbacksSwr("course-1", "attempt-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryContentChallengeFeedbacks.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryContentChallengeFeedbacksSwr("course-1", "attempt-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("refuses to read feedback without both the course and the attempt", async () => {
        renderHook(() => useQueryContentChallengeFeedbacksSwr(undefined, "attempt-1"))
        await expect(fetcherOf()()).rejects.toThrow("Course or challenge attempt id not found")

        renderHook(() => useQueryContentChallengeFeedbacksSwr("course-1", undefined))
        await expect(fetcherOf()()).rejects.toThrow("Course or challenge attempt id not found")
        expect(mocks.queryContentChallengeFeedbacks).not.toHaveBeenCalled()
    })
})
