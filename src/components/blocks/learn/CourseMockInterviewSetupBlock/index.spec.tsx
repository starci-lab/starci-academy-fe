import { act, render, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type TestInput = { state: string; on: { configure: (field: string, value: string) => void; start: () => void; resume?: () => void; retry: () => void; selectTab: (tab: string) => void } }
const mocks = vi.hoisted(() => ({
    input: undefined as TestInput | undefined,
    course: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    session: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    attempts: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    stats: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    start: { isMutating: false, trigger: vi.fn() }, push: vi.fn(), locale: "en",
}))

vi.mock("next-intl", () => ({ useLocale: () => mocks.locale }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => mocks.course }))
vi.mock("@/hooks/swr/useQueryMyInProgressMockInterviewSessionSwr", () => ({ useQueryMyInProgressMockInterviewSessionSwr: () => mocks.session }))
vi.mock("@/hooks/swr/useMutateStartMockInterviewSessionSwr", () => ({ useMutateStartMockInterviewSessionSwr: () => mocks.start }))
vi.mock("@/hooks/swr/useQueryMyMockInterviewAttemptsSwr", () => ({ useQueryMyMockInterviewAttemptsSwr: () => mocks.attempts }))
vi.mock("@/hooks/swr/useQueryMyMockInterviewStatsSwr", () => ({ useQueryMyMockInterviewStatsSwr: () => mocks.stats }))
vi.mock("./component", () => ({ CourseMockInterviewSetupBlockBase: (input: TestInput) => { mocks.input = input; return <output data-testid="setup" /> } }))

import { CourseMockInterviewSetupBlock } from "./index"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.input = undefined
    mocks.locale = "en"
    mocks.start.isMutating = false
    for (const item of [mocks.course, mocks.session, mocks.attempts, mocks.stats]) { item.data = undefined; item.error = undefined }
})

describe("CourseMockInterviewSetupBlock", () => {
    it("handles pending, failed, resumable and successful start states", async () => {
        const view = render(<CourseMockInterviewSetupBlock displayId="course" />)
        expect(mocks.input?.state).toBe("pending")
        mocks.course.error = new Error("offline")
        view.rerender(<CourseMockInterviewSetupBlock displayId="course" />)
        expect(mocks.input?.state).toBe("failed")

        mocks.course.error = undefined
        mocks.course.data = { id: "c1", title: "Course" }
        mocks.session.data = { sessionId: "resume" }
        mocks.attempts.data = { items: [] }
        mocks.stats.data = { insufficientData: true, byPhase: [] }
        view.rerender(<CourseMockInterviewSetupBlock displayId="course" />)
        expect(mocks.input?.state).toBe("resumable")
        act(() => { mocks.input?.on.resume?.() })
        expect(mocks.push).toHaveBeenCalledWith("/courses/course/learn/mock-interview/interview/resume")

        mocks.session.data = null
        mocks.start.trigger.mockResolvedValue({ data: { startMockInterviewSession: { success: true, data: { sessionId: "new" } } } })
        view.rerender(<CourseMockInterviewSetupBlock displayId="course" />)
        act(() => { mocks.input?.on.configure("level", "senior"); mocks.input?.on.configure("mode", "design"); mocks.input?.on.selectTab("history") })
        act(() => { mocks.input?.on.start() })
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/courses/course/learn/mock-interview/interview/new"))
        act(() => { mocks.input?.on.retry() })
        expect(mocks.course.mutate).toHaveBeenCalled()
    })
})
