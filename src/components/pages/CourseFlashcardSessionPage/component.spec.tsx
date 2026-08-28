import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
    CourseFlashcardSessionBlockBase,
    type CourseFlashcardSessionPageActions,
    type CourseFlashcardSessionPageData,
    type CourseFlashcardSessionBlockProps as CourseFlashcardSessionPageProps,
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
        const { on } = draw("active")

        expect(screen.getByRole("heading", { name: "Study cards" })).toBeInTheDocument()
        expect(screen.getByLabelText("Course path")).toBeInTheDocument()
        expect(screen.queryByText("Back")).not.toBeInTheDocument()
        expect(on.openMode).not.toHaveBeenCalled()
        expect(screen.getByRole("progressbar")).toBeInTheDocument()
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
        draw("active", {
            currentCard: 3,
            progressCard: 7,
            progressText: "Card 7 of 12",
            readOnly: true,
            questions: progressedQuestions(3),
        })

        expect(screen.getByRole("progressbar", { name: "Card 7 of 12" })).toHaveAttribute("aria-valuenow", "58")
        expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Good" })).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Reveal answer" })).not.toBeInTheDocument()
        expect(screen.queryByText("Reviewing a saved answer")).not.toBeInTheDocument()
    })

    it("traverses saved questions with previous and next without grading them", () => {
        const { on } = draw("active", {
            currentCard: 3,
            progressCard: 7,
            readOnly: true,
            questions: progressedQuestions(3),
        })

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
        expect(first.on.rate).not.toHaveBeenCalled()

        expect(screen.getByRole("main", { name: "Study cards" })).toBeInTheDocument()
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

        expect(message).toBeTypeOf("string")
        expect(screen.queryByRole("button", { name: "Good" })).not.toBeInTheDocument()
    })

    it.each([
        ["expired", "This session expired"],
        ["failed", "The session could not be read"],
    ] as const)("replaces an %s session's card and progress with what happened and one way back", (state, message) => {
        const { on } = draw(state)

        expect(screen.getByText(message)).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(on.retry).toHaveBeenCalledTimes(1)
    })

    it("rests the header, the progress and the card while the session is still being read", () => {
        draw("pending")

        expect(screen.queryByText("Core deck")).not.toBeInTheDocument()
        expect(screen.queryByText("What is CQRS?")).not.toBeInTheDocument()
        expect(screen.queryByText("Card 1 of 12")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Reveal answer" })).not.toBeInTheDocument()
    })

    it("drops the deck line entirely when the session carries no deck name to qualify its title", () => {
        draw("active", { deckTitle: undefined })

        expect(screen.queryByText("Core deck")).not.toBeInTheDocument()
    })

    it("omits the level context row rather than inventing one when the backend reported no level", () => {
        draw("active", { level: null })

        expect(screen.queryByText("Level")).not.toBeInTheDocument()
        expect(screen.queryByText("B1")).not.toBeInTheDocument()
        expect(screen.getByRole("progressbar", { name: "Card 1 of 12" })).toHaveAttribute("aria-valuenow", "8")
    })

    it("draws a partial quiz verdict as a warning surface instead of a success state", () => {
        draw("active", {
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

    })

    it("keeps the way out of the session reachable even after the session has died", () => {
        draw("expired")

        expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument()
    })
})
