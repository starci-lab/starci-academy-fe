/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    MUTATE_COMPLETE_FLASHCARD_SESSION_SWR_KEY,
    useMutateCompleteFlashcardSessionSwr,
} from "./useMutateCompleteFlashcardSessionSwr"

/**
 * What these tests guard: the completion is a UNION - a review closes with a reviewed count and the
 * XP it earned, a quiz closes with its scored answers - and the hook passes whichever it is through
 * unchanged. This is the write that ends a session, so it must never fire on a render.
 */

const mocks = vi.hoisted(() => ({ mutationCompleteFlashcardSession: vi.fn() }))

vi.mock("@/modules/api/graphql/mutations/mutation-complete-flashcard-session", () => ({
    mutationCompleteFlashcardSession: mocks.mutationCompleteFlashcardSession,
}))

/** What the transport answers for a closed session. */
const completed = {
    data: {
        completeFlashcardReviewSession: {
            success: true, message: "ok", data: { reviewedCount: 20, xpEarned: 60 },
        },
    },
}

beforeEach(() => {
    mocks.mutationCompleteFlashcardSession.mockReset()
    mocks.mutationCompleteFlashcardSession.mockResolvedValue(completed)
})

describe("MUTATE_COMPLETE_FLASHCARD_SESSION_SWR_KEY", () => {
    it("is one stable key", () => {
        expect(MUTATE_COMPLETE_FLASHCARD_SESSION_SWR_KEY).toBe("MUTATE_COMPLETE_FLASHCARD_SESSION_SWR")
    })
})

describe("useMutateCompleteFlashcardSessionSwr", () => {
    it("closes nothing until the caller asks it to", () => {
        const { result } = renderHook(() => useMutateCompleteFlashcardSessionSwr())
        expect(mocks.mutationCompleteFlashcardSession).not.toHaveBeenCalled()
        expect(result.current.isMutating).toBe(false)
    })

    it("passes a review completion through as written", async () => {
        const { result } = renderHook(() => useMutateCompleteFlashcardSessionSwr())

        const request = {
            mode: "review", kind: "due", sessionId: "session-1", reviewedCount: 20, xpEarned: 60,
        } as const
        await act(async () => {
            await expect(result.current.trigger(request)).resolves.toEqual(completed)
        })
        expect(mocks.mutationCompleteFlashcardSession).toHaveBeenCalledWith(request)
    })

    it("passes a quiz completion through with its scored answers", async () => {
        const { result } = renderHook(() => useMutateCompleteFlashcardSessionSwr())

        const request = {
            mode: "quiz",
            sessionId: "session-1",
            courseId: "course-1",
            answers: [{ cardId: "card-1", correctBlanks: 2, totalBlanks: 3 }],
        } as const
        await act(async () => {
            await result.current.trigger(request)
        })
        expect(mocks.mutationCompleteFlashcardSession).toHaveBeenCalledWith(request)
    })

    it("reports a transport failure as an error rather than as a closed session", async () => {
        mocks.mutationCompleteFlashcardSession.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useMutateCompleteFlashcardSessionSwr())

        await act(async () => {
            await expect(result.current.trigger({
                mode: "review", kind: "due", sessionId: "session-1", reviewedCount: 1, xpEarned: 3,
            })).rejects.toThrow("offline")
        })
        expect(result.current.error).toBeInstanceOf(Error)
    })
})
