import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CourseFlashcardsQuizPage } from "./index"
type StateProps = { state: string }
type QuizActions = { openReview?: () => void; retry?: () => void; start?: () => void; resume?: (id: string) => void; selectMode?: (mode: string) => void; selectLevel?: (level: string | null) => void }
type QuizInput = StateProps & { on?: QuizActions }

const locale = vi.hoisted(() => ({ value: "en" }))
const useQueryCourseSwr = vi.hoisted(() => vi.fn())
const useQueryFlashcardDecksByCourseSwr = vi.hoisted(() => vi.fn())
const useQueryMyDueFlashcardsSwr = vi.hoisted(() => vi.fn())
const useQueryMyInProgressFlashcardSessionSwr = vi.hoisted(() => vi.fn())
const useMutateStartFlashcardSessionSwr = vi.hoisted(() => vi.fn())

vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr }))
vi.mock("@/hooks/swr/useQueryFlashcardDecksByCourseSwr", () => ({ useQueryFlashcardDecksByCourseSwr, useQueryMyDueFlashcardsSwr }))
vi.mock("@/hooks/swr/useQueryMyInProgressFlashcardSessionSwr", () => ({ useQueryMyInProgressFlashcardSessionSwr }))
vi.mock("@/hooks/swr/useMutateStartFlashcardSessionSwr", () => ({ useMutateStartFlashcardSessionSwr }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("next-intl", () => ({ useLocale: () => locale.value }))
vi.mock("./component", () => ({
    CourseFlashcardsQuizPageBase: ({ state, on }: QuizInput) => <><div data-testid="state">{state}</div><button onClick={on?.openReview}>review</button><button onClick={on?.retry}>retry</button><button onClick={on?.start}>start</button><button onClick={() => on?.resume?.("session")}>resume</button><button onClick={() => on?.selectMode?.("deep")}>deep</button><button onClick={() => on?.selectLevel?.("junior")}>level</button></>,
}))

const deck = { id: "deck-1", cards: [{ id: "card-1", level: "junior" }] }
const ready = () => {
    useQueryCourseSwr.mockReturnValue({ data: { id: "course-1" }, error: undefined, mutate: vi.fn() })
    useQueryFlashcardDecksByCourseSwr.mockReturnValue({ data: [deck], error: undefined, mutate: vi.fn() })
    useQueryMyDueFlashcardsSwr.mockReturnValue({ data: { dueCount: 1, cards: [{ cardId: "card-1" }] }, error: undefined, mutate: vi.fn() })
    useQueryMyInProgressFlashcardSessionSwr.mockReturnValue({ data: null, error: undefined })
    useMutateStartFlashcardSessionSwr.mockReturnValue({ error: undefined, trigger: vi.fn().mockResolvedValue(null) })
}

describe("CourseFlashcardsQuizPage", () => {
    beforeEach(() => { locale.value = "en"; ready() })

    it("renders ready when quiz cards are available", () => {
        render(<CourseFlashcardsQuizPage displayId="course" />)
        expect(screen.getByTestId("state")).toHaveTextContent("ready")
    })

    it("reports pending, failed and empty quiz states", () => {
        useQueryCourseSwr.mockReturnValue({ data: undefined, error: undefined, mutate: vi.fn() })
        const { rerender } = render(<CourseFlashcardsQuizPage displayId="course" />)
        expect(screen.getByTestId("state")).toHaveTextContent("pending")

        useQueryCourseSwr.mockReturnValue({ data: null, error: new Error("network"), mutate: vi.fn() })
        rerender(<CourseFlashcardsQuizPage displayId="course" />)
        expect(screen.getByTestId("state")).toHaveTextContent("failed")

        useQueryCourseSwr.mockReturnValue({ data: { id: "course-1" }, error: undefined, mutate: vi.fn() })
        useQueryFlashcardDecksByCourseSwr.mockReturnValue({ data: [], error: undefined, mutate: vi.fn() })
        rerender(<CourseFlashcardsQuizPage displayId="course" />)
        expect(screen.getByTestId("state")).toHaveTextContent("empty")
    })

    it("executes setup navigation, filters and retry", () => {
        const view = render(<CourseFlashcardsQuizPage displayId="course" />)
        screen.getByText("review").click()
        screen.getByText("deep").click()
        screen.getByText("level").click()
        screen.getByText("retry").click(); screen.getByText("start").click(); screen.getByText("resume").click()
        expect(view.container.querySelector("[data-testid=state]")).toHaveTextContent("ready")
    })
    it("resolves the Vietnamese label branch", () => {
        locale.value = "vi"
        render(<CourseFlashcardsQuizPage displayId="course" />)
        expect(screen.getByTestId("state")).toHaveTextContent("ready")
    })
})
