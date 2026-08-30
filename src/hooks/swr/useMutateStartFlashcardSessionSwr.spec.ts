/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    MUTATE_START_FLASHCARD_SESSION_SWR_KEY,
    useMutateStartFlashcardSessionSwr,
} from "./useMutateStartFlashcardSessionSwr"

/**
 * What these tests guard: the request is a UNION of three real starts - a single deck review, a
 * cross-deck due review, and a course quiz - and the hook passes whichever it is through unchanged
 * rather than normalising it. Normalising here would be the bug: the three shapes name different
 * things, and a deck review flattened into a course quiz is a different set of cards.
 */

const mocks = vi.hoisted(() => ({ mutationStartFlashcardSession: vi.fn() }))

vi.mock("@/modules/api/graphql/mutations/mutation-start-flashcard-session", () => ({
    mutationStartFlashcardSession: mocks.mutationStartFlashcardSession,
}))

/** What the transport answers for a persisted session. */
const started = {
    data: {
        startFlashcardDeckReviewSession: {
            success: true, message: "ok", data: { sessionId: "session-1", mode: "review", kind: "deck" },
        },
    },
}

beforeEach(() => {
    mocks.mutationStartFlashcardSession.mockReset()
    mocks.mutationStartFlashcardSession.mockResolvedValue(started)
})

describe("MUTATE_START_FLASHCARD_SESSION_SWR_KEY", () => {
    it("is one stable key", () => {
        expect(MUTATE_START_FLASHCARD_SESSION_SWR_KEY).toBe("MUTATE_START_FLASHCARD_SESSION_SWR")
    })
})

describe("useMutateStartFlashcardSessionSwr", () => {
    it("starts nothing until the reader presses", () => {
        const { result } = renderHook(() => useMutateStartFlashcardSessionSwr())
        expect(mocks.mutationStartFlashcardSession).not.toHaveBeenCalled()
        expect(result.current.isMutating).toBe(false)
    })

    it("passes a single-deck review through as written", async () => {
        const { result } = renderHook(() => useMutateStartFlashcardSessionSwr())

        const request = {
            mode: "review", kind: "deck", deckId: "deck-1", cardIds: ["card-1"], reviewMode: "due",
        } as const
        await act(async () => {
            await expect(result.current.trigger(request)).resolves.toEqual(started)
        })
        expect(mocks.mutationStartFlashcardSession).toHaveBeenCalledWith(request)
    })

    it("passes a cross-deck due review through as written", async () => {
        const { result } = renderHook(() => useMutateStartFlashcardSessionSwr())

        const request = {
            mode: "review", kind: "due", courseId: "course-1", cardIds: ["card-1", "card-2"],
        } as const
        await act(async () => {
            await result.current.trigger(request)
        })
        expect(mocks.mutationStartFlashcardSession).toHaveBeenCalledWith(request)
    })

    it("passes a server-owned course quiz draw through as written", async () => {
        const { result } = renderHook(() => useMutateStartFlashcardSessionSwr())

        const request = {
            mode: "quiz",
            courseId: "course-1",
            deckIds: [],
            requestedItemCount: 5,
            startRequestId: "00000000-0000-4000-8000-000000000001",
        } as const
        await act(async () => {
            await result.current.trigger(request)
        })
        expect(mocks.mutationStartFlashcardSession).toHaveBeenCalledWith(request)
    })

    it("reports a transport failure as an error rather than as a started session", async () => {
        mocks.mutationStartFlashcardSession.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useMutateStartFlashcardSessionSwr())

        await act(async () => {
            await expect(result.current.trigger({
                mode: "review", kind: "deck", deckId: "deck-1", cardIds: ["card-1"],
            })).rejects.toThrow("offline")
        })
        expect(result.current.error).toBeInstanceOf(Error)
    })
})
