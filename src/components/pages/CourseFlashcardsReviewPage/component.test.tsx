/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { _CourseFlashcardsReviewPage, type CourseFlashcardsReviewPageProps } from "./component"

const makeInput = (): CourseFlashcardsReviewPageProps => ({
    state: "ready",
    props: {
        title: "Flashcards",
        subtitle: "Review",
        reviewLabel: "Review",
        quizLabel: "Quiz",
        dueTitle: "Due today",
        dueDescription: "Review due cards",
        statsTitle: "Review progress",
        streakText: "2 day streak",
        retentionText: "80% retention",
        decksTitle: "Decks",
        cardsLabel: "cards",
        dueLabel: "due",
        masteredLabel: "mastered",
        startLabel: "Start",
        resumeLabel: "Resume session",
        retryLabel: "Retry",
        emptyText: "Empty",
        failedText: "Failed",
        dueCount: 3,
        decks: [{ id: "deck-1", title: "Core", description: "Core concepts", difficulty: "easy", cardCount: 5, dueCount: 3, masteredCount: 1 }],
    },
    on: { openQuiz: vi.fn(), startDue: vi.fn(), startDeck: vi.fn(), resume: vi.fn(), retry: vi.fn() },
})

afterEach(cleanup)

describe("_CourseFlashcardsReviewPage", () => {
    it("starts the cross-deck due session and a selected deck", () => {
        const input = makeInput()
        const { container } = render(<_CourseFlashcardsReviewPage {...input} />)

        expect(container.querySelector("[data-node=course-flashcards-review-page]")).toBeTruthy()
        expect(container.querySelectorAll("[data-node=flashcard-review-deck-card]")).toHaveLength(1)
        const startButtons = screen.getAllByRole("button", { name: "Start" })
        fireEvent.click(startButtons[0])
        fireEvent.click(startButtons[1])
        expect(input.on.startDue).toHaveBeenCalledOnce()
        expect(input.on.startDeck).toHaveBeenCalledWith("deck-1")
    })
})
