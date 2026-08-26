import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
    CourseFlashcardSessionBlockBase,
    type CourseFlashcardSessionPageActions,
    type CourseFlashcardSessionPageData,
    type CourseFlashcardSessionPageProps,
} from "@/components/blocks/learn/CourseFlashcardSessionBlock/component"

/**
 * What these tests guard: a live session that only ever offers the controls its own state admits.
 * The answer stays hidden until the reader asks for it, the four SM-2 grades belong to review while
 * quiz gets a two-way verdict, transport states say so out loud, and a session that expired or
 * failed keeps nothing but what happened and one way back - a grade pressed against a dead session
 * is a rating the backend will refuse.
 */

const card: CourseFlashcardSessionPageData = {
    mode: "review",
    title: "Study cards",
    currentCard: 1,
    progressCard: 1,
    totalCards: 12,
    progressText: "Card 1 of 12",
    readOnly: false,
    questions: Array.from({ length: 12 }, (_, index) => ({
        position: index + 1,
        state: index === 0 ? "current" as const : "future" as const,
        selected: index === 0,
        disabled: index > 0,
    })),
    breadcrumbLabel: "Course path",
    modeBreadcrumbLabel: "Review",
    taskBreadcrumbLabel: "Study",
    courseTitle: "Fullstack Mastery",
    deckTitle: "Core deck",
    level: "B1",
    prompt: "What is CQRS?",
    answer: "Command Query Responsibility Segregation",
    answerAvailable: true,
    answerVisible: true,
    solutionVisible: false,
    revealLabel: "Reveal answer",
    promptLabel: "Question",
    answerLabel: "Answer",
    answerUnavailableLabel: "Answer unavailable",
    answerUnavailableText: "This answer is locked for the current course access.",
    sessionSummaryLabel: "Session details",
    modeLabel: "Mode",
    deckLabel: "Deck",
    levelLabel: "Level",
    navigatorTitle: "Questions",
    navigatorDescription: "Open an answered card to review it. Saved grades cannot be changed.",
    navigatorStateLabel: "Question states",
    answeredLabel: "Answered",
    selectedLabel: "Reviewing",
    currentLabel: "Current",
    futureLabel: "Not reached",
    readOnlyLabel: "Reviewing a saved answer",
    readOnlyText: "This card is read-only because its grade is already saved.",
    previousLabel: "Previous",
    nextLabel: "Next",
    continueHint: "Choose a recall grade to continue.",
    clozeInstructionLabel: "Fill every blank",
    wordBankLabel: "Word bank",
    checkAnswerLabel: "Check answer",
    showSolutionLabel: "Show full answer",
    resultLabel: "blanks correct",
    ratingLabel: "How well did you remember it?",
    againLabel: "Again",
    hardLabel: "Hard",
    goodLabel: "Good",
    easyLabel: "Easy",
    syncingLabel: "Saving your progress",
    completingLabel: "Completing the session",
    expiredText: "This session expired",
    failedText: "The session could not be read",
    retryLabel: "Try again",
    leaveLabel: "Leave session",
}

const handlers = (): CourseFlashcardSessionPageActions => ({
    reveal: vi.fn(),
    selectTerm: vi.fn(),
    checkQuiz: vi.fn(),
    showSolution: vi.fn(),
    rate: vi.fn(),
    selectQuestion: vi.fn(),
    previous: vi.fn(),
    next: vi.fn(),
    openCourse: vi.fn(),
    openMode: vi.fn(),
    retry: vi.fn(),
    leave: vi.fn(),
})

const draw = (
    blockState: CourseFlashcardSessionPageProps["blockState"],
    data: Partial<CourseFlashcardSessionPageData> = {},
) => {
    const on = handlers()
    return { on, ...render(<CourseFlashcardSessionBlockBase blockState={blockState} data={{ ...card, ...data }} on={on} />) }
}

const progressedQuestions = (selectedPosition = 7) => Array.from({ length: 12 }, (_, index) => {
    const position = index + 1
    return {
        position,
        state: position < 7 ? "answered" as const : position === 7 ? "current" as const : "future" as const,
        selected: position === selectedPosition,
        disabled: position > 7,
    }
})

describe("CourseFlashcardSessionBlockBase", () => {
    it("shows the prompt, the deck it came from and how far through the session the reader is", () => {
        const { container, on } = draw("active")

        expect(container.querySelector("[data-node=\"course-flashcard-session-page\"]")).not.toBeNull()
        expect(screen.getByRole("heading", { name: "Study cards" })).toBeInTheDocument()
        expect(screen.getByText("Core deck")).toBeInTheDocument()
        expect(screen.getByText("Card 1 of 12")).toBeInTheDocument()
        expect(screen.getByText("B1")).toBeInTheDocument()
        expect(screen.getByText("What is CQRS?")).toBeInTheDocument()
        expect(screen.getByText("Command Query Responsibility Segregation")).toBeInTheDocument()
        expect(screen.getByLabelText("Course path")).toBeInTheDocument()
        expect(screen.getByLabelText("Course path")).toHaveTextContent("Fullstack MasteryReviewStudy")
        expect(screen.queryByText("Back")).not.toBeInTheDocument()
        fireEvent.click(screen.getByText("Review"))
        expect(on.openMode).toHaveBeenCalledOnce()
        expect(screen.getByRole("progressbar", { name: "Card 1 of 12" })).toHaveAttribute("aria-valuenow", "8")
        expect(container.querySelector("[data-node=flashcard-session-workspace]")).not.toBeNull()
        expect(container.querySelector("[data-node=flashcard-session-feedback-neutral]")).not.toBeNull()
        expect(container.querySelector("[data-node=flashcard-session-navigation-panel]")).not.toBeNull()
        const rail = container.querySelector("[data-node=flashcard-session-rail]")
        expect(rail).not.toBeNull()
        expect(rail?.querySelectorAll("[data-grammar-surface-card=true]")).toHaveLength(2)
        expect(rail?.querySelectorAll("[data-component=SurfaceListCard]")).toHaveLength(1)
        expect(container.querySelector("[data-node=flashcard-session-feedback-neutral] [data-component=Icon]")).toBeNull()
        expect(container.querySelector("[data-node=flashcard-session-navigation-legend] [data-component=Icon]")).toBeNull()
        expect(container.querySelector("[data-node=flashcard-session-navigation-legend]")).toHaveClass("grid-cols-2")
        expect(container.querySelector("[data-node=flashcard-session-navigation-legend]")?.children).toHaveLength(4)
        expect(Array.from(container.querySelectorAll("[data-node=flashcard-session-navigation-legend] [data-component=ButtonStateSample]"), (sample) => ({
            variant: sample.getAttribute("data-variant"),
            disabled: sample.getAttribute("data-disabled"),
        }))).toEqual([
            { variant: "outline", disabled: "false" },
            { variant: "secondary", disabled: "false" },
            { variant: "primary", disabled: "false" },
            { variant: "tertiary", disabled: "true" },
        ])
        const facts = screen.getByRole("heading", { name: "Session details" }).closest("[data-component=SurfaceListCard]")
        expect(facts).not.toBeNull()
        expect(facts?.querySelector("[data-node=flashcard-session-context-list]")).toHaveClass("divide-y")
        expect(facts?.querySelectorAll("[data-node=flashcard-session-context-row]")).toHaveLength(3)
    })

    it("maps answered, current and future questions without unlocking unreached work", () => {
        const { on } = draw("active", {
            currentCard: 7,
            progressCard: 7,
            progressText: "Card 7 of 12",
            questions: progressedQuestions(),
        })

        expect(screen.getByRole("button", { name: "7" })).toHaveAttribute("data-variant", "primary")
        expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("data-variant", "outline")
        expect(screen.getByRole("button", { name: "8" })).toBeDisabled()
        fireEvent.click(screen.getByRole("button", { name: "4" }))
        expect(on.selectQuestion).toHaveBeenCalledWith(4)
        expect(on.selectQuestion).not.toHaveBeenCalledWith(8)
    })

    it("reopens an answered question read-only while keeping persisted progress at the frontier", () => {
        const { container } = draw("active", {
            currentCard: 3,
            progressCard: 7,
            progressText: "Card 7 of 12",
            readOnly: true,
            questions: progressedQuestions(3),
        })

        expect(screen.getByRole("progressbar", { name: "Card 7 of 12" })).toHaveAttribute("aria-valuenow", "58")
        expect(screen.getByText("This card is read-only because its grade is already saved.")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "3" })).toHaveAttribute("data-variant", "secondary")
        expect(screen.queryByRole("button", { name: "Good" })).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Reveal answer" })).not.toBeInTheDocument()
        expect(screen.queryByText("Reviewing a saved answer")).not.toBeInTheDocument()
        expect(container.querySelectorAll("[data-node=flashcard-session-feedback-neutral]")).toHaveLength(1)
    })

    it("traverses saved questions with previous and next without grading them", () => {
        const { on } = draw("active", {
            currentCard: 3,
            progressCard: 7,
            readOnly: true,
            questions: progressedQuestions(3),
        })

        fireEvent.click(screen.getByRole("button", { name: "Previous" }))
        fireEvent.click(screen.getByRole("button", { name: "Next" }))
        expect(on.previous).toHaveBeenCalledOnce()
        expect(on.next).toHaveBeenCalledOnce()
        expect(on.rate).not.toHaveBeenCalled()
    })

    it("keeps the answer hidden and offers only the reveal until the reader asks for it", () => {
        const { on } = draw("active", { answerVisible: false })

        expect(screen.queryByText("Command Query Responsibility Segregation")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Good" })).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Reveal answer" }))
        expect(on.reveal).toHaveBeenCalledTimes(1)
    })

    it.each([
        ["Again", 0],
        ["Hard", 1],
        ["Good", 2],
        ["Easy", 3],
    ] as const)("sends the %s press to the scheduler as SM-2 grade %i", (label, grade) => {
        const { on } = draw("active")

        fireEvent.click(screen.getByRole("button", { name: label }))
        expect(on.rate).toHaveBeenCalledWith(grade)
    })

    it("marks the recommended grade as the main action and the other three as equal alternatives", () => {
        draw("active")

        expect(screen.getByRole("button", { name: "Good" })).toHaveAttribute("data-variant", "primary")
        expect(screen.getByRole("button", { name: "Again" })).toHaveAttribute("data-variant", "outline")
        expect(screen.getByRole("button", { name: "Hard" })).toHaveAttribute("data-variant", "outline")
        expect(screen.getByRole("button", { name: "Easy" })).toHaveAttribute("data-variant", "outline")
    })

    it("runs a cloze quiz through word bank, check, full solution and SM-2 rating", () => {
        const cloze = { text: "Choose ____ and ____", blanks: ["Consistency", "Availability"], bank: ["Consistency", "Availability", "Durability"], selected: ["Consistency", "Availability"], checked: false, correctCount: 2 }
        const first = draw("active", { mode: "quiz", answerVisible: false, cloze })
        expect(screen.getByText("Word bank")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Durability" }))
        expect(first.on.selectTerm).toHaveBeenCalledWith("Durability")
        fireEvent.click(screen.getByRole("button", { name: "Check answer" }))
        expect(first.on.checkQuiz).toHaveBeenCalledOnce()

        first.rerender(<CourseFlashcardSessionBlockBase blockState="active" data={{ ...card, mode: "quiz", answerVisible: false, cloze: { ...cloze, checked: true } }} on={first.on} />)
        expect(screen.getByText("2 / 2 blanks correct")).toBeInTheDocument()
        expect(first.container.querySelector("[data-node=flashcard-session-feedback-success]")).not.toBeNull()
        fireEvent.click(screen.getByRole("button", { name: "Show full answer" }))
        expect(first.on.showSolution).toHaveBeenCalledOnce()

        first.rerender(<CourseFlashcardSessionBlockBase blockState="active" data={{ ...card, mode: "quiz", answerVisible: true, solutionVisible: true, cloze: { ...cloze, checked: true } }} on={first.on} />)
        fireEvent.click(screen.getByRole("button", { name: "Good" }))
        expect(first.on.rate).toHaveBeenCalledWith(2)
    })

    it("falls back to reveal then SM-2 when a quiz card has no cloze markers", () => {
        const { on } = draw("active", { mode: "quiz", answerVisible: false, cloze: undefined })
        fireEvent.click(screen.getByRole("button", { name: "Reveal answer" }))
        expect(on.reveal).toHaveBeenCalledOnce()
    })

    it.each([
        ["syncing", "Saving your progress"],
        ["completing", "Completing the session"],
    ] as const)("announces the %s state and withdraws the card controls while the backend answers", (state, message) => {
        draw(state)

        expect(screen.getByRole("status")).toHaveTextContent(message)
        expect(screen.queryByRole("button", { name: "Good" })).not.toBeInTheDocument()
    })

    it.each([
        ["expired", "This session expired"],
        ["failed", "The session could not be read"],
    ] as const)("replaces an %s session's card and progress with what happened and one way back", (state, message) => {
        const { container, on } = draw(state)

        expect(screen.getByText(message)).toBeInTheDocument()
        expect(container.querySelector("[data-node=\"flashcard-session-card\"]")).toBeNull()
        expect(container.querySelector("[data-node=\"label-with-muted-fact-row\"]")).toBeNull()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(on.retry).toHaveBeenCalledTimes(1)
    })

    it("rests the header, the progress and the card while the session is still being read", () => {
        const { container } = draw("pending")

        expect(container.querySelector("[data-component=Heading][data-loading=\"true\"]")).not.toBeNull()
        expect(screen.queryByText("Core deck")).not.toBeInTheDocument()
        expect(screen.queryByText("What is CQRS?")).not.toBeInTheDocument()
        expect(screen.queryByText("Card 1 of 12")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Reveal answer" })).not.toBeInTheDocument()
    })

    it("drops the deck line entirely when the session carries no deck name to qualify its title", () => {
        const { container } = draw("active", { deckTitle: undefined })

        expect(screen.queryByText("Core deck")).not.toBeInTheDocument()
        expect(container.querySelectorAll("[data-node=\"flashcard-session-header\"] > [data-component=Text]")).toHaveLength(0)
    })

    it("omits the level context row rather than inventing one when the backend reported no level", () => {
        draw("active", { level: null })

        expect(screen.queryByText("Level")).not.toBeInTheDocument()
        expect(screen.queryByText("B1")).not.toBeInTheDocument()
        expect(screen.getByRole("progressbar", { name: "Card 1 of 12" })).toHaveAttribute("aria-valuenow", "8")
    })

    it("draws a partial quiz verdict as a warning surface instead of a success state", () => {
        const { container } = draw("active", {
            mode: "quiz",
            answerVisible: false,
            cloze: {
                text: "Choose ____ and ____",
                blanks: ["Consistency", "Availability"],
                bank: ["Consistency", "Availability"],
                selected: ["Consistency", "Durability"],
                checked: true,
                correctCount: 1,
            },
        })

        expect(container.querySelector("[data-node=flashcard-session-feedback-warning]")).not.toBeNull()
        expect(container.querySelector("[data-node=flashcard-session-feedback-success]")).toBeNull()
    })

    it("keeps the way out of the session reachable even after the session has died", () => {
        const { on } = draw("expired")

        fireEvent.click(screen.getByRole("button", { name: "Leave session" }))
        expect(on.leave).toHaveBeenCalledTimes(1)
    })
})
