/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    MUTATE_RATE_FLASHCARD_SWR_KEY,
    MUTATE_SYNC_FLASHCARD_SESSION_SWR_KEY,
    useMutateRateFlashcardSwr,
    useMutateSyncFlashcardSessionSwr,
} from "./useMutateSyncFlashcardSessionSwr"

/**
 * What these tests guard: TWO writes that must not share a key. Saving where the reader is up to
 * and grading one card are different requests at different rates - a shared key would make every
 * grade look like a progress save in flight, and a save cancel a grade halfway through.
 *
 * Each passes its own union member through unchanged: a review snapshot carries graded indexes and
 * XP, a quiz snapshot carries results, and a grade carries one card and one SM-2 score.
 */

const mocks = vi.hoisted(() => ({
    mutationSyncFlashcardSession: vi.fn(),
    mutationRateFlashcard: vi.fn(),
}))

vi.mock("@/modules/api/graphql/mutations/mutation-sync-flashcard-session", () => ({
    mutationSyncFlashcardSession: mocks.mutationSyncFlashcardSession,
    mutationRateFlashcard: mocks.mutationRateFlashcard,
}))

/** What the transport answers for a saved snapshot. */
const synced = {
    data: { syncFlashcardReviewSessionProgress: { success: true, message: "ok", data: { success: true } } },
}

/** What the transport answers for a graded card. */
const rated = {
    data: { rateFlashcard: { success: true, message: "ok", data: { dueAt: "2025-03-02", xpEarned: 3 } } },
}

beforeEach(() => {
    mocks.mutationSyncFlashcardSession.mockReset().mockResolvedValue(synced)
    mocks.mutationRateFlashcard.mockReset().mockResolvedValue(rated)
})

describe("useMutateSyncFlashcardSessionSwr", () => {
    it("keeps its own key, apart from the one a grade uses", () => {
        expect(MUTATE_SYNC_FLASHCARD_SESSION_SWR_KEY).toBe("MUTATE_SYNC_FLASHCARD_SESSION_SWR")
        expect(MUTATE_SYNC_FLASHCARD_SESSION_SWR_KEY).not.toBe(MUTATE_RATE_FLASHCARD_SWR_KEY)
    })

    it("saves nothing until the caller asks it to", () => {
        const { result } = renderHook(() => useMutateSyncFlashcardSessionSwr())
        expect(mocks.mutationSyncFlashcardSession).not.toHaveBeenCalled()
        expect(result.current.isMutating).toBe(false)
    })

    it("passes a review snapshot through as written", async () => {
        const { result } = renderHook(() => useMutateSyncFlashcardSessionSwr())

        const request = {
            mode: "review",
            kind: "deck",
            sessionId: "session-1",
            currentIndex: 4,
            reviewedCount: 4,
            gradedIndexes: [0, 1, 2, 3],
            xpEarned: 12,
        } as const
        await act(async () => {
            await expect(result.current.trigger(request)).resolves.toEqual(synced)
        })
        expect(mocks.mutationSyncFlashcardSession).toHaveBeenCalledWith(request)
    })

    it("passes a quiz snapshot through with its results", async () => {
        const { result } = renderHook(() => useMutateSyncFlashcardSessionSwr())

        const request = {
            mode: "quiz",
            sessionId: "session-1",
            currentIndex: 2,
            results: [{ cardId: "card-1", correctBlanks: 1, totalBlanks: 2 }],
        } as const
        await act(async () => {
            await result.current.trigger(request)
        })
        expect(mocks.mutationSyncFlashcardSession).toHaveBeenCalledWith(request)
    })

    it("reports a transport failure as an error rather than as a saved snapshot", async () => {
        mocks.mutationSyncFlashcardSession.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useMutateSyncFlashcardSessionSwr())

        await act(async () => {
            await expect(result.current.trigger({
                mode: "quiz", sessionId: "session-1", currentIndex: 0, results: [],
            })).rejects.toThrow("offline")
        })
        expect(result.current.error).toBeInstanceOf(Error)
    })
})

describe("useMutateRateFlashcardSwr", () => {
    it("grades nothing until the reader answers a card", () => {
        const { result } = renderHook(() => useMutateRateFlashcardSwr())
        expect(mocks.mutationRateFlashcard).not.toHaveBeenCalled()
        expect(result.current.isMutating).toBe(false)
    })

    it("passes the card, its session and the SM-2 grade through as written", async () => {
        const { result } = renderHook(() => useMutateRateFlashcardSwr())

        const request = { cardId: "card-1", sessionId: "session-1", grade: 3 } as const
        await act(async () => {
            await expect(result.current.trigger(request)).resolves.toEqual(rated)
        })
        expect(mocks.mutationRateFlashcard).toHaveBeenCalledWith(request)
    })

    it("reports a transport failure as an error rather than as a graded card", async () => {
        mocks.mutationRateFlashcard.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useMutateRateFlashcardSwr())

        await act(async () => {
            await expect(result.current.trigger({ cardId: "card-1", sessionId: "session-1", grade: 0 }))
                .rejects.toThrow("offline")
        })
        expect(result.current.error).toBeInstanceOf(Error)
    })
})
