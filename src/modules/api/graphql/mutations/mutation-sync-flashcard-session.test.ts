import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import {
    mutationRateFlashcard,
    mutationSyncFlashcardSession,
    type SyncFlashcardQuizSessionRequest,
    type SyncFlashcardReviewSessionRequest,
} from "./mutation-sync-flashcard-session"

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), createApolloClient: vi.fn() }))

vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.mutate.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ mutate: mocks.mutate })
})

const sentDocument = (index = 0) => print(mocks.mutate.mock.calls[index][0].mutation)

const deckRequest: SyncFlashcardReviewSessionRequest = {
    mode: "review",
    kind: "deck",
    sessionId: "s-1",
    currentIndex: 4,
    reviewedCount: 3,
    gradedIndexes: [0, 1, 2],
    xpEarned: 15,
}

const dueRequest: SyncFlashcardReviewSessionRequest = { ...deckRequest, kind: "due" }

const quizRequest: SyncFlashcardQuizSessionRequest = {
    mode: "quiz",
    sessionId: "s-2",
    currentIndex: 2,
    results: [{ cardId: "card-1", correctBlanks: 1, totalBlanks: 2 }],
}

const reviewVariables = {
    request: {
        sessionId: "s-1",
        currentIndex: 4,
        reviewedCount: 3,
        gradedIndexes: [0, 1, 2],
        xpEarned: 15,
    },
}

describe("mutationSyncFlashcardSession - deck review", () => {
    it("sends the shared review snapshot on the deck-progress document without the routing keys", async () => {
        await mutationSyncFlashcardSession(deckRequest)
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        expect(sentDocument()).toContain("syncFlashcardReviewSessionProgress(request: $request)")
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual(reviewVariables)
        expect(mocks.mutate.mock.calls[0][0].variables.request).not.toHaveProperty("kind")
        expect(mocks.mutate.mock.calls[0][0].variables.request).not.toHaveProperty("mode")
    })

    it("reports true only when the server acknowledged the write", async () => {
        mocks.mutate.mockResolvedValue({
            data: {
                syncFlashcardReviewSessionProgress: { success: true, message: "ok", data: { success: true } },
            },
        })
        await expect(mutationSyncFlashcardSession(deckRequest)).resolves.toBe(true)
    })

    it("reports false when the server acknowledged a refusal", async () => {
        mocks.mutate.mockResolvedValue({
            data: {
                syncFlashcardReviewSessionProgress: { success: true, message: "stale", data: { success: false } },
            },
        })
        await expect(mutationSyncFlashcardSession(deckRequest)).resolves.toBe(false)
    })

    it("reports false when the envelope carried no payload", async () => {
        mocks.mutate.mockResolvedValue({
            data: { syncFlashcardReviewSessionProgress: { success: false, message: "gone", data: undefined } },
        })
        await expect(mutationSyncFlashcardSession(deckRequest)).resolves.toBe(false)
    })

    it("reports false when the transport answered without a data root", async () => {
        await expect(mutationSyncFlashcardSession(deckRequest)).resolves.toBe(false)
    })
})

describe("mutationSyncFlashcardSession - due review", () => {
    it("routes the identical snapshot to the due-progress document", async () => {
        await mutationSyncFlashcardSession(dueRequest)
        expect(sentDocument()).toContain("syncFlashcardDueReviewSessionProgress(request: $request)")
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual(reviewVariables)
    })

    it("reports true on a due acknowledgement", async () => {
        mocks.mutate.mockResolvedValue({
            data: {
                syncFlashcardDueReviewSessionProgress: { success: true, message: "ok", data: { success: true } },
            },
        })
        await expect(mutationSyncFlashcardSession(dueRequest)).resolves.toBe(true)
    })

    it("reports false on a due refusal", async () => {
        mocks.mutate.mockResolvedValue({
            data: {
                syncFlashcardDueReviewSessionProgress: { success: true, message: "stale", data: { success: false } },
            },
        })
        await expect(mutationSyncFlashcardSession(dueRequest)).resolves.toBe(false)
    })

    it("reports false when the due envelope carried no payload", async () => {
        mocks.mutate.mockResolvedValue({
            data: { syncFlashcardDueReviewSessionProgress: { success: false, message: "gone", data: undefined } },
        })
        await expect(mutationSyncFlashcardSession(dueRequest)).resolves.toBe(false)
    })

    it("reports false when the transport answered without a data root", async () => {
        await expect(mutationSyncFlashcardSession(dueRequest)).resolves.toBe(false)
    })
})

describe("mutationSyncFlashcardSession - quiz", () => {
    it("sends the scored results rather than the review counters", async () => {
        await mutationSyncFlashcardSession(quizRequest)
        expect(sentDocument()).toContain("syncFlashcardQuizSessionProgress(request: $request)")
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({
            request: {
                sessionId: "s-2",
                currentIndex: 2,
                results: [{ cardId: "card-1", correctBlanks: 1, totalBlanks: 2 }],
            },
        })
        expect(mocks.mutate.mock.calls[0][0].variables.request).not.toHaveProperty("gradedIndexes")
    })

    it("reports true on a quiz acknowledgement", async () => {
        mocks.mutate.mockResolvedValue({
            data: { syncFlashcardQuizSessionProgress: { success: true, message: "ok", data: { success: true } } },
        })
        await expect(mutationSyncFlashcardSession(quizRequest)).resolves.toBe(true)
    })

    it("reports false on a quiz refusal", async () => {
        mocks.mutate.mockResolvedValue({
            data: { syncFlashcardQuizSessionProgress: { success: true, message: "stale", data: { success: false } } },
        })
        await expect(mutationSyncFlashcardSession(quizRequest)).resolves.toBe(false)
    })

    it("reports false when the quiz envelope carried no payload", async () => {
        mocks.mutate.mockResolvedValue({
            data: { syncFlashcardQuizSessionProgress: { success: false, message: "gone", data: undefined } },
        })
        await expect(mutationSyncFlashcardSession(quizRequest)).resolves.toBe(false)
    })

    it("reports false when the transport answered without a data root", async () => {
        await expect(mutationSyncFlashcardSession(quizRequest)).resolves.toBe(false)
    })

    it("propagates a rejected snapshot write", async () => {
        mocks.mutate.mockRejectedValue(new Error("offline"))
        await expect(mutationSyncFlashcardSession(quizRequest)).rejects.toThrow("offline")
    })
})

describe("mutationRateFlashcard", () => {
    it("sends the SM-2 grade with its session attribution and asks for the schedule back", async () => {
        await mutationRateFlashcard({ cardId: "card-1", sessionId: "s-1", grade: 3 })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        const document = sentDocument()
        expect(document).toContain("reviewFlashcard(request: $request)")
        expect(document).toContain("dueAt")
        expect(document).toContain("xpEarned")
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({
            request: { cardId: "card-1", sessionId: "s-1", grade: 3 },
        })
    })

    it("returns the backend-computed scheduling outcome", async () => {
        mocks.mutate.mockResolvedValue({
            data: {
                reviewFlashcard: {
                    success: true,
                    message: "ok",
                    data: { dueAt: "2026-08-20T00:00:00.000Z", xpEarned: 5 },
                },
            },
        })
        await expect(mutationRateFlashcard({ cardId: "card-1", sessionId: "s-1", grade: 0 })).resolves.toEqual({
            dueAt: "2026-08-20T00:00:00.000Z",
            xpEarned: 5,
        })
    })

    it("returns null when the grade envelope carried no payload", async () => {
        mocks.mutate.mockResolvedValue({
            data: { reviewFlashcard: { success: false, message: "not in session", data: undefined } },
        })
        await expect(mutationRateFlashcard({ cardId: "card-1", sessionId: "s-1", grade: 1 })).resolves.toBeNull()
    })

    it("returns null when the transport answered without a data root", async () => {
        await expect(mutationRateFlashcard({ cardId: "card-1", sessionId: "s-1", grade: 2 })).resolves.toBeNull()
    })
})
