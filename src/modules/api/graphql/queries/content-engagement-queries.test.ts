import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import { SortOrder } from "../types"
import {
    QueryContentChallengeAttempts,
    queryContentChallengeAttempts,
    queryContentChallengeAttemptsMap,
} from "./query-content-challenge-attempts"
import {
    QueryContentChallengeFeedbacks,
    queryContentChallengeFeedbacks,
    queryContentChallengeFeedbacksMap,
} from "./query-content-challenge-feedbacks"
import {
    QueryContentChallengeProgress,
    queryContentChallengeProgress,
    queryContentChallengeProgressMap,
} from "./query-content-challenge-progress"
import { QueryContentComments, queryContentComments, queryContentCommentsMap } from "./query-content-comments"
import { QueryContentReactions, queryContentReactions, queryContentReactionsMap } from "./query-content-reactions"

/**
 * What these tests guard for the lesson engagement surfaces: every one of them is viewer-relative,
 * so every one must build the AUTHENTICATED client - an anonymous client here would silently return
 * somebody else's `myReaction` - and each must send its identity untouched under `request`.
 */

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))

vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ query: mocks.query })
})

/** The page window every attempt and feedback list sends. */
const filters = { pageNumber: 0, limit: 10, sorts: [{ by: "createdAt" as const, order: SortOrder.Desc }] }

describe("queryContentChallengeAttempts", () => {
    it("defaults to the only variant and sends the deliverable scope unchanged", async () => {
        const request = { challengeSubmissionId: "submission-1", filters }
        await queryContentChallengeAttempts({ request })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryContentChallengeAttemptsMap[QueryContentChallengeAttempts.Query1],
            variables: { request },
        })
    })

    it("honours an explicitly named variant and forwards the caller's transport options", async () => {
        const signal = new AbortController().signal
        await queryContentChallengeAttempts({
            query: QueryContentChallengeAttempts.Query1,
            request: { challengeSubmissionId: "submission-1", filters },
            headers: { "x-request-id": "req-1" },
            signal,
            debug: true,
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: { "x-request-id": "req-1" },
            signal,
            debug: true,
        })
        expect(mocks.query.mock.calls[0][0].query).toBe(
            queryContentChallengeAttemptsMap[QueryContentChallengeAttempts.Query1],
        )
    })

    it("selects the grading facts the attempt history renders", async () => {
        const document = print(queryContentChallengeAttemptsMap[QueryContentChallengeAttempts.Query1])
        for (const field of ["attemptNumber", "score", "shortFeedback", "processedAt", "submissionUrl", "servedModel", "servedProvider"]) {
            expect(document, field).toContain(field)
        }
    })

    it("preserves transport failures for the history error state", async () => {
        mocks.query.mockRejectedValue(new Error("offline"))
        await expect(
            queryContentChallengeAttempts({ request: { challengeSubmissionId: "submission-1", filters } }),
        ).rejects.toThrow("offline")
    })
})

describe("queryContentChallengeFeedbacks", () => {
    it("defaults to the only variant and scopes the findings to one attempt", async () => {
        const request = { submissionAttemptId: "attempt-1", filters }
        await queryContentChallengeFeedbacks({ request })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryContentChallengeFeedbacksMap[QueryContentChallengeFeedbacks.Query1],
            variables: { request },
        })
    })

    it("honours an explicitly named variant", async () => {
        await queryContentChallengeFeedbacks({
            query: QueryContentChallengeFeedbacks.Query1,
            request: { submissionAttemptId: "attempt-1", filters },
        })
        expect(mocks.query.mock.calls[0][0].query).toBe(
            queryContentChallengeFeedbacksMap[QueryContentChallengeFeedbacks.Query1],
        )
    })

    it("selects the severity and the authored order the findings list sorts by", async () => {
        const document = print(queryContentChallengeFeedbacksMap[QueryContentChallengeFeedbacks.Query1])
        for (const field of ["severity", "sortIndex", "location", "suggestion", "detail"]) {
            expect(document, field).toContain(field)
        }
    })

    it("returns the client's answer unchanged", async () => {
        const result = { data: { userChallengeSubmissionFeedbacks: { success: true, message: "ok" } } }
        mocks.query.mockResolvedValue(result)
        await expect(
            queryContentChallengeFeedbacks({ request: { submissionAttemptId: "attempt-1", filters } }),
        ).resolves.toBe(result)
    })
})

describe("queryContentChallengeProgress", () => {
    it("defaults to the only variant and reads one course's completion tasks", async () => {
        await queryContentChallengeProgress({ request: { courseId: "course-1" } })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryContentChallengeProgressMap[QueryContentChallengeProgress.Query1],
            variables: { request: { courseId: "course-1" } },
        })
    })

    it("honours an explicitly named variant and forwards the abort signal", async () => {
        const signal = new AbortController().signal
        await queryContentChallengeProgress({
            query: QueryContentChallengeProgress.Query1,
            request: { courseId: "course-1" },
            signal,
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal,
            debug: undefined,
        })
    })

    it("selects the score pair and the status the progress ring reads", async () => {
        const document = print(queryContentChallengeProgressMap[QueryContentChallengeProgress.Query1])
        for (const field of ["lastScore", "maxScore", "completed", "status", "numAttempts"]) {
            expect(document, field).toContain(field)
        }
    })
})

describe("queryContentComments", () => {
    it("defaults to the only variant and sends the lesson scope and page window unchanged", async () => {
        const request = { contentId: "content-1", parentCommentId: null, page: 1, limit: 20 }
        await queryContentComments({ request })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryContentCommentsMap[QueryContentComments.Query1],
            variables: { request },
        })
    })

    it("honours an explicitly named variant when listing one thread's replies", async () => {
        await queryContentComments({
            query: QueryContentComments.Query1,
            request: { contentId: "content-1", parentCommentId: "comment-1" },
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({
            request: { contentId: "content-1", parentCommentId: "comment-1" },
        })
    })

    it("carries the reaction summary inline so a comment row needs no second request", async () => {
        const document = print(queryContentCommentsMap[QueryContentComments.Query1])
        expect(document).toContain("replyCount")
        expect(document).toContain("isFounderAuthor")
        expect(document).toContain("myReaction")
        expect(document).toContain("shareCount")
    })
})

describe("queryContentReactions", () => {
    it("defaults to the only variant and reads one lesson from the viewer's perspective", async () => {
        await queryContentReactions({ request: { contentId: "content-1" } })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryContentReactionsMap[QueryContentReactions.Query1],
            variables: { request: { contentId: "content-1" } },
        })
    })

    it("honours an explicitly named variant and forwards headers and the debug flag", async () => {
        await queryContentReactions({
            query: QueryContentReactions.Query1,
            request: { contentId: "content-1" },
            headers: { "x-request-id": "req-1" },
            debug: false,
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: { "x-request-id": "req-1" },
            signal: undefined,
            debug: false,
        })
    })

    it("selects the viewer's own reaction beside the aggregate counts", async () => {
        const document = print(queryContentReactionsMap[QueryContentReactions.Query1])
        for (const field of ["total", "myReaction", "viewCount", "shareCount", "counts"]) {
            expect(document, field).toContain(field)
        }
    })
})
