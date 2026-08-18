/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    MUTATE_GRADE_MOCK_INTERVIEW_SESSION_SWR_KEY,
    useMutateGradeMockInterviewSessionSwr,
} from "./useMutateGradeMockInterviewSessionSwr"

/**
 * What these tests guard: grading is keyed by COURSE AND SESSION together, because one learner can
 * hold interviews on two courses at once and a shared key would let one final grading cancel the
 * other. The course is also the enrollment header the backend guard reads.
 *
 * SWR is replaced so the fetcher's own refusal is reachable: the key is null whenever either half
 * is unknown, and a guard nobody can reach is a guard nobody notices breaking.
 */

const mocks = vi.hoisted(() => ({
    useSWRMutation: vi.fn(),
    mutationGradeMockInterviewSession: vi.fn(),
}))

vi.mock("swr/mutation", () => ({ default: mocks.useSWRMutation }))
vi.mock("../../modules/api/graphql/mutations/mutation-grade-mock-interview-session", () => ({
    mutationGradeMockInterviewSession: mocks.mutationGradeMockInterviewSession,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWRMutation.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): ((key: unknown, arg: { arg: unknown }) => Promise<unknown>) =>
    mocks.useSWRMutation.mock.calls.at(-1)?.[1]

/** One verdict, trimmed to the fields the document selects. */
const graded = {
    data: {
        gradeMockInterviewSession: {
            success: true, message: "ok", data: { overallScore: 78, verdict: "hire" },
        },
    },
}

/** What one final grading asks for. */
const request = {
    courseId: "course-1",
    promptId: "prompt-1",
    promptTitle: "Distributed cache",
    sessionId: "session-1",
    turns: [{ role: "user", phase: "requirements", content: "About a million reads a day." }],
}

beforeEach(() => {
    mocks.useSWRMutation.mockReset().mockReturnValue({ trigger: vi.fn() })
    mocks.mutationGradeMockInterviewSession.mockReset().mockResolvedValue(graded)
})

describe("useMutateGradeMockInterviewSessionSwr", () => {
    it("holds the key null until both the course and the session are known", () => {
        useMutateGradeMockInterviewSessionSwr()
        expect(keyOf()).toBeNull()

        useMutateGradeMockInterviewSessionSwr("course-1")
        expect(keyOf()).toBeNull()

        useMutateGradeMockInterviewSessionSwr(undefined, "session-1")
        expect(keyOf()).toBeNull()
    })

    it("names the course and the session together in the key", () => {
        useMutateGradeMockInterviewSessionSwr("course-1", "session-1")
        expect(keyOf()).toEqual([
            MUTATE_GRADE_MOCK_INTERVIEW_SESSION_SWR_KEY, "course-1", "session-1",
        ])

        useMutateGradeMockInterviewSessionSwr("course-1", "session-2")
        expect(keyOf()).toEqual([
            MUTATE_GRADE_MOCK_INTERVIEW_SESSION_SWR_KEY, "course-1", "session-2",
        ])
    })

    it("sends the transcript as given and the course as the enrollment header", async () => {
        useMutateGradeMockInterviewSessionSwr("course-1", "session-1")

        await expect(fetcherOf()(keyOf(), { arg: request })).resolves.toEqual(graded)
        expect(mocks.mutationGradeMockInterviewSession).toHaveBeenCalledWith(
            request,
            { headers: { "X-Course-Id": "course-1" } },
        )
    })

    it("refuses to grade without a course to authorise it", async () => {
        useMutateGradeMockInterviewSessionSwr(undefined, "session-1")
        await expect(fetcherOf()(null, { arg: request })).rejects.toThrow("Course id not found")
        expect(mocks.mutationGradeMockInterviewSession).not.toHaveBeenCalled()
    })

    it("lets a transport failure through as a rejection rather than as a verdict", async () => {
        mocks.mutationGradeMockInterviewSession.mockRejectedValue(new Error("offline"))
        useMutateGradeMockInterviewSessionSwr("course-1", "session-1")
        await expect(fetcherOf()(keyOf(), { arg: request })).rejects.toThrow("offline")
    })
})
