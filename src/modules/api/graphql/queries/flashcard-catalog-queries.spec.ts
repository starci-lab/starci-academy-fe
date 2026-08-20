import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import { queryFlashcardDecksByCourse, queryMyDueFlashcards } from "./query-flashcard-decks-by-course"
import { queryMyFlashcardStats } from "./query-my-flashcard-stats"

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ query: mocks.query })
})

describe("queryFlashcardDecksByCourse", () => {
    it("returns the deck rows and selects the viewer counters the overview renders", async () => {
        const decks = [{ id: "deck-1", displayId: "D1", title: "Docker", description: "", difficulty: "easy", sortIndex: 0, dueCount: 3, masteredCount: 1, cards: [] }]
        mocks.query.mockResolvedValue({ data: { flashcardDecksByCourse: { success: true, message: "ok", data: decks } } })
        await expect(queryFlashcardDecksByCourse("course-1")).resolves.toBe(decks)
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        const call = mocks.query.mock.calls[0][0]
        expect(call.variables).toEqual({ courseId: "course-1" })
        const document = print(call.query)
        for (const field of ["dueCount", "masteredCount", "cards {"]) {
            expect(document).toContain(field)
        }
    })

    it("answers null when the transport returns no data at all", async () => {
        await expect(queryFlashcardDecksByCourse("course-1")).resolves.toBeNull()
    })

    it("answers null when the envelope carries no payload", async () => {
        mocks.query.mockResolvedValue({ data: { flashcardDecksByCourse: { success: false, message: "denied" } } })
        await expect(queryFlashcardDecksByCourse("course-1")).resolves.toBeNull()
    })

    it("propagates a transport failure to the caller", async () => {
        mocks.query.mockRejectedValue(new Error("decks offline"))
        await expect(queryFlashcardDecksByCourse("course-1")).rejects.toThrow("decks offline")
    })
})

describe("queryMyDueFlashcards", () => {
    it("defaults the draw size to fifty cards", async () => {
        await queryMyDueFlashcards("course-1")
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ courseId: "course-1", limit: 50 })
    })

    it("sends an explicitly requested draw size and returns the due payload", async () => {
        const due = { dueCount: 2, cards: [{ cardId: "c-1", deckTitle: "Docker", front: "f", back: "b", level: null, tags: [] }] }
        mocks.query.mockResolvedValue({ data: { myDueFlashcards: { success: true, message: "ok", data: due } } })
        await expect(queryMyDueFlashcards("course-1", 12)).resolves.toBe(due)
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ courseId: "course-1", limit: 12 })
        expect(print(mocks.query.mock.calls[0][0].query)).toContain("dueCount")
    })

    it("answers null when the transport returns no data at all", async () => {
        await expect(queryMyDueFlashcards("course-1", 5)).resolves.toBeNull()
    })

    it("answers null when the envelope carries no payload", async () => {
        mocks.query.mockResolvedValue({ data: { myDueFlashcards: { success: false, message: "denied" } } })
        await expect(queryMyDueFlashcards("course-1")).resolves.toBeNull()
    })

    it("propagates a transport failure to the caller", async () => {
        mocks.query.mockRejectedValue(new Error("due offline"))
        await expect(queryMyDueFlashcards("course-1")).rejects.toThrow("due offline")
    })
})

describe("queryMyFlashcardStats", () => {
    it("returns the viewer statistics and selects the grade distribution", async () => {
        const stats = {
            currentStreak: 4,
            longestStreak: 9,
            retentionRate: 0.8,
            totalReviewed: 120,
            lastReviewedAt: "2026-08-19",
            gradeDistribution: { again: 1, hard: 2, good: 3, easy: 4 },
        }
        mocks.query.mockResolvedValue({ data: { myFlashcardStats: { success: true, message: "ok", data: stats } } })
        await expect(queryMyFlashcardStats()).resolves.toBe(stats)
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        expect(print(mocks.query.mock.calls[0][0].query)).toContain("gradeDistribution {")
    })

    it("answers null when the transport returns no data at all", async () => {
        await expect(queryMyFlashcardStats()).resolves.toBeNull()
    })

    it("answers null when the envelope carries no payload", async () => {
        mocks.query.mockResolvedValue({ data: { myFlashcardStats: { success: false, message: "denied" } } })
        await expect(queryMyFlashcardStats()).resolves.toBeNull()
    })

    it("propagates a transport failure to the caller", async () => {
        mocks.query.mockRejectedValue(new Error("stats offline"))
        await expect(queryMyFlashcardStats()).rejects.toThrow("stats offline")
    })
})
