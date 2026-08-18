import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import { mutationCompleteFlashcardSession } from "./mutation-complete-flashcard-session"

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), createApolloClient: vi.fn() }))

vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.mutate.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ mutate: mocks.mutate })
})

const sentDocument = (index = 0) => print(mocks.mutate.mock.calls[index][0].mutation)

const deckRequest = {
    mode: "review",
    kind: "deck",
    sessionId: "s-1",
    reviewedCount: 12,
    xpEarned: 40,
} as const

const dueRequest = { ...deckRequest, kind: "due" } as const

const quizRequest = {
    mode: "quiz",
    sessionId: "s-2",
    courseId: "course-1",
    answers: [
        { cardId: "card-1", correctBlanks: 2, totalBlanks: 2 },
        { cardId: "card-2", correctBlanks: 1, totalBlanks: 3 },
    ],
} as const

describe("mutationCompleteFlashcardSession - deck review", () => {
    it("sends the deck-review document with only the persisted counters", async () => {
        await mutationCompleteFlashcardSession(deckRequest)
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        expect(sentDocument()).toContain("completeFlashcardReviewSession(request: $request)")
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({
            request: { sessionId: "s-1", reviewedCount: 12, xpEarned: 40 },
        })
    })

    it("returns the server's own counters when the completion carried data", async () => {
        mocks.mutate.mockResolvedValue({
            data: {
                completeFlashcardReviewSession: {
                    success: true,
                    message: "ok",
                    data: { reviewedCount: 12, xpEarned: 45 },
                },
            },
        })
        await expect(mutationCompleteFlashcardSession(deckRequest)).resolves.toEqual({
            reviewedCount: 12,
            xpEarned: 45,
        })
    })

    it("returns null when the transport answered without a data root", async () => {
        await expect(mutationCompleteFlashcardSession(deckRequest)).resolves.toBeNull()
    })

    it("returns null when the envelope arrived but carried no payload", async () => {
        mocks.mutate.mockResolvedValue({
            data: { completeFlashcardReviewSession: { success: false, message: "expired", data: undefined } },
        })
        await expect(mutationCompleteFlashcardSession(deckRequest)).resolves.toBeNull()
    })
})

describe("mutationCompleteFlashcardSession - due review", () => {
    it("switches to the due-review document for the same counter shape", async () => {
        await mutationCompleteFlashcardSession(dueRequest)
        expect(sentDocument()).toContain("completeFlashcardDueReviewSession(request: $request)")
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({
            request: { sessionId: "s-1", reviewedCount: 12, xpEarned: 40 },
        })
    })

    it("returns the due-review counters when data arrived", async () => {
        mocks.mutate.mockResolvedValue({
            data: {
                completeFlashcardDueReviewSession: {
                    success: true,
                    message: "ok",
                    data: { reviewedCount: 7, xpEarned: 21 },
                },
            },
        })
        await expect(mutationCompleteFlashcardSession(dueRequest)).resolves.toEqual({
            reviewedCount: 7,
            xpEarned: 21,
        })
    })

    it("returns null when the transport answered without a data root", async () => {
        await expect(mutationCompleteFlashcardSession(dueRequest)).resolves.toBeNull()
    })

    it("returns null when the due envelope carried no payload", async () => {
        mocks.mutate.mockResolvedValue({
            data: { completeFlashcardDueReviewSession: { success: false, message: "gone", data: undefined } },
        })
        await expect(mutationCompleteFlashcardSession(dueRequest)).resolves.toBeNull()
    })
})

describe("mutationCompleteFlashcardSession - quiz", () => {
    it("sends the scored answer set on the quiz document, and no review counters", async () => {
        await mutationCompleteFlashcardSession(quizRequest)
        expect(sentDocument()).toContain("completeFlashcardQuizSession(request: $request)")
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({
            request: { sessionId: "s-2", courseId: "course-1", answers: quizRequest.answers },
        })
        expect(mocks.mutate.mock.calls[0][0].variables.request).not.toHaveProperty("reviewedCount")
    })

    it("derives reviewedCount from the answer count, because the quiz document only returns xp", async () => {
        mocks.mutate.mockResolvedValue({
            data: { completeFlashcardQuizSession: { success: true, message: "ok", data: { xpEarned: 30 } } },
        })
        await expect(mutationCompleteFlashcardSession(quizRequest)).resolves.toEqual({
            reviewedCount: 2,
            xpEarned: 30,
        })
    })

    it("returns null when the transport answered without a data root", async () => {
        await expect(mutationCompleteFlashcardSession(quizRequest)).resolves.toBeNull()
    })

    it("returns null when the quiz envelope carried no payload", async () => {
        mocks.mutate.mockResolvedValue({
            data: { completeFlashcardQuizSession: { success: false, message: "expired", data: undefined } },
        })
        await expect(mutationCompleteFlashcardSession(quizRequest)).resolves.toBeNull()
    })

    it("propagates a rejected completion", async () => {
        mocks.mutate.mockRejectedValue(new Error("offline"))
        await expect(mutationCompleteFlashcardSession(quizRequest)).rejects.toThrow("offline")
    })
})
