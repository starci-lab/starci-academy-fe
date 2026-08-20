import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import {
    queryMockInterviewAttemptBySession,
    queryMockInterviewAttemptBySessionMap,
    QueryMockInterviewAttemptBySession,
} from "./query-mock-interview-attempt-by-session"
import {
    queryMyInProgressMockInterviewSession,
    queryMyInProgressMockInterviewSessionMap,
    QueryMyInProgressMockInterviewSession,
} from "./query-my-in-progress-mock-interview-session"

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ query: mocks.query })
})

describe("queryMockInterviewAttemptBySession", () => {
    it("selects the graded breakdown the result page renders", () => {
        const document = print(queryMockInterviewAttemptBySessionMap[QueryMockInterviewAttemptBySession.Query1])
        for (const field of ["phaseScores {", "attributeScores {", "questionReviews {", "followUpQuestion", "verdict"]) {
            expect(document).toContain(field)
        }
    })

    it("flattens the request into two top-level variables rather than a request wrapper", async () => {
        await queryMockInterviewAttemptBySession({ request: { courseId: "course-1", sessionId: "session-9" } })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryMockInterviewAttemptBySessionMap[QueryMockInterviewAttemptBySession.Query1],
            variables: { courseId: "course-1", sessionId: "session-9" },
        })
        expect(mocks.query.mock.calls[0][0].variables).not.toHaveProperty("request")
    })

    it("forwards an explicit variant with its transport options", async () => {
        const signal = new AbortController().signal
        await queryMockInterviewAttemptBySession({
            query: QueryMockInterviewAttemptBySession.Query1,
            request: { courseId: "course-2", sessionId: "session-3" },
            headers: { "x-trace-id": "trace-vi" },
            signal,
            debug: true,
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: { "x-trace-id": "trace-vi" },
            signal,
            debug: true,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ courseId: "course-2", sessionId: "session-3" })
    })

    it("returns the attempt envelope untouched", async () => {
        const result = { data: { myMockInterviewAttemptBySessionId: { success: true, message: "ok", data: null } } }
        mocks.query.mockResolvedValue(result)
        await expect(
            queryMockInterviewAttemptBySession({ request: { courseId: "course-1", sessionId: "session-9" } }),
        ).resolves.toBe(result)
    })

    it("propagates a transport failure to the caller", async () => {
        mocks.query.mockRejectedValue(new Error("attempt offline"))
        await expect(
            queryMockInterviewAttemptBySession({ request: { courseId: "course-1", sessionId: "session-9" } }),
        ).rejects.toThrow("attempt offline")
    })
})

describe("queryMyInProgressMockInterviewSession", () => {
    it("selects the resumable transcript and its deadline", () => {
        const document = print(
            queryMyInProgressMockInterviewSessionMap[QueryMyInProgressMockInterviewSession.Query1],
        )
        for (const field of ["seedQuestions {", "givenCodes {", "turns {", "deadlineAt", "phaseIndex"]) {
            expect(document).toContain(field)
        }
    })

    it("scopes the lookup to the course on an authenticated client", async () => {
        await queryMyInProgressMockInterviewSession({ request: { courseId: "course-1" } })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryMyInProgressMockInterviewSessionMap[QueryMyInProgressMockInterviewSession.Query1],
            variables: { courseId: "course-1" },
        })
    })

    it("forwards an explicit variant with its transport options", async () => {
        const signal = new AbortController().signal
        await queryMyInProgressMockInterviewSession({
            query: QueryMyInProgressMockInterviewSession.Query1,
            request: { courseId: "course-2" },
            headers: { "x-trace-id": "trace-en" },
            signal,
            debug: false,
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: { "x-trace-id": "trace-en" },
            signal,
            debug: false,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ courseId: "course-2" })
    })

    it("returns the session envelope untouched", async () => {
        const result = { data: { myInProgressMockInterviewSession: { success: true, message: "ok", data: null } } }
        mocks.query.mockResolvedValue(result)
        await expect(queryMyInProgressMockInterviewSession({ request: { courseId: "course-1" } })).resolves.toBe(result)
    })

    it("propagates a transport failure to the caller", async () => {
        mocks.query.mockRejectedValue(new Error("session offline"))
        await expect(queryMyInProgressMockInterviewSession({ request: { courseId: "course-1" } })).rejects.toThrow(
            "session offline",
        )
    })
})
