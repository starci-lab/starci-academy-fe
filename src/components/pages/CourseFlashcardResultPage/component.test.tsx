/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { _CourseFlashcardResultPage, type CourseFlashcardResultPageProps } from "./component"

const makeInput = (): CourseFlashcardResultPageProps => ({
    state: "ready",
    data: {
        mode: "review",
        title: "Review complete",
        subtitle: "Result persisted",
        scoreLabel: "Score",
        scoreText: "75%",
        reviewedLabel: "Cards reviewed",
        reviewedText: "4",
        xpLabel: "XP earned",
        xpText: "8",
        durationLabel: "Duration",
        durationText: "45s",
        nextDueLabel: "Next review",
        nextDueText: "Tomorrow",
        breakdownTitle: "Review breakdown",
        gradeRows: [{ label: "Good", value: 3 }],
        weakTopicsTitle: "Topics to revisit",
        weakTopics: [{ tag: "Redis", value: "1" }],
        failedText: "Failed",
        retryLabel: "Try again",
        retrySessionLabel: "Practice again",
        backLabel: "Back to flashcards",
    },
    on: { retryLoad: vi.fn(), retrySession: vi.fn(), back: vi.fn() },
})

afterEach(cleanup)

describe("_CourseFlashcardResultPage", () => {
    it("renders the persisted score, breakdown, weak topics, and retry path", () => {
        const input = makeInput()
        const { container } = render(<_CourseFlashcardResultPage {...input} />)

        expect(container.querySelector("[data-node=course-flashcard-result-page]")).toBeTruthy()
        expect(container.querySelectorAll("[data-node=flashcard-result-stat]")).toHaveLength(4)
        expect(screen.getByText("75%")).toBeTruthy()
        expect(screen.getByText("Redis")).toBeTruthy()
        expect(screen.getByText("1")).toBeTruthy()
        fireEvent.click(screen.getByRole("button", { name: "Practice again" }))
        expect(input.on.retrySession).toHaveBeenCalledOnce()
    })

    it("uses the load retry action for a failed projection", () => {
        const input = { ...makeInput(), state: "failed" as const }
        render(<_CourseFlashcardResultPage {...input} />)

        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(input.on.retryLoad).toHaveBeenCalledOnce()
    })
})
