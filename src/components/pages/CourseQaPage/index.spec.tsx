type TestPageInput = { state: string; on: Record<string, (...args: ReadonlyArray<unknown>) => unknown> }
type QaRequest = { parentCommentId?: string }
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
const m = vi.hoisted(() => ({ data: undefined as unknown, error: undefined as unknown, mutate: vi.fn(), questions: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() }, replies: { data: { comments: [] as Array<unknown> }, error: undefined as unknown, mutate: vi.fn() }, push: vi.fn(), replace: vi.fn() }))
vi.mock("next-intl", () => ({ useLocale: () => "en", useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: m.push, replace: m.replace }) }))

vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => ({ data: m.data, error: m.error, mutate: m.mutate }) }))
vi.mock("@/hooks/swr/useQueryCourseQaCommentsSwr", () => ({ useQueryCourseQaCommentsSwr: ({ parentCommentId }: QaRequest) => parentCommentId ? m.replies : m.questions }))
vi.mock("@/hooks/swr/useMutateCreateCourseQuestionSwr", () => ({ useMutateCreateCourseQuestionSwr: () => ({ error: undefined, isMutating: false, trigger: vi.fn() }) }))
vi.mock("./component", () => ({ CourseQaPageBase: ({ state }: TestPageInput) => <output data-testid="state">{state}</output> }))
import { CourseQaPage } from "./index"
beforeEach(() => { vi.clearAllMocks(); m.data = undefined; m.error = undefined; m.questions.data = undefined; m.questions.error = undefined; m.replies.data = { comments: [] }; m.replies.error = undefined })
describe("CourseQaPage route", () => {
    it("renders loading then failed transport states", () => { const view = render(<CourseQaPage displayId="course" />); expect(screen.getByTestId("state")).toHaveTextContent(/pending|loading|connecting/); m.error = new Error("offline"); view.rerender(<CourseQaPage displayId="course" />); expect(screen.getByTestId("state")).toHaveTextContent(/failed|error/) })
    it("renders a settled question and replies collection", () => { m.data = { id: "course", title: "Course" }; m.questions.data = { comments: [{ id: "q", body: "Question", author: { username: "Ada" }, isFounderAuthor: false, replyCount: 1, createdAt: "2026-01-01" }] }; render(<CourseQaPage displayId="course" />); expect(screen.getByTestId("state")).toHaveTextContent("ready") })
})





