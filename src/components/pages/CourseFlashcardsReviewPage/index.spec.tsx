type TestPageInput = { state: string; on: Record<string, (...args: ReadonlyArray<unknown>) => unknown> }
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
const m = vi.hoisted(() => ({ data: undefined as unknown, error: undefined as unknown, decks: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() }, due: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() }, stats: { data: undefined as unknown, error: undefined as unknown }, sessions: { data: null as unknown, error: undefined as unknown }, push: vi.fn(), replace: vi.fn() }))
vi.mock("next-intl", () => ({ useLocale: () => "en", useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: m.push, replace: m.replace }) }))

vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => ({ data: m.data, error: m.error, mutate: m.mutate }) }))
vi.mock("@/hooks/swr/useQueryFlashcardDecksByCourseSwr", () => ({ useQueryFlashcardDecksByCourseSwr: () => m.decks, useQueryMyDueFlashcardsSwr: () => m.due }))
vi.mock("@/hooks/swr/useQueryMyFlashcardStatsSwr", () => ({ useQueryMyFlashcardStatsSwr: () => m.stats }))
vi.mock("@/hooks/swr/useQueryMyInProgressFlashcardSessionSwr", () => ({ useQueryMyInProgressFlashcardSessionSwr: () => m.sessions }))
vi.mock("@/hooks/swr/useMutateStartFlashcardSessionSwr", () => ({ useMutateStartFlashcardSessionSwr: () => ({ error: undefined, trigger: vi.fn() }) }))
vi.mock("./component", () => ({ CourseFlashcardsReviewPageBase: ({ state }: TestPageInput) => <output data-testid="state">{state}</output> }))
import { CourseFlashcardsReviewPage } from "./index"
beforeEach(() => { vi.clearAllMocks(); m.data = undefined; m.error = undefined; m.decks.data = undefined; m.decks.error = undefined; m.due.data = undefined; m.due.error = undefined; m.stats.data = undefined; m.stats.error = undefined; m.sessions.data = null; m.sessions.error = undefined })
describe("CourseFlashcardsReviewPage route", () => {
    it("renders loading then failed transport states", () => { const view = render(<CourseFlashcardsReviewPage displayId="course" />); expect(screen.getByTestId("state")).toHaveTextContent(/pending|loading|connecting/); m.error = new Error("offline"); view.rerender(<CourseFlashcardsReviewPage displayId="course" />); expect(screen.getByTestId("state")).toHaveTextContent(/failed|error/) })
    it("renders a settled deck review overview", () => { m.data = { id: "course" }; m.decks.data = [{ id: "deck", title: "Deck", description: "", difficulty: "junior", cards: [{ id: "card" }], dueCount: 1, masteredCount: 0 }]; m.due.data = { dueCount: 1, cards: [{ cardId: "card" }] }; m.stats.data = { currentStreak: 2, retentionRate: 80 }; const view = render(<CourseFlashcardsReviewPage displayId="course" />); expect(screen.getByTestId("state")).toHaveTextContent("ready"); view.unmount() })
})





