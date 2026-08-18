/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { _CourseFlashcardsQuizPage, type CourseFlashcardsQuizPageProps } from "./component"

/**
 * What these tests guard.
 *
 * Quiz setup is a configuration, not a list: mode and level are the two decisions, the card count is
 * the fact that justifies them, and starting is the only way out. A deck that settled empty or
 * failed replaces the whole configuration rather than offering controls that would start nothing.
 */

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
        const { container } = render(<_CourseFlashcardsQuizPage {...input} />)

        expect(container.querySelector("[data-node=course-flashcards-quiz-page]")).toBeTruthy()
        expect(container.querySelector("[data-node=flashcard-quiz-configuration]")).toBeTruthy()
        fireEvent.click(screen.getByRole("button", { name: "Deep" }))
        fireEvent.click(screen.getByRole("button", { name: "Staff" }))
        fireEvent.click(screen.getByRole("button", { name: "Start quiz" }))
        expect(input.on.selectMode).toHaveBeenCalledWith("deep")
        expect(input.on.selectLevel).toHaveBeenCalledWith("staff")
        expect(input.on.start).toHaveBeenCalledOnce()
    })

    it("keeps the whole configuration standing while the deck count is still arriving", () => {
        const input = makeInput()
        const { container } = render(<_CourseFlashcardsQuizPage {...input} state="pending" />)

        expect(container.querySelector("[data-node=flashcard-quiz-configuration]")).toBeTruthy()
        expect(container.querySelectorAll("[data-component=Button][data-loading=true]")).toHaveLength(8)
        expect(container.querySelector("[data-component=Heading][data-loading=true]")).toBeTruthy()
        expect(screen.queryByText("Empty")).not.toBeInTheDocument()
    })

    it("replaces the configuration with an empty notice that offers no dead start button", () => {
        const input = makeInput()
        const { container } = render(<_CourseFlashcardsQuizPage {...input} state="empty" />)

        expect(container.querySelector("[data-node=flashcard-quiz-configuration]")).toBeNull()
        expect(screen.getByText("Empty")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Start quiz" })).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument()
    })

    it("offers the way back from a failed deck load", () => {
        const input = makeInput()
        render(<_CourseFlashcardsQuizPage {...input} state="failed" />)

        expect(screen.getByText("Failed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(input.on.retry).toHaveBeenCalledOnce()
    })

    it("resumes an unfinished session and can still leave for the review face", () => {
        const input = makeInput()
        render(
            <_CourseFlashcardsQuizPage
                {...input}
                props={{ ...input.props, resumeSessionId: "session-9", selectedMode: "deep", selectedLevel: "senior" }}
            />,
        )

        expect(screen.getByText("5 cards available")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Resume session" }))
        expect(input.on.resume).toHaveBeenCalledWith("session-9")
        fireEvent.click(screen.getByText("Review"))
        expect(input.on.openReview).toHaveBeenCalledOnce()
    })
})
