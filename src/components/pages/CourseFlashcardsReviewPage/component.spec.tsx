/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { CourseFlashcardsReviewPageBase, type CourseFlashcardsReviewPageProps } from "./component"

/**
 * What these tests guard.
 *
 * The review overview promises one cross-deck session at the top and the decks under it. The due
 * card only offers an action there is something to do - an unfinished session resumes, a non-empty
 * queue starts, an empty queue offers neither - and a deck list that has not settled rests as decks
 * rather than as a notice.
 */

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

describe("CourseFlashcardsReviewPageBase", () => {
    it("starts the cross-deck due session and a selected deck", () => {
        const input = makeInput()
        const { container } = render(<CourseFlashcardsReviewPageBase {...input} />)

        expect(container.querySelector("[data-node=course-flashcards-review-page]")).toBeTruthy()
        expect(container.querySelectorAll("[data-node=flashcard-review-deck-card]")).toHaveLength(1)
        const startButtons = screen.getAllByRole("button", { name: "Start" })
        fireEvent.click(startButtons[0])
        fireEvent.click(startButtons[1])
        expect(input.on.startDue).toHaveBeenCalledOnce()
        expect(input.on.startDeck).toHaveBeenCalledWith("deck-1")
        expect(screen.getByText("2 day streak · 80% retention")).toBeInTheDocument()
        expect(screen.getByText("5 cards · 3 due · 1 mastered")).toBeInTheDocument()
    })

    it("rests four deck cards and withholds the due card until the queue is known", () => {
        const input = makeInput()
        const { container } = render(<CourseFlashcardsReviewPageBase {...input} state="pending" />)

        expect(container.querySelectorAll("[data-node=flashcard-review-deck-card]")).toHaveLength(4)
        expect(container.querySelector("[data-node=flashcard-review-due-card]")).toBeNull()
        expect(screen.queryByText("Review progress")).not.toBeInTheDocument()
        expect(container.querySelectorAll("[data-component=Button][data-loading=true]")).toHaveLength(4)
    })

    it("replaces the whole overview when nothing is due and nothing is published", () => {
        const input = makeInput()
        const { container } = render(<CourseFlashcardsReviewPageBase {...input} state="empty" />)

        expect(screen.getByText("Empty")).toBeInTheDocument()
        expect(container.querySelector("[data-node=flashcard-review-deck-card]")).toBeNull()
        expect(screen.queryByText("Decks")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument()
    })

    it("offers the way back from a failed deck load", () => {
        const input = makeInput()
        render(<CourseFlashcardsReviewPageBase {...input} state="failed" />)

        expect(screen.getByText("Failed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(input.on.retry).toHaveBeenCalledOnce()
    })

    it("resumes an unfinished session instead of starting a new one", () => {
        const input = makeInput()
        const { container } = render(
            <CourseFlashcardsReviewPageBase
                {...input}
                props={{ ...input.props, resumeSessionId: "session-4" }}
            />,
        )

        const dueCard = container.querySelector("[data-node=flashcard-review-due-card]")
        expect(dueCard?.querySelector("[data-component=Button]")).toHaveTextContent("Resume session")
        fireEvent.click(screen.getByRole("button", { name: "Resume session" }))
        expect(input.on.resume).toHaveBeenCalledWith("session-4")
    })

    it("leaves the due card actionless when the queue is empty and still routes to the quiz face", () => {
        const input = makeInput()
        const { container } = render(
            <CourseFlashcardsReviewPageBase {...input} props={{ ...input.props, dueCount: 0, decks: [] }} />,
        )

        const dueCard = container.querySelector("[data-node=flashcard-review-due-card]")
        expect(dueCard).toBeTruthy()
        expect(screen.getByText("0 due")).toBeInTheDocument()
        expect(dueCard?.querySelector("[data-component=Button]")).toBeNull()
        expect(container.querySelectorAll("[data-node=flashcard-review-deck-card]")).toHaveLength(0)
        fireEvent.click(screen.getByText("Quiz"))
        expect(input.on.openQuiz).toHaveBeenCalledOnce()
    })
})
