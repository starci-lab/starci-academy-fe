/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { _CourseFlashcardsQuizPage, type CourseFlashcardsQuizPageProps } from "./component"

const makeInput = (): CourseFlashcardsQuizPageProps => ({
    state: "ready",
    props: {
        title: "Flashcards",
        subtitle: "Quiz",
        reviewLabel: "Review",
        quizLabel: "Quiz",
        configurationTitle: "Session setup",
        modeLabel: "Mode",
        quickLabel: "Quick",
        deepLabel: "Deep",
        levelLabel: "Level",
        allLevelsLabel: "All levels",
        juniorLabel: "Junior",
        middleLabel: "Middle",
        seniorLabel: "Senior",
        staffLabel: "Staff",
        startLabel: "Start quiz",
        resumeLabel: "Resume session",
        retryLabel: "Retry",
        emptyText: "Empty",
        failedText: "Failed",
        selectedMode: "quick",
        selectedLevel: null,
        cardCount: 5,
        cardsLabel: "cards available",
    },
    on: { openReview: vi.fn(), selectMode: vi.fn(), selectLevel: vi.fn(), start: vi.fn(), resume: vi.fn(), retry: vi.fn() },
})

afterEach(cleanup)

describe("_CourseFlashcardsQuizPage", () => {
    it("selects the deep/staff configuration and starts the quiz", () => {
        const input = makeInput()
        render(<_CourseFlashcardsQuizPage {...input} />)

        fireEvent.click(screen.getByRole("button", { name: "Deep" }))
        fireEvent.click(screen.getByRole("button", { name: "Staff" }))
        fireEvent.click(screen.getByRole("button", { name: "Start quiz" }))
        expect(input.on.selectMode).toHaveBeenCalledWith("deep")
        expect(input.on.selectLevel).toHaveBeenCalledWith("staff")
        expect(input.on.start).toHaveBeenCalledOnce()
    })
})
