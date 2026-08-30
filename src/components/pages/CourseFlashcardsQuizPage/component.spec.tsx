/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { CourseFlashcardsQuizBlockBase, type CourseFlashcardsQuizBlockProps as CourseFlashcardsQuizPageProps } from "@/components/blocks/learn/CourseFlashcardsQuizBlock/component"

/**
 * What these tests guard.
 *
 * Quiz setup is a configuration, not a list: session depth is the learner decision while the server
 * owns the eligible-card draw. A deck that settled empty or
 * failed replaces the whole configuration rather than offering controls that would start nothing.
 */

const makeInput = (): CourseFlashcardsQuizPageProps => ({
    pageState: "setup",
    blockState: "ready",
    props: {
        title: "Flashcards",
        subtitle: "Quiz",
        reviewLabel: "Review",
        quizLabel: "Quiz",
        setupLabel: "Start",
        historyLabel: "History",
        statsLabel: "Statistics",
        activeView: "setup",
        evidenceTitle: "Recent sessions",
        evidenceRows: [{ id: "one", title: "Run one", description: "4/5 correct", fact: "80%" }],
        configurationTitle: "Session setup",
        workflowTitle: "How Quick quiz works",
        workflowSteps: ["Lock the set", "Save each answer", "Submit once"],
        serverDrawDescription: "The server selects and locks the eligible question set.",
        modeLabel: "Mode",
        quickLabel: "Quick",
        deepLabel: "Deep",
        startLabel: "Start quiz",
        resumeLabel: "Resume session",
        retryLabel: "Retry",
        emptyText: "Empty",
        failedText: "Failed",
        selectedMode: "quick",
        cardCount: 5,
        cardsLabel: "cards available",
    },
    on: { openReview: vi.fn(), selectView: vi.fn(), selectMode: vi.fn(), start: vi.fn(), resume: vi.fn(), retry: vi.fn() },
})

afterEach(cleanup)

describe("CourseFlashcardsQuizBlockBase", () => {
    it("keeps quiz mode and evidence view as independent tab axes", () => {
        const input = makeInput()
        render(<CourseFlashcardsQuizBlockBase {...input} />)
        fireEvent.click(screen.getByText("Statistics"))
        expect(input.on.selectView).toHaveBeenCalledWith("stats")
        expect(input.on.openReview).not.toHaveBeenCalled()
    })

    it("shares the left-aligned page identity and vertical tab hierarchy with review", () => {
        render(<CourseFlashcardsQuizBlockBase {...makeInput()} />)
    })

    it("selects the deep server-owned draw and starts the quiz", () => {
        const input = makeInput()
        render(<CourseFlashcardsQuizBlockBase {...input} />)

        fireEvent.click(screen.getByRole("button", { name: "Deep" }))
        fireEvent.click(screen.getByRole("button", { name: "Start quiz" }))
        expect(input.on.selectMode).toHaveBeenCalledWith("deep")
        expect(input.on.start).toHaveBeenCalledOnce()
    })

    it("keeps the whole configuration standing while the deck count is still arriving", () => {
        const input = makeInput()
        render(<CourseFlashcardsQuizBlockBase {...input} blockState="pending" />)

        expect(screen.queryByText("Empty")).not.toBeInTheDocument()
    })

    it("replaces the configuration with an empty notice that offers no dead start button", () => {
        const input = makeInput()
        render(<CourseFlashcardsQuizBlockBase {...input} blockState="empty" />)

        expect(screen.getByText("Empty")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Start quiz" })).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument()
    })

    it("offers the way back from a failed deck load", () => {
        const input = makeInput()
        render(<CourseFlashcardsQuizBlockBase {...input} blockState="failed" />)

        expect(screen.getByText("Failed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(input.on.retry).toHaveBeenCalledOnce()
    })

    it("resumes an unfinished session and can still leave for the review face", () => {
        const input = makeInput()
        render(
            <CourseFlashcardsQuizBlockBase
                {...input}
                props={{ ...input.props, resumeSessionId: "session-9", selectedMode: "deep" }}
            />,
        )

        expect(screen.getByText("5 cards available")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Resume session" }))
        expect(input.on.resume).toHaveBeenCalledWith("session-9")
        fireEvent.click(screen.getByText("Review"))
        expect(input.on.openReview).toHaveBeenCalledOnce()
    })
})
