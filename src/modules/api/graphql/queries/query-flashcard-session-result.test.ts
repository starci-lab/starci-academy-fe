import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import { queryFlashcardSessionResult } from "./query-flashcard-session-result"

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ query: mocks.query })
})

const reviewEnvelope = (data: unknown) => ({
    data: { myFlashcardReviewSessionStatsBySessionId: { success: true, message: "ok", data } },
})

const quizEnvelope = (data: unknown) => ({
    data: { myFlashcardQuizSessionBySessionId: { success: true, message: "ok", data } },
})

describe("queryFlashcardSessionResult in review mode", () => {
    it("scores the session from the grade counts and renames weak tags to a value series", async () => {
        mocks.query.mockResolvedValue(reviewEnvelope({
            sessionId: "s-1",
            status: "completed",
            reviewedCount: 10,
            durationSeconds: 240,
            xpEarned: 35,
            nextDueAt: "2026-08-20",
            gradeCounts: { again: 1, hard: 1, good: 5, easy: 3 },
            weakTags: [{ tag: "networking", forgotCount: 4 }, { tag: "volumes", forgotCount: 2 }],
        }))
        await expect(queryFlashcardSessionResult("review", "s-1")).resolves.toEqual({
            sessionId: "s-1",
            mode: "review",
            status: "completed",
            reviewedCount: 10,
            durationSeconds: 240,
            xpEarned: 35,
            nextDueAt: "2026-08-20",
            gradeCounts: { again: 1, hard: 1, good: 5, easy: 3 },
            scorePercent: 80,
            weakTags: [{ tag: "networking", value: 4 }, { tag: "volumes", value: 2 }],
            results: [],
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        const call = mocks.query.mock.calls[0][0]
        expect(call.variables).toEqual({ sessionId: "s-1" })
        expect(print(call.query)).toContain("myFlashcardReviewSessionStatsBySessionId")
        expect(print(call.query)).toContain("forgotCount")
    })

    it("guards the division when no card was graded at all", async () => {
        mocks.query.mockResolvedValue(reviewEnvelope({
            sessionId: "s-2",
            status: "abandoned",
            reviewedCount: 0,
            durationSeconds: null,
            xpEarned: 0,
            nextDueAt: null,
            gradeCounts: { again: 0, hard: 0, good: 0, easy: 0 },
            weakTags: [],
        }))
        const result = await queryFlashcardSessionResult("review", "s-2")
        expect(result?.scorePercent).toBe(0)
        expect(result?.weakTags).toEqual([])
        expect(result?.results).toEqual([])
    })

    it("answers null when the review projection has no payload", async () => {
        mocks.query.mockResolvedValue(reviewEnvelope(undefined))
        await expect(queryFlashcardSessionResult("review", "s-3")).resolves.toBeNull()
    })

    it("answers null when the transport returns no data at all", async () => {
        await expect(queryFlashcardSessionResult("review", "s-4")).resolves.toBeNull()
    })

    it("propagates a review transport failure to the caller", async () => {
        mocks.query.mockRejectedValue(new Error("review offline"))
        await expect(queryFlashcardSessionResult("review", "s-1")).rejects.toThrow("review offline")
    })
})

describe("queryFlashcardSessionResult in quiz mode", () => {
    it("reads the answered count as the reviewed count and scales coverage into a percent", async () => {
        const results = [{ cardId: "c-1", correctBlanks: 2, totalBlanks: 3 }]
        mocks.query.mockResolvedValue(quizEnvelope({
            sessionId: "q-1",
            status: "completed",
            coverage: 0.72,
            xpEarned: 18,
            answeredCount: 6,
            durationSeconds: 300,
            weakTags: [{ tag: "images", coverage: 0.25 }],
            results,
        }))
        await expect(queryFlashcardSessionResult("quiz", "q-1")).resolves.toEqual({
            sessionId: "q-1",
            mode: "quiz",
            status: "completed",
            coverage: 0.72,
            xpEarned: 18,
            answeredCount: 6,
            durationSeconds: 300,
            reviewedCount: 6,
            scorePercent: 72,
            weakTags: [{ tag: "images", value: 25 }],
            results,
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        const call = mocks.query.mock.calls[0][0]
        expect(call.variables).toEqual({ sessionId: "q-1" })
        expect(print(call.query)).toContain("myFlashcardQuizSessionBySessionId")
        expect(print(call.query)).toContain("answeredCount")
    })

    it("falls back to zero coverage when the backend reports none", async () => {
        mocks.query.mockResolvedValue(quizEnvelope({
            sessionId: "q-2",
            status: "completed",
            coverage: null,
            xpEarned: 0,
            answeredCount: 0,
            durationSeconds: null,
            weakTags: [],
            results: [],
        }))
        const result = await queryFlashcardSessionResult("quiz", "q-2")
        expect(result?.scorePercent).toBe(0)
        expect(result?.reviewedCount).toBe(0)
    })

    it("answers null when the quiz projection has no payload", async () => {
        mocks.query.mockResolvedValue(quizEnvelope(undefined))
        await expect(queryFlashcardSessionResult("quiz", "q-3")).resolves.toBeNull()
    })

    it("answers null when the transport returns no data at all", async () => {
        await expect(queryFlashcardSessionResult("quiz", "q-4")).resolves.toBeNull()
    })

    it("propagates a quiz transport failure to the caller", async () => {
        mocks.query.mockRejectedValue(new Error("quiz offline"))
        await expect(queryFlashcardSessionResult("quiz", "q-1")).rejects.toThrow("quiz offline")
    })
})
