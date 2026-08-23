import { act, render, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type TestInput = { state: string; on: { course: () => void; search: (value: string) => void; changeDraft: (value: string) => void; ask: () => void; openThread: (id: string) => void; closeThread: () => void; retry: () => void } }
type QaRequest = { readonly parentCommentId?: string }
const mocks = vi.hoisted(() => ({
    input: undefined as TestInput | undefined,
    course: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    questions: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    replies: { data: { comments: [] as Array<unknown> } as unknown, error: undefined as unknown, mutate: vi.fn() },
    create: { error: undefined as unknown, isMutating: false, trigger: vi.fn() }, push: vi.fn(), locale: "en",
}))

vi.mock("next-intl", () => ({ useLocale: () => mocks.locale }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => mocks.course }))
vi.mock("@/hooks/swr/useQueryCourseQaCommentsSwr", () => ({ useQueryCourseQaCommentsSwr: ({ parentCommentId }: QaRequest) => parentCommentId ? mocks.replies : mocks.questions }))
vi.mock("@/hooks/swr/useMutateCreateCourseQuestionSwr", () => ({ useMutateCreateCourseQuestionSwr: () => mocks.create }))
vi.mock("./component", () => ({ CourseQaBase: (input: TestInput) => { mocks.input = input; return <output data-testid="qa" /> } }))

import { CourseQa } from "./index"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.input = undefined
    mocks.course.data = undefined
    mocks.course.error = undefined
    mocks.questions.data = undefined
    mocks.questions.error = undefined
    mocks.replies.data = { comments: [] }
    mocks.replies.error = undefined
    mocks.create.isMutating = false
})

describe("CourseQa", () => {
    it("maps question states and submits a valid authored question", async () => {
        const view = render(<CourseQa displayId="course" />)
        expect(mocks.input?.state).toBe("pending")
        mocks.course.error = new Error("offline")
        view.rerender(<CourseQa displayId="course" />)
        expect(mocks.input?.state).toBe("failed")
        mocks.course.error = undefined
        mocks.course.data = { id: "c1", title: "Course" }
        mocks.questions.data = { comments: [] }
        view.rerender(<CourseQa displayId="course" />)
        expect(mocks.input?.state).toBe("empty")
        mocks.questions.data = { comments: [{ id: "q", body: "Question", author: { username: "Ada" }, isFounderAuthor: true, replyCount: 1, createdAt: "2026-01-01" }] }
        view.rerender(<CourseQa displayId="course" />)
        expect(mocks.input?.state).toBe("ready")
        mocks.create.trigger.mockResolvedValue({ data: { createComment: { success: true } } })
        act(() => { mocks.input?.on.changeDraft("How?"); mocks.input?.on.search("question"); mocks.input?.on.openThread("q") })
        act(() => { mocks.input?.on.closeThread(); mocks.input?.on.ask(); mocks.input?.on.course(); mocks.input?.on.retry() })
        await waitFor(() => expect(mocks.questions.mutate).toHaveBeenCalled())
        expect(mocks.push).toHaveBeenCalledWith("/courses/course")
    })
})
