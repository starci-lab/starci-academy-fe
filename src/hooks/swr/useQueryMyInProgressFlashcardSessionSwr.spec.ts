/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    QUERY_MY_IN_PROGRESS_FLASHCARD_SESSION_SWR_KEY,
    useQueryMyInProgressFlashcardSessionSwr,
} from "./useQueryMyInProgressFlashcardSessionSwr"

/**
 * What these tests guard: the REVIEW-ONLY fields. The request is a discriminated union - a review
 * session is addressed by deck, by a set of decks and by a review kind, while a quiz session is
 * addressed by course alone - and those three slots are deliberately left empty for a quiz rather
 * than carried across. Getting that wrong would let a quiz resume the review the reader abandoned,
 * which is a different set of cards entirely.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryMyInProgressFlashcardSession: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-my-in-progress-flashcard-session", () => ({
    queryMyInProgressFlashcardSession: mocks.queryMyInProgressFlashcardSession,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One unfinished session, trimmed to the fields the document selects. */
const session = { id: "session-1", cardIndex: 4 }

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryMyInProgressFlashcardSession.mockReset().mockResolvedValue(session)
})

describe("useQueryMyInProgressFlashcardSessionSwr", () => {
    it("reads nothing before a request is known", () => {
        renderHook(() => useQueryMyInProgressFlashcardSessionSwr())
        expect(keyOf()).toBeNull()
    })

    it("carries the review-only fields into the key for a review session", () => {
        renderHook(() => useQueryMyInProgressFlashcardSessionSwr({
            mode: "review",
            courseId: "course-1",
            deckId: "deck-1",
            deckIds: ["deck-1", "deck-2"],
            sessionId: "session-1",
            reviewKind: "due",
        }))
        expect(keyOf()).toEqual([
            QUERY_MY_IN_PROGRESS_FLASHCARD_SESSION_SWR_KEY,
            "review", "course-1", "deck-1", "deck-1,deck-2", "session-1", "due",
        ])
    })

    it("leaves the review-only slots empty for a quiz session", () => {
        renderHook(() => useQueryMyInProgressFlashcardSessionSwr({
            mode: "quiz",
            courseId: "course-1",
            sessionId: "session-1",
        }))
        expect(keyOf()).toEqual([
            QUERY_MY_IN_PROGRESS_FLASHCARD_SESSION_SWR_KEY,
            "quiz", "course-1", undefined, undefined, "session-1", undefined,
        ])
    })

    it("leaves the deck-set slot empty for a review that names no decks", () => {
        renderHook(() => useQueryMyInProgressFlashcardSessionSwr({
            mode: "review",
            courseId: "course-1",
            reviewKind: "due",
        }))
        expect(keyOf()).toEqual([
            QUERY_MY_IN_PROGRESS_FLASHCARD_SESSION_SWR_KEY,
            "review", "course-1", undefined, undefined, undefined, "due",
        ])
    })

    it("passes the request through unchanged and hands back what the query module returns", async () => {
        const request = { mode: "quiz", courseId: "course-1" } as const
        renderHook(() => useQueryMyInProgressFlashcardSessionSwr(request))
        await expect(fetcherOf()()).resolves.toEqual(session)
        expect(mocks.queryMyInProgressFlashcardSession).toHaveBeenCalledWith(request)
    })
})
