/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { CourseFlashcardsQuizBlockView as CourseFlashcardsQuizBlockBase, type CourseFlashcardsQuizProps as CourseFlashcardsQuizPageProps } from "@/components/blocks/learn/CourseFlashcardsQuizBlock/component"

/**
 * What these tests guard.
 *
 * Quiz setup is a configuration, not a list: mode and level are the two decisions, the card count is
 * the fact that justifies them, and starting is the only way out. A deck that settled empty or
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
        sessionNameLabel: "Session name",
        sessionNamePlaceholder: "Name this run",
        sessionName: "Distributed systems",
        scopeLabel: "Scope",
        allScopeLabel: "All cards",
        dueScopeLabel: "Due only",
        selectedScope: "all",
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
    on: { openReview: vi.fn(), selectView: vi.fn(), selectMode: vi.fn(), changeSessionName: vi.fn(), selectScope: vi.fn(), selectLevel: vi.fn(), start: vi.fn(), resume: vi.fn(), retry: vi.fn() },
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

    it("selects the deep/staff configuration and starts the quiz", () => {
        const input = makeInput()
        render(<CourseFlashcardsQuizBlockBase {...input} />)

        fireEvent.click(screen.getByRole("button", { name: "Deep" }))
        fireEvent.click(screen.getByRole("button", { name: "Due only" }))
        fireEvent.click(screen.getByRole("button", { name: "Staff" }))
        fireEvent.click(screen.getByRole("button", { name: "Start quiz" }))
        expect(input.on.selectMode).toHaveBeenCalledWith("deep")
        expect(input.on.selectScope).toHaveBeenCalledWith("due")
        expect(input.on.selectLevel).toHaveBeenCalledWith("staff")
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
