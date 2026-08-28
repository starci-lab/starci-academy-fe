import { act, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type TestInput = { blockState: string; on: { openReview: () => void; selectView: (view: string) => void; selectMode: (mode: string) => void; selectLevel: (level: string | null) => void; start: () => void; resume: (id: string) => void; retry: () => void } }
const mocks = vi.hoisted(() => ({
    input: undefined as TestInput | undefined,
    course: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    decks: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    due: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    inProgress: { data: undefined as unknown, error: undefined as unknown },
    history: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    stats: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    start: { error: undefined as unknown, trigger: vi.fn() }, push: vi.fn(), locale: "en",
}))

vi.mock("next-intl", () => ({ useLocale: () => mocks.locale }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => mocks.course }))
vi.mock("@/hooks/swr/useQueryFlashcardDecksByCourseSwr", () => ({ useQueryFlashcardDecksByCourseSwr: () => mocks.decks, useQueryMyDueFlashcardsSwr: () => mocks.due }))
vi.mock("@/hooks/swr/useQueryMyInProgressFlashcardSessionSwr", () => ({ useQueryMyInProgressFlashcardSessionSwr: () => mocks.inProgress }))
vi.mock("@/hooks/swr/useMutateStartFlashcardSessionSwr", () => ({ useMutateStartFlashcardSessionSwr: () => mocks.start }))
vi.mock("@/hooks/swr/useQueryMyFlashcardQuizHistorySwr", () => ({ useQueryMyFlashcardQuizHistorySwr: () => mocks.history }))
vi.mock("@/hooks/swr/useQueryMyFlashcardQuizStatsSwr", () => ({ useQueryMyFlashcardQuizStatsSwr: () => mocks.stats }))
vi.mock("./component", () => ({ CourseFlashcardsQuizBlockBase: (props: TestInput) => { mocks.input = props; return <output data-testid="quiz" /> } }))

import { CourseFlashcardsQuizBlock } from "./index"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.input = undefined
    mocks.locale = "en"
    for (const item of [mocks.course, mocks.decks, mocks.due, mocks.inProgress, mocks.history, mocks.stats]) { item.data = undefined; item.error = undefined }
    mocks.start.error = undefined
})

describe("CourseFlashcardsQuizBlock", () => {
    it("covers pending, failed, empty and ready configuration branches", () => {
        const view = render(<CourseFlashcardsQuizBlock displayId="course" />)
        expect(mocks.input?.blockState).toBe("pending")
        mocks.course.error = new Error("offline")
        view.rerender(<CourseFlashcardsQuizBlock displayId="course" />)
        expect(mocks.input?.blockState).toBe("failed")
        mocks.course.error = undefined
        mocks.course.data = { id: "c1" }
        mocks.decks.data = []
        mocks.due.data = { cards: [] }
        mocks.inProgress.data = null
        mocks.history.data = { items: [] }
        mocks.stats.data = { conceptCoverage: { covered: 0, total: 0 }, byTag: [] }
        view.rerender(<CourseFlashcardsQuizBlock displayId="course" />)
        expect(mocks.input?.blockState).toBe("empty")
        mocks.decks.data = [{ id: "deck", cards: [{ id: "card", level: "junior" }] }]
        view.rerender(<CourseFlashcardsQuizBlock displayId="course" />)
        expect(mocks.input?.blockState).toBe("ready")
        act(() => { mocks.input?.on.openReview(); mocks.input?.on.selectView("history"); mocks.input?.on.selectMode("deep"); mocks.input?.on.selectLevel("junior"); mocks.input?.on.retry() })
        expect(mocks.push).toHaveBeenCalledWith("/courses/course/learn/flashcards/review")
    })

    it("renders the guided setup controls through the pure quiz owner", async () => {
        const { CourseFlashcardsQuizBlockBase } = await vi.importActual<typeof import("./component")>("./component")
        const selectScope = vi.fn()
        const selectMode = vi.fn()
        const selectLevel = vi.fn()

        render(<CourseFlashcardsQuizBlockBase
            pageState="setup"
            blockState="ready"
            props={{
                title: "Quick Quiz", subtitle: "Build a focused practice run", reviewLabel: "Study", quizLabel: "Quick Quiz",
                setupLabel: "Setup", historyLabel: "History", statsLabel: "Stats", activeView: "setup", evidenceTitle: "Quiz evidence", evidenceRows: [],
                configurationTitle: "Configure your quiz", sessionNameLabel: "Session name", sessionNamePlaceholder: "Optional name", sessionName: "",
                scopeLabel: "Card scope", allScopeLabel: "All cards", dueScopeLabel: "Due only", selectedScope: "all",
                modeLabel: "Quiz depth", quickLabel: "Quick", deepLabel: "Deep", selectedMode: "quick",
                levelLabel: "Level", allLevelsLabel: "All levels", juniorLabel: "Junior", middleLabel: "Middle", seniorLabel: "Senior", staffLabel: "Staff", selectedLevel: null,
                startLabel: "Start quiz", resumeLabel: "Resume", retryLabel: "Retry", emptyText: "No cards", failedText: "Could not load", cardCount: 12, cardsLabel: "cards",
            }}
            on={{
                openReview: vi.fn(), selectView: vi.fn(), selectMode, changeSessionName: vi.fn(), selectScope, selectLevel,
                start: vi.fn(), resume: vi.fn(), retry: vi.fn(),
            }}
        />)

        act(() => { screen.getByRole("button", { name: "Due only" }).click() })
        act(() => { screen.getByRole("button", { name: "Deep" }).click() })
        act(() => { screen.getByRole("button", { name: "Junior" }).click() })
        expect(selectScope).toHaveBeenCalledWith("due")
        expect(selectMode).toHaveBeenCalledWith("deep")
        expect(selectLevel).toHaveBeenCalledWith("junior")
    }, 30_000)
})
