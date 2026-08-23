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
})
