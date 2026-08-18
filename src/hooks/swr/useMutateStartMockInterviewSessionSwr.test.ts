/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    MUTATE_START_MOCK_INTERVIEW_SESSION_SWR_KEY,
    useMutateStartMockInterviewSessionSwr,
} from "./useMutateStartMockInterviewSessionSwr"

/**
 * What these tests guard: the COURSE is the enrollment header the backend guard reads, and it comes
 * from the hook's own argument rather than from the request - so a caller cannot draw an interview
 * against a course they are not enrolled in by rewriting the payload.
 *
 * SWR is replaced so the fetcher's own refusal is reachable: the key is null whenever the course is
 * unknown, and a guard nobody can reach is a guard nobody notices breaking.
 */

const mocks = vi.hoisted(() => ({
    useSWRMutation: vi.fn(),
    mutationStartMockInterviewSession: vi.fn(),
}))

vi.mock("swr/mutation", () => ({ default: mocks.useSWRMutation }))
vi.mock("../../modules/api/graphql/mutations/mutation-start-mock-interview-session", () => ({
    mutationStartMockInterviewSession: mocks.mutationStartMockInterviewSession,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWRMutation.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): ((key: unknown, arg: { arg: unknown }) => Promise<unknown>) =>
    mocks.useSWRMutation.mock.calls.at(-1)?.[1]

/** One drawn session, trimmed to the fields the document selects. */
const drawn = {
    data: {
        startMockInterviewSession: {
            success: true, message: "ok", data: { sessionId: "session-1", promptId: "prompt-1" },
        },
    },
}

/** What one draw asks for. */
const request = { courseId: "course-1", level: "mid", mode: "system-design" }

beforeEach(() => {
    mocks.useSWRMutation.mockReset().mockReturnValue({ trigger: vi.fn() })
    mocks.mutationStartMockInterviewSession.mockReset().mockResolvedValue(drawn)
})

describe("useMutateStartMockInterviewSessionSwr", () => {
    it("holds the key null until a course is named", () => {
        useMutateStartMockInterviewSessionSwr()
        expect(keyOf()).toBeNull()
    })

    it("gives each course its own key, so two courses do not share a draw", () => {
        useMutateStartMockInterviewSessionSwr("course-1")
        expect(keyOf()).toEqual([MUTATE_START_MOCK_INTERVIEW_SESSION_SWR_KEY, "course-1"])

        useMutateStartMockInterviewSessionSwr("course-2")
        expect(keyOf()).toEqual([MUTATE_START_MOCK_INTERVIEW_SESSION_SWR_KEY, "course-2"])
    })

    it("sends the request as given and the course as the enrollment header", async () => {
        useMutateStartMockInterviewSessionSwr("course-1")

        await expect(fetcherOf()(keyOf(), { arg: request })).resolves.toEqual(drawn)
        expect(mocks.mutationStartMockInterviewSession).toHaveBeenCalledWith(
            request,
            { headers: { "X-Course-Id": "course-1" } },
        )
    })

    it("refuses to draw an interview without a course to authorise it", async () => {
        useMutateStartMockInterviewSessionSwr(undefined)
        await expect(fetcherOf()(null, { arg: request })).rejects.toThrow("Course id not found")
        expect(mocks.mutationStartMockInterviewSession).not.toHaveBeenCalled()
    })

    it("lets a transport failure through as a rejection rather than as a drawn session", async () => {
        mocks.mutationStartMockInterviewSession.mockRejectedValue(new Error("offline"))
        useMutateStartMockInterviewSessionSwr("course-1")
        await expect(fetcherOf()(keyOf(), { arg: request })).rejects.toThrow("offline")
    })
})
