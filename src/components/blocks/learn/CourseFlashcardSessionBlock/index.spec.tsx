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
    CourseFlashcardSessionBlockBase: ({ blockState, on }: TestBlockInput) => (
        <>
            <output data-testid="state">{blockState}</output>
            <button onClick={on.reveal}>reveal</button>
            <button onClick={() => on.rate(2)}>rate</button>
            <button onClick={() => on.selectTerm("answer")}>select</button>
            <button onClick={on.checkQuiz}>check</button>
            <button onClick={on.retry}>retry</button>
            <button onClick={on.leave}>leave</button>
        </>
    ),
}))

import { CourseFlashcardSessionBlock } from "./index"

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
            mode: "review" as const, title: "Core concepts", progressText: "Card 2 of 10", prompt: "What is a closure?", answer: "A function with lexical scope",
            answerVisible: false, solutionVisible: false, revealLabel: "Reveal answer", clozeInstructionLabel: "Complete the sentence", wordBankLabel: "Word bank",
            checkAnswerLabel: "Check answer", showSolutionLabel: "Show solution", resultLabel: "correct", ratingLabel: "Rate this card",
            againLabel: "Again", hardLabel: "Hard", goodLabel: "Good", easyLabel: "Easy", syncingLabel: "Saving progress", completingLabel: "Completing session",
            expiredText: "Session expired", failedText: "Could not load", retryLabel: "Retry", leaveLabel: "Leave session",
        }
        const actions = { reveal: vi.fn(), selectTerm: vi.fn(), checkQuiz: vi.fn(), showSolution: vi.fn(), rate: vi.fn(), retry: vi.fn(), leave: vi.fn() }
        const view = render(<CourseFlashcardSessionBlockBase blockState="syncing" data={sharedData} on={actions} />)
        expect(screen.getByRole("button", { name: "Leave session" })).toBeDisabled()

        view.rerender(<CourseFlashcardSessionBlockBase blockState="active" data={sharedData} on={actions} />)
        expect(screen.getByRole("button", { name: "Leave session" })).toBeEnabled()
    })

    it("orders the result continuation before the secondary return action", async () => {
        const { FlashcardResultBase } = await vi.importActual<typeof import("../FlashcardResult/component")>("../FlashcardResult/component")
        render(<FlashcardResultBase
            blockState="ready"
            data={{
                mode: "review", title: "Session complete", subtitle: "Keep your momentum", scoreLabel: "Score", scoreText: "82%", reviewedLabel: "Reviewed", reviewedText: "10",
                xpLabel: "XP", xpText: "+20", durationLabel: "Duration", durationText: "4 min", nextDueLabel: "Next due", nextDueText: "Tomorrow",
                breakdownTitle: "Recall breakdown", gradeRows: [{ label: "Good", value: 7 }], weakTopicsTitle: "Weak topics", weakTopics: [{ tag: "Closures", value: "Review next" }],
                failedText: "Could not load", retryLabel: "Retry", retrySessionLabel: "Study again", backLabel: "Back to library",
            }}
            on={{ retryLoad: vi.fn(), retrySession: vi.fn(), back: vi.fn() }}
        />)

        expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual(["Study again", "Back to library"])
    })
})
