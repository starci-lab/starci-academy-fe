import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import {
    mutationStartFlashcardSession,
    type StartFlashcardDeckReviewSessionRequest,
    type StartFlashcardDueReviewSessionRequest,
    type StartFlashcardQuizSessionRequest,
} from "./mutation-start-flashcard-session"

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), createApolloClient: vi.fn() }))

vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.mutate.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ mutate: mocks.mutate })
})

const sentDocument = (index = 0) => print(mocks.mutate.mock.calls[index][0].mutation)

const deckRequest: StartFlashcardDeckReviewSessionRequest = {
    mode: "review",
    kind: "deck",
    deckId: "deck-1",
    cardIds: ["card-1", "card-2"],
    reviewMode: "full",
}

const dueRequest: StartFlashcardDueReviewSessionRequest = {
    mode: "review",
    kind: "due",
    courseId: "course-1",
    cardIds: ["card-3"],
}

const quizRequest: StartFlashcardQuizSessionRequest = {
    mode: "quiz",
    courseId: "course-1",
    cardIds: ["card-1", "card-2"],
    practiceMode: "quick",
    level: "junior",
    name: "Ôn nhanh",
}

describe("mutationStartFlashcardSession - deck review", () => {
    it("renames reviewMode to the backend's mode argument on the deck document", async () => {
        await mutationStartFlashcardSession(deckRequest)
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        expect(sentDocument()).toContain("startFlashcardReviewSession(request: $request)")
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({
            request: { deckId: "deck-1", cardIds: ["card-1", "card-2"], mode: "full" },
        })
    })

    it("leaves the mode argument undefined when the caller named no review mode", async () => {
        await mutationStartFlashcardSession({ mode: "review", kind: "deck", deckId: "deck-1", cardIds: [] })
        expect(mocks.mutate.mock.calls[0][0].variables.request.mode).toBeUndefined()
    })

    it("stamps the deck family onto the returned identity", async () => {
        mocks.mutate.mockResolvedValue({
            data: { startFlashcardReviewSession: { success: true, message: "ok", data: { sessionId: "s-1" } } },
        })
        await expect(mutationStartFlashcardSession(deckRequest)).resolves.toEqual({
            sessionId: "s-1",
            mode: "review",
            kind: "deck",
        })
    })

    it("returns null when the transport answered without a data root", async () => {
        await expect(mutationStartFlashcardSession(deckRequest)).resolves.toBeNull()
    })

    it("returns null when the deck envelope carried no payload", async () => {
        mocks.mutate.mockResolvedValue({
            data: { startFlashcardReviewSession: { success: false, message: "empty deck", data: undefined } },
        })
        await expect(mutationStartFlashcardSession(deckRequest)).resolves.toBeNull()
    })
})

describe("mutationStartFlashcardSession - due review", () => {
    it("sends the course scope on the due document and never a deck id", async () => {
        await mutationStartFlashcardSession(dueRequest)
        expect(sentDocument()).toContain("startFlashcardDueReviewSession(request: $request)")
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({
            request: { courseId: "course-1", cardIds: ["card-3"] },
        })
        expect(mocks.mutate.mock.calls[0][0].variables.request).not.toHaveProperty("deckId")
    })

    it("stamps the due family onto the returned identity", async () => {
        mocks.mutate.mockResolvedValue({
            data: { startFlashcardDueReviewSession: { success: true, message: "ok", data: { sessionId: "s-2" } } },
        })
        await expect(mutationStartFlashcardSession(dueRequest)).resolves.toEqual({
            sessionId: "s-2",
            mode: "review",
            kind: "due",
        })
    })

    it("returns null when the transport answered without a data root", async () => {
        await expect(mutationStartFlashcardSession(dueRequest)).resolves.toBeNull()
    })

    it("returns null when the due envelope carried no payload", async () => {
        mocks.mutate.mockResolvedValue({
            data: { startFlashcardDueReviewSession: { success: true, message: "nothing due", data: undefined } },
        })
        await expect(mutationStartFlashcardSession(dueRequest)).resolves.toBeNull()
    })
})

describe("mutationStartFlashcardSession - quiz", () => {
    it("renames practiceMode to mode and asks for the deadline the timer needs", async () => {
        await mutationStartFlashcardSession(quizRequest)
        expect(sentDocument()).toContain("startFlashcardQuizSession(request: $request)")
        expect(sentDocument()).toContain("deadlineAt")
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({
            request: {
                courseId: "course-1",
                cardIds: ["card-1", "card-2"],
                mode: "quick",
                level: "junior",
                name: "Ôn nhanh",
            },
        })
    })

    it("sends a null level and an undefined name when the learner named neither", async () => {
        await mutationStartFlashcardSession({
            mode: "quiz",
            courseId: "course-1",
            cardIds: [],
            practiceMode: "deep",
            level: null,
        })
        expect(mocks.mutate.mock.calls[0][0].variables.request.level).toBeNull()
        expect(mocks.mutate.mock.calls[0][0].variables.request.name).toBeUndefined()
        expect(mocks.mutate.mock.calls[0][0].variables.request.mode).toBe("deep")
    })

    it("stamps the quiz mode onto the identity and keeps the server deadline", async () => {
        mocks.mutate.mockResolvedValue({
            data: {
                startFlashcardQuizSession: {
                    success: true,
                    message: "ok",
                    data: { sessionId: "s-3", deadlineAt: "2026-08-19T10:00:00.000Z" },
                },
            },
        })
        await expect(mutationStartFlashcardSession(quizRequest)).resolves.toEqual({
            sessionId: "s-3",
            deadlineAt: "2026-08-19T10:00:00.000Z",
            mode: "quiz",
        })
    })

    it("returns null when the transport answered without a data root", async () => {
        await expect(mutationStartFlashcardSession(quizRequest)).resolves.toBeNull()
    })

    it("returns null when the quiz envelope carried no payload", async () => {
        mocks.mutate.mockResolvedValue({
            data: { startFlashcardQuizSession: { success: false, message: "not enrolled", data: undefined } },
        })
        await expect(mutationStartFlashcardSession(quizRequest)).resolves.toBeNull()
    })

    it("propagates a rejected start", async () => {
        mocks.mutate.mockRejectedValue(new Error("offline"))
        await expect(mutationStartFlashcardSession(quizRequest)).rejects.toThrow("offline")
    })
})
