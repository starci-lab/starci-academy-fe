/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { _CourseFlashcardSessionPage, type CourseFlashcardSessionPageProps } from "./component"

const makeInput = (mode: "review" | "quiz"): CourseFlashcardSessionPageProps => ({
    state: "active",
    data: {
        mode,
        title: mode === "review" ? "Study cards" : "Quick quiz",
        progressText: "Card 1 of 2",
        deckTitle: "Core deck",
        prompt: "What is CQRS?",
        answer: "Command Query Responsibility Segregation",
        answerVisible: true,
        revealLabel: "Reveal answer",
        againLabel: "Again",
        hardLabel: "Hard",
        goodLabel: "Good",
        easyLabel: "Easy",
        correctLabel: "I got it",
        incorrectLabel: "Needs review",
        syncingLabel: "Saving progress",
        completingLabel: "Completing session",
        expiredText: "Expired",
        failedText: "Failed",
        retryLabel: "Try again",
        leaveLabel: "Leave session",
    },
    on: {
        reveal: vi.fn(),
        rate: vi.fn(),
        answerQuiz: vi.fn(),
        retry: vi.fn(),
        leave: vi.fn(),
    },
})

afterEach(cleanup)

describe("_CourseFlashcardSessionPage", () => {
    it("sends the selected SM-2 grade in review mode", () => {
        const input = makeInput("review")
        const { container } = render(<_CourseFlashcardSessionPage {...input} />)

        expect(container.querySelector("[data-node=course-flashcard-session-page]")).toBeTruthy()
        expect(container.querySelector("[data-node=flashcard-session-card]")).toBeTruthy()
        fireEvent.click(screen.getByRole("button", { name: "Good" }))
        expect(input.on.rate).toHaveBeenCalledWith(2)
    })

    it("records the finite quiz outcome in quiz mode", () => {
        const input = makeInput("quiz")
        render(<_CourseFlashcardSessionPage {...input} />)

        fireEvent.click(screen.getByRole("button", { name: "I got it" }))
        expect(input.on.answerQuiz).toHaveBeenCalledWith(true)
    })

    it("offers retry instead of card controls for an expired session", () => {
        const input = { ...makeInput("review"), state: "expired" as const }
        render(<_CourseFlashcardSessionPage {...input} />)

        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(input.on.retry).toHaveBeenCalledOnce()
    })
})
