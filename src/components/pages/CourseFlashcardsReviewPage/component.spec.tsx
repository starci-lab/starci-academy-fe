/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { CourseFlashcardsReviewBlockBase, type CourseFlashcardsReviewBlockProps as CourseFlashcardsReviewPageProps } from "@/components/blocks/learn/CourseFlashcardsReviewBlock/component"

/**
 * What these tests guard.
 *
 * The review overview promises one cross-deck session at the top and the decks under it. The due
 * card only offers an action there is something to do - an unfinished session resumes, a non-empty
 * queue starts, an empty queue offers neither - and a deck list that has not settled rests as decks
 * rather than as a notice.
 */

const makeInput = (): CourseFlashcardsReviewPageProps => ({
    pageState: "overview",
    blockState: "ready",
    props: {
        title: "Flashcards",
        subtitle: "Review",
        reviewLabel: "Review",
        quizLabel: "Quiz",
        modeTabsLabel: "Flashcard mode",
        viewTabsLabel: "Review area",
        overviewLabel: "Overview",
        historyLabel: "History",
        statsLabel: "Statistics",
        activeView: "overview",
        dueTitle: "Due today",
        dueDescription: "Review due cards",
        decksTitle: "Decks",
        evidenceTitle: "Recent sessions",
        cardsLabel: "cards",
        dueLabel: "due",
        masteredLabel: "mastered",
        startLabel: "Start",
        quizDeckLabel: "Quiz",
        resumeLabel: "Resume session",
        retryLabel: "Retry",
        emptyText: "Empty",
        evidenceEmptyText: "No evidence",
        noResultsTitle: "No matching decks",
        noResultsText: "No decks match",
        failedText: "Failed",
        dueCount: 3,
        quizCardCount: 5,
        statRows: [{ label: "Cards", value: "5" }, { label: "Mastered", value: "1" }, { label: "Retention", value: "80%" }, { label: "Streak", value: "2" }],
        decks: [{ id: "deck-1", title: "Core", description: "Core concepts", difficulty: "easy", cardCount: 5, dueCount: 3, masteredCount: 1, quizEligible: true }],
        evidenceRows: [{ id: "one", title: "Core", description: "4/5 reviewed", fact: "+20 XP" }],
        searchLabel: "Search decks",
        searchClearLabel: "Clear deck search",
        searchValue: "",
        foundText: "1 deck found",
        layoutLabel: "Deck layout",
        gridLabel: "Grid",
        lineLabel: "List",
        layout: "grid",
        modalOpen: false,
        modalTitle: "Choose review mode",
        modalDescription: "Core",
        reviewAllLabel: "Review all",
        reviewDueLabel: "Due only",
        cancelLabel: "Cancel",
        selectedScope: "due",
        startPending: false,
    },
    on: { openQuiz: vi.fn(), selectView: vi.fn(), changeSearch: vi.fn(), changeLayout: vi.fn(), openReview: vi.fn(), startDue: vi.fn(), selectScope: vi.fn(), confirmReview: vi.fn(), dismissModal: vi.fn(), resume: vi.fn(), retry: vi.fn() },
})

afterEach(cleanup)

describe("CourseFlashcardsReviewBlockBase", () => {
    it("keeps review mode and evidence view as independent tab axes", () => {
        const input = makeInput()
        render(<CourseFlashcardsReviewBlockBase {...input} />)
        fireEvent.click(screen.getByText("History"))
        expect(input.on.selectView).toHaveBeenCalledWith("history")
        expect(input.on.openQuiz).not.toHaveBeenCalled()
    })

    it("starts the cross-deck due session and a selected deck", () => {
        const input = makeInput()
        render(<CourseFlashcardsReviewBlockBase {...input} />)
        const startButtons = screen.getAllByRole("button", { name: "Start" })
        fireEvent.click(startButtons[0])
        fireEvent.click(startButtons[1])
        expect(input.on.startDue).toHaveBeenCalledOnce()
        expect(input.on.openReview).toHaveBeenCalledWith("deck-1")
    })

    it("renders due work and every review figure as independent page cards", () => {
        render(<CourseFlashcardsReviewBlockBase {...makeInput()} />)
        expect(screen.getByText("Due today")).toBeInTheDocument()
    })

    it("orders the deck title before one adjacent search-count toolbar", () => {
        const input = makeInput()
        render(<CourseFlashcardsReviewBlockBase {...input} />)

        expect(screen.getByRole("searchbox", { name: "Search decks" })).toBeInTheDocument()

        fireEvent.change(screen.getByRole("searchbox", { name: "Search decks" }), { target: { value: "core" } })
        fireEvent.submit(screen.getByRole("search"))
        expect(input.on.changeSearch).toHaveBeenCalledWith("core")
    })

    it("switches the same deck collection between grid cards and one joined list", () => {
        const input = makeInput()
        const { rerender } = render(<CourseFlashcardsReviewBlockBase {...input} />)
        rerender(<CourseFlashcardsReviewBlockBase {...input} props={{ ...input.props, layout: "line" }} />)
    })

    it("rests four deck cards and withholds the due card until the queue is known", () => {
        const input = makeInput()
        render(<CourseFlashcardsReviewBlockBase {...input} blockState="pending" />)
        expect(screen.queryByText("Recent sessions")).not.toBeInTheDocument()
    })

    it("replaces the whole overview when nothing is due and nothing is published", () => {
        const input = makeInput()
        render(<CourseFlashcardsReviewBlockBase {...input} blockState="empty" />)

        expect(screen.getByText("Empty")).toBeInTheDocument()
        expect(screen.queryByText("Decks")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument()
    })

    it("offers the way back from a failed deck load", () => {
        const input = makeInput()
        render(<CourseFlashcardsReviewBlockBase {...input} blockState="failed" />)

        expect(screen.getByText("Failed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(input.on.retry).toHaveBeenCalledOnce()
    })

    it("keeps due work and progress while a deck search settles with no matches", () => {
        const input = makeInput()
        render(<CourseFlashcardsReviewBlockBase {...input} props={{ ...input.props, decks: [], foundText: "0 decks found" }} />)

        expect(screen.getByText("Due today")).toBeInTheDocument()
    })

    it("uses a panel-specific empty state without removing the page identity or view tabs", () => {
        const input = makeInput()
        render(<CourseFlashcardsReviewBlockBase {...input} pageState="history" blockState="empty" props={{ ...input.props, activeView: "history" }} />)

    })

    it("retains deck scope and reports a failed or pending start inside the modal", () => {
        const input = makeInput()
        render(<CourseFlashcardsReviewBlockBase {...input} props={{ ...input.props, modalOpen: true, selectedDeckId: "deck-1", startPending: true, startErrorText: "Start failed" }} />)

        expect(screen.getByText("3 due")).toBeInTheDocument()
        expect(screen.getAllByRole("button", { name: "Start" }).some((button) => button.hasAttribute("disabled"))).toBe(true)
        fireEvent.click(screen.getByText(/Due only/))
        expect(input.on.selectScope).toHaveBeenCalledWith("due")
    })

    it("keeps the page identity on the left content axis", () => {
        render(<CourseFlashcardsReviewBlockBase {...makeInput()} />)
    })

    it("resumes an unfinished session instead of starting a new one", () => {
        const input = makeInput()
        render(
            <CourseFlashcardsReviewBlockBase
                {...input}
                props={{ ...input.props, resumeSessionId: "session-4" }}
            />,
        )

        expect(screen.getByRole("button", { name: "Resume session" })).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Resume session" }))
        expect(input.on.resume).toHaveBeenCalledWith("session-4")
    })

    it("leaves the due card actionless when the queue is empty and still routes to the quiz face", () => {
        const input = makeInput()
        render(
            <CourseFlashcardsReviewBlockBase {...input} props={{ ...input.props, dueCount: 0, decks: [] }} />,
        )

        expect(screen.getByText("0 due")).toBeInTheDocument()
        fireEvent.click(screen.getByText("Quiz"))
        expect(input.on.openQuiz).toHaveBeenCalledOnce()
    })
})
