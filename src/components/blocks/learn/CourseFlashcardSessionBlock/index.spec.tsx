import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type TestBlockInput = { blockState: string; on: Record<string, (...args: ReadonlyArray<unknown>) => unknown> }

const mocks = vi.hoisted(() => ({
    course: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    session: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    result: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    sync: { isMutating: false, error: undefined as unknown, trigger: vi.fn().mockResolvedValue(true) },
    rate: { isMutating: false, error: undefined as unknown, trigger: vi.fn().mockResolvedValue({ xpEarned: 2 }) },
    complete: { isMutating: false, error: undefined as unknown, trigger: vi.fn().mockResolvedValue({}) },
    push: vi.fn(),
}))

vi.mock("next-intl", () => ({ useLocale: () => "en" }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push, replace: mocks.push }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => mocks.course }))
vi.mock("@/hooks/swr/useQueryMyInProgressFlashcardSessionSwr", () => ({ useQueryMyInProgressFlashcardSessionSwr: () => mocks.session }))
vi.mock("@/hooks/swr/useQueryFlashcardSessionResultSwr", () => ({ useQueryFlashcardSessionResultSwr: () => mocks.result }))
vi.mock("@/hooks/swr/useMutateSyncFlashcardSessionSwr", () => ({ useMutateSyncFlashcardSessionSwr: () => mocks.sync, useMutateRateFlashcardSwr: () => mocks.rate }))
vi.mock("@/hooks/swr/useMutateCompleteFlashcardSessionSwr", () => ({ useMutateCompleteFlashcardSessionSwr: () => mocks.complete }))
vi.mock("./component", () => ({
    CourseFlashcardSessionBlockBase: (props: TestBlockInput) => (
        <>
            <output data-testid="state">{props.blockState}</output>
            <button onClick={props.on.reveal}>reveal</button>
            <button onClick={() => props.on.rate(2)}>rate</button>
            <button onClick={() => props.on.selectTerm("answer")}>select</button>
            <button onClick={props.on.checkQuiz}>check</button>
            <button onClick={props.on.retry}>retry</button>
            <button onClick={props.on.leave}>leave</button>
        </>
    ),
}))

import { CourseFlashcardSessionBlock, parseFlashcardCloze, quizPromptMarkdown, revealFlashcardMarkdown } from "./index"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.course.data = { id: "c1" }
    mocks.course.error = undefined
    mocks.session.data = undefined
    mocks.session.error = undefined
    mocks.result.data = undefined
    mocks.result.error = undefined
    mocks.sync.error = undefined
    mocks.rate.error = undefined
    mocks.complete.error = undefined
    mocks.sync.isMutating = false
    mocks.rate.isMutating = false
    mocks.complete.isMutating = false
})

describe("CourseFlashcardSessionBlock", () => {
    it("parses large and malformed cloze content without recursive regexp failure", () => {
        const largeTerm = "boundary".repeat(12_000)
        const parsed = parseFlashcardCloze(`Before {{c12::${largeTerm}::hint}} after {{cx::malformed}}`)

        expect(parsed.terms).toEqual([largeTerm])
        expect(parsed.text).toBe("Before ____ after {{cx::malformed}}")
    })

    it("reveals cloze terms without leaking authoring markers into Study Markdown", () => {
        const source = ":::muted\nDirect answer\n:::\nUse {{c12::a dead-letter queue::retry queue,error log}}."

        expect(revealFlashcardMarkdown(source)).toBe(":::muted\nDirect answer\n:::\nUse a dead-letter queue.")
    })

    it("keeps Quiz on the sentences with blanks instead of exposing the study explanation", () => {
        const source = "Direct answer\nPath and timestamp are not client decoration. Keep both so they {{blank:b1:o1}} one incident to its server log.\nTrade-off\nA fixed envelope keeps clients predictable."

        expect(quizPromptMarkdown(source)).toBe("Keep both so they ____ one incident to its server log.")
    })

    it("reports pending, active, expired and failed states", () => {
        const view = render(<CourseFlashcardSessionBlock displayId="course" sessionId="s1" mode="review" />)
        expect(screen.getByTestId("state")).toHaveTextContent("pending")
        mocks.session.data = { cards: [{ cardId: "card", front: "Q", back: "A" }], currentIndex: 0, reviewedCount: 0, gradedIndexes: [], results: [], xpEarned: 0, kind: "deck" }
        mocks.result.data = { status: "completed" }
        view.rerender(<CourseFlashcardSessionBlock displayId="course" sessionId="s1" mode="review" />)
        expect(screen.getByTestId("state")).toHaveTextContent("active")
        mocks.session.data = null
        mocks.result.data = { status: "in_progress" }
        view.rerender(<CourseFlashcardSessionBlock displayId="course" sessionId="s1" mode="review" />)
        expect(screen.getByTestId("state")).toHaveTextContent("expired")
        mocks.session.error = new Error("offline")
        view.rerender(<CourseFlashcardSessionBlock displayId="course" sessionId="s1" mode="review" />)
        expect(screen.getByTestId("state")).toHaveTextContent("failed")
    })

    it("retries, reveals, rates and leaves through connected actions", () => {
        mocks.session.data = { cards: [{ cardId: "card", front: "Q", back: "A" }], currentIndex: 0, reviewedCount: 0, gradedIndexes: [], results: [], xpEarned: 0, kind: "deck" }
        mocks.result.data = { status: "completed" }
        render(<CourseFlashcardSessionBlock displayId="course" sessionId="s1" mode="review" />)
        fireEvent.click(screen.getByText("reveal"))
        fireEvent.click(screen.getByText("rate"))
        fireEvent.click(screen.getByText("retry"))
        fireEvent.click(screen.getByText("leave"))
        expect(mocks.course.mutate).toHaveBeenCalled()
        expect(mocks.session.mutate).toHaveBeenCalled()
        expect(mocks.result.mutate).toHaveBeenCalled()
        expect(mocks.push).toHaveBeenCalledWith("/courses/course/learn/flashcards/review")
    })

    it("reports completing and syncing mutation states", () => {
        mocks.session.data = { cards: [{ cardId: "card", front: "Q", back: "A" }], currentIndex: 0, reviewedCount: 0, gradedIndexes: [], results: [], xpEarned: 0, kind: "deck" }
        mocks.result.data = { status: "completed" }
        mocks.complete.isMutating = true
        const view = render(<CourseFlashcardSessionBlock displayId="course" sessionId="s1" mode="review" />)
        expect(screen.getByTestId("state")).toHaveTextContent("completing")
        mocks.complete.isMutating = false
        mocks.sync.isMutating = true
        view.rerender(<CourseFlashcardSessionBlock displayId="course" sessionId="s1" mode="review" />)
        expect(screen.getByTestId("state")).toHaveTextContent("syncing")
        view.rerender(<CourseFlashcardSessionBlock displayId="course" sessionId="s1" mode="quiz" />)
        fireEvent.click(screen.getByText("select"))
        fireEvent.click(screen.getByText("check"))
    })

    it("keeps the live session on screen while a persisted mutation is pending", async () => {
        const { CourseFlashcardSessionBlockBase } = await vi.importActual<typeof import("./component")>("./component")
        const sharedData = {
            mode: "review" as const, title: "Core concepts", currentCard: 2, progressCard: 2, totalCards: 10, progressText: "Card 2 of 10", readOnly: false,
            questions: Array.from({ length: 10 }, (_, index) => ({ position: index + 1, state: index < 1 ? "answered" as const : index === 1 ? "current" as const : "future" as const, selected: index === 1, disabled: index > 1 })),
            breadcrumbLabel: "Course path", modeBreadcrumbLabel: "Review", taskBreadcrumbLabel: "Study", courseTitle: "Fullstack Mastery",
            deckTitle: "Core deck", level: "B1", prompt: "What is a closure?", answer: "A function with lexical scope", answerAvailable: true,
            answerVisible: false, solutionVisible: false, revealLabel: "Reveal answer", promptLabel: "Question", answerLabel: "Answer",
            answerUnavailableLabel: "Answer unavailable", answerUnavailableText: "This answer is locked for the current course access.",
            sessionSummaryLabel: "Session details", modeLabel: "Mode", deckLabel: "Deck", levelLabel: "Level", navigatorTitle: "Questions",
            navigatorDescription: "Open an answered card to review it.", navigatorStateLabel: "Question states", answeredLabel: "Answered", selectedLabel: "Reviewing", currentLabel: "Current", futureLabel: "Not reached",
            readOnlyLabel: "Reviewing a saved answer", readOnlyText: "This answer is read-only.", previousLabel: "Previous", nextLabel: "Next", continueHint: "Rate this card to continue.",
            clozeInstructionLabel: "Complete the sentence", wordBankLabel: "Word bank", blankLabel: "Blank", hintLabel: "Hint",
            checkAnswerLabel: "Check answer", showSolutionLabel: "Show solution", resultLabel: "correct", ratingLabel: "Rate this card",
            againLabel: "Again", hardLabel: "Hard", goodLabel: "Good", easyLabel: "Easy", pendingRating: null, syncingLabel: "Saving progress", completingLabel: "Completing session",
            expiredText: "Session expired", failedText: "Could not load", retryLabel: "Retry", leaveLabel: "Leave session",
        }
        const actions = { reveal: vi.fn(), selectTerm: vi.fn(), checkQuiz: vi.fn(), showSolution: vi.fn(), rate: vi.fn(), selectQuestion: vi.fn(), previous: vi.fn(), next: vi.fn(), openCourse: vi.fn(), openMode: vi.fn(), retry: vi.fn(), leave: vi.fn() }
        const view = render(<CourseFlashcardSessionBlockBase blockState="syncing" data={sharedData} on={actions} />)
        expect(screen.getByRole("button", { name: "Leave session" })).toBeDisabled()

        view.rerender(<CourseFlashcardSessionBlockBase blockState="active" data={sharedData} on={actions} />)
        expect(screen.getByRole("button", { name: "Leave session" })).toBeEnabled()
    }, 30_000)

    it("never presents an empty revealed answer as gradeable", async () => {
        const { CourseFlashcardSessionBlockBase } = await vi.importActual<typeof import("./component")>("./component")
        const data = {
            mode: "review" as const, title: "Core concepts", currentCard: 1, progressCard: 1, totalCards: 1, progressText: "Card 1 of 1", readOnly: false,
            questions: [{ position: 1, state: "current" as const, selected: true, disabled: false }], breadcrumbLabel: "Course path", modeBreadcrumbLabel: "Review", taskBreadcrumbLabel: "Study", courseTitle: "Fullstack Mastery",
            deckTitle: "Core deck", level: "senior", prompt: "Why merge both logging pipelines?", answer: "   ", answerAvailable: false, answerVisible: true, solutionVisible: false,
            revealLabel: "Reveal answer", promptLabel: "Question", answerLabel: "Answer", answerUnavailableLabel: "Answer unavailable",
            answerUnavailableText: "This answer is locked for the current course access.", sessionSummaryLabel: "Session details", modeLabel: "Mode", deckLabel: "Deck", levelLabel: "Level",
            navigatorTitle: "Questions", navigatorDescription: "Open an answered card to review it.", navigatorStateLabel: "Question states", answeredLabel: "Answered", selectedLabel: "Reviewing", currentLabel: "Current", futureLabel: "Not reached",
            readOnlyLabel: "Reviewing a saved answer", readOnlyText: "This answer is read-only.", previousLabel: "Previous", nextLabel: "Next", continueHint: "Rate this card to continue.",
            clozeInstructionLabel: "Complete the sentence", wordBankLabel: "Word bank", blankLabel: "Blank", hintLabel: "Hint", checkAnswerLabel: "Check answer", showSolutionLabel: "Show solution", resultLabel: "correct",
            ratingLabel: "Rate this card", againLabel: "Again", hardLabel: "Hard", goodLabel: "Good", easyLabel: "Easy", pendingRating: null, syncingLabel: "Saving progress", completingLabel: "Completing session",
            expiredText: "Session expired", failedText: "Could not load", retryLabel: "Retry", leaveLabel: "Leave session",
        }
        const actions = { reveal: vi.fn(), selectTerm: vi.fn(), checkQuiz: vi.fn(), showSolution: vi.fn(), rate: vi.fn(), selectQuestion: vi.fn(), previous: vi.fn(), next: vi.fn(), openCourse: vi.fn(), openMode: vi.fn(), retry: vi.fn(), leave: vi.fn() }

        const view = render(<CourseFlashcardSessionBlockBase blockState="active" data={data} on={actions} />)
        expect(screen.getByText("Answer unavailable")).toBeVisible()
        expect(screen.getByText("This answer is locked for the current course access.")).toBeVisible()
        expect(view.getByText("Answer unavailable")).toBeVisible()
        expect(screen.queryByText("Rate this card")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Good" })).not.toBeInTheDocument()

        view.rerender(<CourseFlashcardSessionBlockBase blockState="active" data={{ ...data, answer: "Use one structured pipeline so request context and framework events remain correlated.", answerAvailable: true }} on={actions} />)
        expect(screen.getByText("Use one structured pipeline so request context and framework events remain correlated.")).toBeVisible()
        expect(screen.getByText("Rate this card")).toBeVisible()
        expect(screen.getByRole("button", { name: "Good" })).toBeEnabled()
        expect(screen.getByRole("button", { name: "Good" })).toHaveClass("button--outline")
    }, 15_000)

    it("orders the result continuation before the secondary return action", async () => {
        const { FlashcardResultBase } = await vi.importActual<typeof import("../FlashcardResult/component")>("../FlashcardResult/component")
        render(<FlashcardResultBase
            blockState="ready"
            data={{
                mode: "review", modeText: "Review", title: "Session complete", subtitle: "Keep your momentum", scoreLabel: "Score", scoreText: "82%", reviewedLabel: "Reviewed", reviewedText: "10",
                xpLabel: "XP", xpText: "+20", durationLabel: "Duration", durationText: "4 min", nextDueLabel: "Next due", nextDueText: "Tomorrow",
                breakdownTitle: "Recall breakdown", gradeRows: [{ label: "Good", value: 7 }], weakTopicsTitle: "Weak topics", weakTopics: [{ tag: "Closures", value: "Review next" }],
                failedText: "Could not load", retryLabel: "Retry", retrySessionLabel: "Study again", backLabel: "Back to library",
            }}
            on={{ retryLoad: vi.fn(), retrySession: vi.fn(), back: vi.fn() }}
        />)

        expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual(["Study again", "Back to library"])
    })
})
