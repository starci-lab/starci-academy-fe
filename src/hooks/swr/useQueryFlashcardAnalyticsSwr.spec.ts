/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useQueryMyFlashcardReviewHistorySwr } from "./useQueryMyFlashcardReviewHistorySwr"
import { useQueryMyFlashcardReviewStatsSwr } from "./useQueryMyFlashcardReviewStatsSwr"
import { useQueryMyFlashcardQuizHistorySwr } from "./useQueryMyFlashcardQuizHistorySwr"
import { useQueryMyFlashcardQuizStatsSwr } from "./useQueryMyFlashcardQuizStatsSwr"

const mocks = vi.hoisted(() => ({ useSWR: vi.fn() }))
vi.mock("swr", () => ({ default: mocks.useSWR }))

beforeEach(() => mocks.useSWR.mockReset())

describe("flashcard analytics SWR gates", () => {
    it("does not read a hidden or unidentified panel", () => {
        renderHook(() => useQueryMyFlashcardReviewHistorySwr(undefined))
        renderHook(() => useQueryMyFlashcardReviewStatsSwr("course", false))
        renderHook(() => useQueryMyFlashcardQuizHistorySwr(undefined))
        renderHook(() => useQueryMyFlashcardQuizStatsSwr("course", false))
        expect(mocks.useSWR.mock.calls.map((call) => call[0])).toEqual([null, null, null, null])
    })

    it("keys each active panel by course and concern", () => {
        renderHook(() => useQueryMyFlashcardReviewHistorySwr("course"))
        renderHook(() => useQueryMyFlashcardReviewStatsSwr("course"))
        renderHook(() => useQueryMyFlashcardQuizHistorySwr("course"))
        renderHook(() => useQueryMyFlashcardQuizStatsSwr("course"))
        expect(mocks.useSWR.mock.calls.map((call) => call[0])).toEqual([
            ["my-flashcard-review-history", "course"],
            ["my-flashcard-review-stats", "course"],
            ["my-flashcard-quiz-history", "course"],
            ["my-flashcard-quiz-stats", "course"],
        ])
    })
})
