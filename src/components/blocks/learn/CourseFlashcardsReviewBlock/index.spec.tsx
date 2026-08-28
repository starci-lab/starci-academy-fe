/** @vitest-environment jsdom */
import { act, cleanup, render, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { CourseFlashcardsReviewBlockProps as ReviewBaseProps } from "./component"

const mocks = vi.hoisted(() => ({
    input: undefined as ReviewBaseProps | undefined,
    push: vi.fn(),
    trigger: vi.fn(),
    reset: vi.fn(),
    mutateCourse: vi.fn(), mutateDecks: vi.fn(), mutateDue: vi.fn(), mutateStats: vi.fn(), mutateHistory: vi.fn(), mutateReviewStats: vi.fn(),
}))
const storage = new Map<string, string>()

Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
        clear: () => storage.clear(),
        key: (index: number) => [...storage.keys()][index] ?? null,
        get length() { return storage.size },
    },
})

vi.mock("next-intl", () => ({ useLocale: () => "en" }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => ({ data: { id: "course-id" }, error: undefined, mutate: mocks.mutateCourse }) }))
vi.mock("@/hooks/swr/useQueryFlashcardDecksByCourseSwr", () => ({
    useQueryFlashcardDecksByCourseSwr: () => ({ data: [
        { id: "deck-1", title: "Core", description: "Core concepts", difficulty: "hard", dueCount: 1, masteredCount: 0, cards: [{ id: "card-1" }, { id: "card-2" }, { id: "card-3" }, { id: "card-4" }, { id: "card-5" }] },
        { id: "deck-2", title: "Small", description: "Small deck", difficulty: "easy", dueCount: 0, masteredCount: 0, cards: [{ id: "small-1" }, { id: "small-2" }] },
    ], error: undefined, mutate: mocks.mutateDecks }),
    useQueryMyDueFlashcardsSwr: () => ({ data: { dueCount: 2, cards: [{ cardId: "card-2" }, { cardId: "card-other" }] }, error: undefined, mutate: mocks.mutateDue }),
}))
vi.mock("@/hooks/swr/useQueryMyFlashcardStatsSwr", () => ({ useQueryMyFlashcardStatsSwr: () => ({ data: { retentionRate: 0, totalReviewed: 0, currentStreak: 0, longestStreak: 0 }, error: undefined, mutate: mocks.mutateStats }) }))
vi.mock("@/hooks/swr/useQueryMyFlashcardReviewHistorySwr", () => ({ useQueryMyFlashcardReviewHistorySwr: () => ({ data: { items: [] }, error: undefined, mutate: mocks.mutateHistory }) }))
vi.mock("@/hooks/swr/useQueryMyFlashcardReviewStatsSwr", () => ({ useQueryMyFlashcardReviewStatsSwr: () => ({ data: { weakTags: [], deckRetention: [], leechFocus: [] }, error: undefined, mutate: mocks.mutateReviewStats }) }))
vi.mock("@/hooks/swr/useQueryMyInProgressFlashcardSessionSwr", () => ({ useQueryMyInProgressFlashcardSessionSwr: () => ({ data: null }) }))
vi.mock("@/hooks/swr/useMutateStartFlashcardSessionSwr", () => ({ useMutateStartFlashcardSessionSwr: () => ({ trigger: mocks.trigger, reset: mocks.reset, error: undefined, isMutating: false }) }))
vi.mock("./component", () => ({ CourseFlashcardsReviewBlockBase: (props: ReviewBaseProps) => { mocks.input = props; return <output data-testid="review-base" /> } }))

import { CourseFlashcardsReviewBlock } from "./index"

beforeEach(() => {
    window.localStorage.clear()
    mocks.input = undefined
    mocks.trigger.mockReset()
    mocks.trigger.mockResolvedValue(null)
    mocks.reset.mockClear()
    mocks.push.mockClear()
})
afterEach(cleanup)

describe("CourseFlashcardsReviewBlock", () => {
    it("starts the course due queue directly with the exact due card identities", async () => {
        render(<CourseFlashcardsReviewBlock displayId="fullstack-mastery" />)
        act(() => { mocks.input?.on.startDue() })

        await waitFor(() => expect(mocks.trigger).toHaveBeenCalledWith({ mode: "review", kind: "due", courseId: "course-id", cardIds: ["card-2", "card-other"] }))
        expect(mocks.input?.props.modalOpen).toBe(false)
    })

    it("starts a deck due run from the intersection and preserves deck review semantics", async () => {
        render(<CourseFlashcardsReviewBlock displayId="fullstack-mastery" />)
        act(() => { mocks.input?.on.openReview("deck-1") })
        expect(mocks.input?.props.modalOpen).toBe(true)
        act(() => { mocks.input?.on.selectScope("due") })
        act(() => { mocks.input?.on.confirmReview() })

        await waitFor(() => expect(mocks.trigger).toHaveBeenCalledWith({ mode: "review", kind: "deck", deckId: "deck-1", cardIds: ["card-2"], reviewMode: "due" }))
        expect(mocks.input?.props.modalOpen).toBe(true)
    })

    it("defaults to grid, persists list, and restores the reader's deck layout", async () => {
        const { unmount } = render(<CourseFlashcardsReviewBlock displayId="fullstack-mastery" />)
        expect(mocks.input?.props.layout).toBe("grid")

        act(() => { mocks.input?.on.changeLayout("line") })
        await waitFor(() => expect(mocks.input?.props.layout).toBe("line"))
        expect(window.localStorage.getItem("starci.flashcards.review.view")).toBe("line")

        unmount()
        mocks.input = undefined
        render(<CourseFlashcardsReviewBlock displayId="fullstack-mastery" />)
        await waitFor(() => expect(mocks.input?.props.layout).toBe("line"))
    })

    it("marks only decks with a valid quick-quiz draw and routes that deck scope", () => {
        render(<CourseFlashcardsReviewBlock displayId="fullstack-mastery" />)

        expect(mocks.input?.props.decks.map((deck) => [deck.id, deck.quizEligible])).toEqual([
            ["deck-1", true],
            ["deck-2", false],
        ])
        act(() => { mocks.input?.on.openQuiz("deck-1") })
        expect(mocks.push).toHaveBeenCalledWith("/courses/fullstack-mastery/learn/flashcards/quiz?deckId=deck-1")
    })
})
