import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CourseFlashcardsQuizPage } from "./index"
type StateProps = { state: string }

const useQueryCourseSwr = vi.hoisted(() => vi.fn())
const useQueryFlashcardDecksByCourseSwr = vi.hoisted(() => vi.fn())
const useQueryMyInProgressFlashcardSessionSwr = vi.hoisted(() => vi.fn())
const useMutateStartFlashcardSessionSwr = vi.hoisted(() => vi.fn())

vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr }))
vi.mock("@/hooks/swr/useQueryFlashcardDecksByCourseSwr", () => ({ useQueryFlashcardDecksByCourseSwr }))
vi.mock("@/hooks/swr/useQueryMyInProgressFlashcardSessionSwr", () => ({ useQueryMyInProgressFlashcardSessionSwr }))
vi.mock("@/hooks/swr/useMutateStartFlashcardSessionSwr", () => ({ useMutateStartFlashcardSessionSwr }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("next-intl", () => ({ useLocale: () => "en" }))
vi.mock("./component", () => ({
    CourseFlashcardsQuizPageBase: ({ state }: StateProps) => <div data-testid="state">{state}</div>,
}))

const deck = { id: "deck-1", cards: [{ id: "card-1", level: "junior" }] }
const ready = () => {
    useQueryCourseSwr.mockReturnValue({ data: { id: "course-1" }, error: undefined, mutate: vi.fn() })
    useQueryFlashcardDecksByCourseSwr.mockReturnValue({ data: [deck], error: undefined, mutate: vi.fn() })
    useQueryMyInProgressFlashcardSessionSwr.mockReturnValue({ data: null, error: undefined })
    useMutateStartFlashcardSessionSwr.mockReturnValue({ error: undefined, trigger: vi.fn() })
}

describe("CourseFlashcardsQuizPage", () => {
    beforeEach(() => ready())

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
})
