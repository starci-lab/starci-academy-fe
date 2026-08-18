/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import {
    QUERY_CONTENT_CHALLENGE_ATTEMPTS_SWR_KEY,
    useQueryContentChallengeAttemptsSwr,
} from "./useQueryContentChallengeAttemptsSwr"

/**
 * What these tests guard: the POLLING RULE, which is the whole reason this hook is not a plain
 * read. Grading is asynchronous, so the list keeps refreshing while anything in it is still being
 * judged and stops the moment nothing is - a rule that never stopped would poll a finished page
 * forever, and one that never started would leave a submission looking permanently unjudged.
 *
 * SWR is replaced so both the interval rule and the fetcher's own refusal are reachable: the key is
 * null whenever the course or the submission is unknown.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryContentChallengeAttempts: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-content-challenge-attempts", () => ({
    queryContentChallengeAttempts: mocks.queryContentChallengeAttempts,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** How often SWR was told to read again, given a set of attempts. */
const intervalFor = (attempts: unknown): number => {
    const options = mocks.useSWR.mock.calls.at(-1)?.[2] as {
        refreshInterval: (rows: unknown) => number
    }
    return options.refreshInterval(attempts)
}

/** One judged attempt. */
const judged = { id: "attempt-1", attemptNumber: 2, processedAt: "2025-03-01T00:00:00Z" }

/** One attempt still in the queue. */
const pending = { id: "attempt-2", attemptNumber: 3, processedAt: null }

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.useSWR.mockReset()
    mocks.queryContentChallengeAttempts.mockReset()
    mocks.queryContentChallengeAttempts.mockResolvedValue({
        data: {
            userChallengeSubmissionAttempts: {
                success: true, message: "ok", data: { data: [judged], total: 1 },
            },
        },
    })
})

describe("useQueryContentChallengeAttemptsSwr", () => {
    it("holds the key null until the course, the submission and the viewer are all known", () => {
        renderHook(() => useQueryContentChallengeAttemptsSwr())
        expect(keyOf()).toBeNull()

        renderHook(() => useQueryContentChallengeAttemptsSwr("course-1"))
        expect(keyOf()).toBeNull()

        setSessionToken(undefined)
        renderHook(() => useQueryContentChallengeAttemptsSwr("course-1", "submission-1"))
        expect(keyOf()).toBeNull()
    })

    it("names the course, the submission and the viewer in the key", () => {
        const hook = renderHook(() => useQueryContentChallengeAttemptsSwr("course-1", "submission-1"))
        const resting = keyOf()
        expect(resting).toEqual([
            QUERY_CONTENT_CHALLENGE_ATTEMPTS_SWR_KEY, "course-1", "submission-1", expect.any(String),
        ])

        hook.rerender()
        act(() => setSessionToken("a-second-viewer"))
        expect(keyOf()).not.toEqual(resting)
    })

    it("passes the course as the enrollment header and asks newest attempt first", async () => {
        renderHook(() => useQueryContentChallengeAttemptsSwr("course-1", "submission-1"))
        await expect(fetcherOf()()).resolves.toEqual([judged])
        expect(mocks.queryContentChallengeAttempts).toHaveBeenCalledWith({
            request: {
                challengeSubmissionId: "submission-1",
                filters: { pageNumber: 0, limit: 50, sorts: [{ by: "attemptNumber", order: "DESC" }] },
            },
            headers: { "X-Course-Id": "course-1" },
        })
    })

    it("keeps polling while anything is still being judged, and stops when nothing is", () => {
        renderHook(() => useQueryContentChallengeAttemptsSwr("course-1", "submission-1"))

        expect(intervalFor(undefined)).toBe(2_000)
        expect(intervalFor(null)).toBe(2_000)
        expect(intervalFor([])).toBe(2_000)
        expect(intervalFor([judged, pending])).toBe(2_000)
        expect(intervalFor([judged])).toBe(0)
    })

    it("resolves to null when the server answered without a page", async () => {
        mocks.queryContentChallengeAttempts.mockResolvedValue({
            data: { userChallengeSubmissionAttempts: { success: false, message: "denied" } },
        })
        renderHook(() => useQueryContentChallengeAttemptsSwr("course-1", "submission-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryContentChallengeAttempts.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryContentChallengeAttemptsSwr("course-1", "submission-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("refuses to read attempts without both the course and the submission", async () => {
        renderHook(() => useQueryContentChallengeAttemptsSwr(undefined, "submission-1"))
        await expect(fetcherOf()()).rejects.toThrow("Course or challenge submission id not found")

        renderHook(() => useQueryContentChallengeAttemptsSwr("course-1", undefined))
        await expect(fetcherOf()()).rejects.toThrow("Course or challenge submission id not found")
        expect(mocks.queryContentChallengeAttempts).not.toHaveBeenCalled()
    })
})
