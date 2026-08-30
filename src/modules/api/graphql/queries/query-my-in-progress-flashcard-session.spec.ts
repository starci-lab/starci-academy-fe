import { beforeEach, describe, expect, it, vi } from "vitest"
import { print, type DocumentNode } from "graphql"
import { queryMyInProgressFlashcardSession } from "./query-my-in-progress-flashcard-session"

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ query: mocks.query })
})

/** The single argument Apollo's `query` receives from this module. */
type ApolloQueryOptions = {
    readonly query: DocumentNode
    readonly variables?: Readonly<Record<string, unknown>>
}

/** Answers one named operation, given the variables that operation was sent. */
type OperationResponder = (variables: Readonly<Record<string, unknown>>) => unknown

/**
 * Routes the shared `query` mock by GraphQL operation name, because this module fans one call out
 * across up to three documents and the assertions have to tell them apart by what they asked for.
 */
const route = (routes: Readonly<Record<string, OperationResponder>>) => {
    mocks.query.mockImplementation((options: ApolloQueryOptions) => {
        const printed = print(options.query)
        const operation = Object.keys(routes).find((name) => printed.startsWith(`query ${name}(`))
        return Promise.resolve(operation === undefined ? { data: undefined } : routes[operation](options.variables ?? {}))
    })
}

const envelope = (field: string, data: unknown) => ({ data: { [field]: { success: true, message: "ok", data } } })

const cardsEnvelope = (cards: unknown) => envelope("flashcardCardsByIds", cards === undefined ? undefined : { cards })

const card = {
    cardId: "c-1",
    deckTitle: "Docker",
    front: "What is a layer?",
    back: "A filesystem diff",
    answerAvailable: true,
    level: "easy",
    tags: ["images"],
    nextIntervals: { again: 1, hard: 2, good: 3, easy: 4 },
}

const printedCalls = () =>
    mocks.query.mock.calls.map((call: ReadonlyArray<unknown>) => print((call[0] as ApolloQueryOptions).query))

describe("queryMyInProgressFlashcardSession resolving a review session by id", () => {
    it("hydrates the stored session with its cards and keeps the backend review kind", async () => {
        route({
            MyFlashcardReviewSessionBySessionId: () => envelope("myFlashcardReviewSessionBySessionId", {
                sessionId: "s-1",
                kind: "due",
                deckId: null,
                deckTitle: null,
                cardIds: ["c-1", "c-2"],
                currentIndex: 1,
                reviewedCount: 7,
                gradedIndexes: [0],
                xpEarned: 25,
                updatedAt: "2026-08-19T00:00:00.000Z",
            }),
            FlashcardCardsByIds: () => cardsEnvelope([card]),
        })
        await expect(queryMyInProgressFlashcardSession({
            mode: "review",
            courseId: "course-1",
            sessionId: "s-1",
        })).resolves.toEqual({
            sessionId: "s-1",
            mode: "review",
            kind: "due",
            status: "in_progress",
            cardIds: ["c-1", "c-2"],
            cards: [card],
            currentIndex: 1,
            reviewedCount: 7,
            gradedIndexes: [0],
            results: [],
            xpEarned: 25,
            updatedAt: "2026-08-19T00:00:00.000Z",
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ sessionId: "s-1" })
        expect(mocks.query.mock.calls[1][0].variables).toEqual({ courseId: "course-1", cardIds: ["c-1", "c-2"] })
        expect(printedCalls()[0]).toContain("myFlashcardReviewSessionBySessionId")
        expect(printedCalls()[1]).toContain("nextIntervals")
        expect(printedCalls()[1]).toContain("answerAvailable")
    })

    it("falls back to the deck family and to empty counters when the stored row omits them", async () => {
        route({
            MyFlashcardReviewSessionBySessionId: () => envelope("myFlashcardReviewSessionBySessionId", {
                sessionId: "s-2",
                cardIds: ["c-9"],
                currentIndex: 0,
            }),
        })
        await expect(queryMyInProgressFlashcardSession({ mode: "review", sessionId: "s-2" })).resolves.toEqual({
            sessionId: "s-2",
            mode: "review",
            kind: "deck",
            status: "in_progress",
            cardIds: ["c-9"],
            cards: [],
            currentIndex: 0,
            reviewedCount: 0,
            gradedIndexes: [],
            results: [],
            xpEarned: 0,
        })
        expect(mocks.query.mock.calls[1][0].variables).toEqual({ courseId: undefined, cardIds: ["c-9"] })
    })

    it("answers null and never asks for cards when the stored session is gone", async () => {
        route({ MyFlashcardReviewSessionBySessionId: () => envelope("myFlashcardReviewSessionBySessionId", undefined) })
        await expect(queryMyInProgressFlashcardSession({
            mode: "review",
            courseId: "course-1",
            sessionId: "s-3",
        })).resolves.toBeNull()
        expect(mocks.query).toHaveBeenCalledTimes(1)
    })

    it("answers null when the transport returns no data at all", async () => {
        await expect(queryMyInProgressFlashcardSession({ mode: "review", sessionId: "s-4" })).resolves.toBeNull()
    })
})

describe("queryMyInProgressFlashcardSession resolving a due review session by course", () => {
    it("asks the due document and stamps the due kind even when the row omits it", async () => {
        route({
            MyInProgressFlashcardDueReviewSession: () => envelope("myInProgressFlashcardDueReviewSession", {
                sessionId: "s-due",
                cardIds: ["c-1"],
                currentIndex: 0,
                reviewedCount: 2,
                gradedIndexes: [0, 1],
                xpEarned: 5,
                updatedAt: "2026-08-18T00:00:00.000Z",
            }),
            FlashcardCardsByIds: () => cardsEnvelope(undefined),
        })
        await expect(queryMyInProgressFlashcardSession({
            mode: "review",
            courseId: "course-2",
            reviewKind: "due",
        })).resolves.toEqual({
            sessionId: "s-due",
            mode: "review",
            kind: "due",
            status: "in_progress",
            cardIds: ["c-1"],
            cards: [],
            currentIndex: 0,
            reviewedCount: 2,
            gradedIndexes: [0, 1],
            results: [],
            xpEarned: 5,
            updatedAt: "2026-08-18T00:00:00.000Z",
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ courseId: "course-2" })
        expect(printedCalls()[0]).toContain("myInProgressFlashcardDueReviewSession")
    })

    it("refuses a due lookup with no course and sends nothing", async () => {
        await expect(queryMyInProgressFlashcardSession({ mode: "review", reviewKind: "due" })).resolves.toBeNull()
        expect(mocks.query).not.toHaveBeenCalled()
    })

    it("answers null when the course has no due session in progress", async () => {
        route({ MyInProgressFlashcardDueReviewSession: () => envelope("myInProgressFlashcardDueReviewSession", undefined) })
        await expect(queryMyInProgressFlashcardSession({
            mode: "review",
            courseId: "course-2",
            reviewKind: "due",
        })).resolves.toBeNull()
    })
})

describe("queryMyInProgressFlashcardSession resolving a deck review session", () => {
    it("polls every requested deck and hydrates the first one that answers", async () => {
        route({
            MyInProgressFlashcardReviewSession: (variables) => variables.deckId === "deck-2"
                ? envelope("myInProgressFlashcardReviewSession", {
                    sessionId: "s-deck",
                    cardIds: ["c-1"],
                    currentIndex: 0,
                    reviewedCount: 1,
                    gradedIndexes: [],
                    xpEarned: 3,
                })
                : envelope("myInProgressFlashcardReviewSession", undefined),
            FlashcardCardsByIds: () => cardsEnvelope([card]),
        })
        await expect(queryMyInProgressFlashcardSession({
            mode: "review",
            courseId: "course-3",
            deckIds: ["deck-1", "deck-2"],
        })).resolves.toEqual({
            sessionId: "s-deck",
            mode: "review",
            kind: "deck",
            status: "in_progress",
            cardIds: ["c-1"],
            cards: [card],
            currentIndex: 0,
            reviewedCount: 1,
            gradedIndexes: [],
            results: [],
            xpEarned: 3,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ deckId: "deck-1" })
        expect(mocks.query.mock.calls[1][0].variables).toEqual({ deckId: "deck-2" })
        expect(printedCalls()[0]).toContain("myInProgressFlashcardReviewSession")
    })

    it("promotes a single deck id into the one-deck poll", async () => {
        route({
            MyInProgressFlashcardReviewSession: () => envelope("myInProgressFlashcardReviewSession", {
                sessionId: "s-single",
                cardIds: ["c-1"],
                currentIndex: 0,
                reviewedCount: 0,
                gradedIndexes: [],
                xpEarned: 0,
            }),
        })
        const session = await queryMyInProgressFlashcardSession({ mode: "review", deckId: "deck-7" })
        expect(session?.sessionId).toBe("s-single")
        expect(session?.kind).toBe("deck")
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ deckId: "deck-7" })
    })

    it("answers null and sends nothing when neither a deck nor a deck list is given", async () => {
        await expect(queryMyInProgressFlashcardSession({ mode: "review", courseId: "course-3" })).resolves.toBeNull()
        expect(mocks.query).not.toHaveBeenCalled()
    })

    it("answers null when no polled deck has a session, whether the envelope or the data is missing", async () => {
        route({
            MyInProgressFlashcardReviewSession: (variables) => variables.deckId === "deck-1"
                ? { data: undefined }
                : envelope("myInProgressFlashcardReviewSession", undefined),
        })
        await expect(queryMyInProgressFlashcardSession({
            mode: "review",
            deckIds: ["deck-1", "deck-2"],
        })).resolves.toBeNull()
        expect(mocks.query).toHaveBeenCalledTimes(2)
    })
})

describe("queryMyInProgressFlashcardSession resolving a quiz session", () => {
    const quizData = {
        kind: "ACTIVE_V1",
        sessionId: "q-1",
        contractVersion: 1,
        items: [{
            cardId: "c-1",
            question: "What is a layer?",
            clozeText: "A {{blank:c-1:c1:o1}} diff",
            blanks: [{ blankId: "c-1:c1:o1", hint: "filesystem" }],
            tokens: [{ tokenId: "00000000-0000-4000-8000-000000000001", label: "filesystem" }],
        }],
        currentIndex: 1,
        answerState: [{ blankId: "c-1:c1:o1", tokenId: "00000000-0000-4000-8000-000000000001" }],
        answerVersion: 2,
        status: "in_progress",
        updatedAt: "2026-08-19T10:00:00.000Z",
        deadlineAt: "2026-08-19T11:00:00.000Z",
    }

    it("carries only the server-owned playable projection and saved selections", async () => {
        route({
            MyInProgressFlashcardQuizSession: () => envelope("myInProgressFlashcardQuizSession", quizData),
        })
        await expect(queryMyInProgressFlashcardSession({
            mode: "quiz",
            courseId: "course-4",
            sessionId: "q-1",
        })).resolves.toEqual({
            sessionId: "q-1",
            mode: "quiz",
            kind: undefined,
            status: "in_progress",
            cardIds: ["c-1"],
            cards: [],
            currentIndex: 1,
            reviewedCount: 0,
            gradedIndexes: [],
            results: [],
            xpEarned: 0,
            updatedAt: "2026-08-19T10:00:00.000Z",
            deadlineAt: "2026-08-19T11:00:00.000Z",
            quizItems: quizData.items,
            answerState: quizData.answerState,
            answerVersion: 2,
            recoveryReason: undefined,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ courseId: "course-4" })
        expect(printedCalls()[0]).toContain("myInProgressFlashcardQuizSession")
    })

    it("accepts whatever quiz session the course has when no session id is requested", async () => {
        route({ MyInProgressFlashcardQuizSession: () => envelope("myInProgressFlashcardQuizSession", quizData) })
        const session = await queryMyInProgressFlashcardSession({ mode: "quiz", courseId: "course-4" })
        expect(session?.sessionId).toBe("q-1")
        expect(session?.kind).toBeUndefined()
        expect(session?.cards).toEqual([])
    })

    it("refuses a quiz session whose id is not the one the route asked to resume", async () => {
        route({ MyInProgressFlashcardQuizSession: () => envelope("myInProgressFlashcardQuizSession", quizData) })
        await expect(queryMyInProgressFlashcardSession({
            mode: "quiz",
            courseId: "course-4",
            sessionId: "q-other",
        })).resolves.toBeNull()
        expect(mocks.query).toHaveBeenCalledTimes(1)
    })

    it("answers null when the course has no quiz session in progress", async () => {
        route({ MyInProgressFlashcardQuizSession: () => envelope("myInProgressFlashcardQuizSession", undefined) })
        await expect(queryMyInProgressFlashcardSession({ mode: "quiz", courseId: "course-4" })).resolves.toBeNull()
    })

    it("returns setup recovery as no resumable session", async () => {
        route({ MyInProgressFlashcardQuizSession: () => envelope("myInProgressFlashcardQuizSession", { kind: "RECOVER_TO_SETUP", reason: "SESSION_EXPIRED" }) })
        await expect(queryMyInProgressFlashcardSession({ mode: "quiz", courseId: "course-4" })).resolves.toBeNull()
    })

    it("answers null when the transport returns no data at all", async () => {
        await expect(queryMyInProgressFlashcardSession({ mode: "quiz", courseId: "course-4" })).resolves.toBeNull()
    })

    it("propagates a transport failure to the caller", async () => {
        mocks.query.mockRejectedValue(new Error("session offline"))
        await expect(queryMyInProgressFlashcardSession({ mode: "quiz", courseId: "course-4" })).rejects.toThrow(
            "session offline",
        )
    })
})
