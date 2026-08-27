import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type TestBlockInput = {
    readonly state: string
    readonly props: Record<string, unknown>
    readonly on: Record<string, (() => void) | undefined>
}

const mocks = vi.hoisted(() => ({
    course: { data: { id: "course-1" } as unknown, error: undefined as unknown, mutate: vi.fn() },
    attempt: { data: null as unknown, error: undefined as unknown, mutate: vi.fn() },
    session: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    retry: { isMutating: false, trigger: vi.fn() },
    abandon: { isMutating: false, trigger: vi.fn() },
    router: { push: vi.fn(), replace: vi.fn() },
}))

vi.mock("next-intl", () => ({ useLocale: () => "en" }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => mocks.router }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => mocks.course }))
vi.mock("@/hooks/swr/useQueryMockInterviewAttemptBySessionSwr", () => ({ useQueryMockInterviewAttemptBySessionSwr: () => mocks.attempt }))
vi.mock("@/hooks/swr/useQueryMyInProgressMockInterviewSessionSwr", () => ({ useQueryMyInProgressMockInterviewSessionSwr: () => mocks.session }))
vi.mock("@/hooks/swr/useMutateMockInterviewSessionLifecycleSwr", () => ({
    useMutateRetryMockInterviewSessionGradingSwr: () => mocks.retry,
    useMutateAbandonMockInterviewSessionSwr: () => mocks.abandon,
}))
vi.mock("./component", () => ({
    CourseMockInterviewResultBlockBase: ({ state, props, on }: TestBlockInput) => (
        <>
            <output data-testid="state">{state}</output>
            <output data-testid="props">{JSON.stringify(props)}</output>
            <button onClick={on.retry}>retry</button>
            <button onClick={on.abandon}>abandon</button>
            <button onClick={on.openHistory}>history</button>
            <button onClick={on.returnToCourse}>course</button>
        </>
    ),
}))

import { CourseMockInterviewResultBlock } from "./index"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.course.data = { id: "course-1" }
    mocks.course.error = undefined
    mocks.attempt.data = null
    mocks.attempt.error = undefined
    mocks.session.data = { sessionId: "session-1", status: "grading", revision: 4 }
    mocks.session.error = undefined
    mocks.retry.isMutating = false
    mocks.retry.trigger.mockResolvedValue({ data: { retryMockInterviewSessionGrading: { success: true } } })
    mocks.abandon.trigger.mockResolvedValue({ data: { abandonMockInterviewSession: { success: true } } })
})

describe("CourseMockInterviewResultBlock", () => {
    it("shows queued grading independently of whether an attempt exists yet", () => {
        render(<CourseMockInterviewResultBlock displayId="course" sessionId="session-1" />)
        expect(screen.getByTestId("state")).toHaveTextContent("grading")
    })

    it("exposes the authoritative failure and retries the same revision", async () => {
        mocks.session.data = {
            sessionId: "session-1",
            status: "grading_failed",
            revision: 6,
            gradingLastError: "MODEL_UNAVAILABLE",
            gradingAttemptCount: 2,
            gradingMaxAttempts: 3,
        }
        render(<CourseMockInterviewResultBlock displayId="course" sessionId="session-1" />)

        expect(screen.getByTestId("state")).toHaveTextContent("gradingFailed")
        expect(screen.getByTestId("props")).toHaveTextContent("MODEL_UNAVAILABLE")
        fireEvent.click(screen.getByText("retry"))

        await waitFor(() => expect(mocks.retry.trigger).toHaveBeenCalledWith({
            courseId: "course-1",
            sessionId: "session-1",
            expectedRevision: 6,
        }))
    })

    it("abandons a failed session before returning to setup", async () => {
        mocks.session.data = { sessionId: "session-1", status: "grading_failed", revision: 7 }
        render(<CourseMockInterviewResultBlock displayId="course" sessionId="session-1" />)
        fireEvent.click(screen.getByText("abandon"))

        await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith("/courses/course/learn/mock-interview"))
    })

    it("exposes the approved report navigation consequences", () => {
        mocks.attempt.data = { overallScore: 80, phaseScores: [], strengths: [], gaps: [], questionReviews: [], matchedContentIds: [] }
        mocks.session.data = null
        render(<CourseMockInterviewResultBlock displayId="course" sessionId="session-1" />)

        fireEvent.click(screen.getByText("history"))
        fireEvent.click(screen.getByText("course"))

        expect(mocks.router.push).toHaveBeenCalledWith("/courses/course/learn/mock-interview?tab=history")
        expect(mocks.router.push).toHaveBeenCalledWith("/courses/course/learn")
    })
})
