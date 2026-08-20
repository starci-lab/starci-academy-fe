import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CourseMockInterviewResultPage } from "./index"
type StateProps = { state: string; on?: { retry?: () => void; newSession?: () => void; back?: () => void } }

const useQueryCourseSwr = vi.hoisted(() => vi.fn())
const useQueryMockInterviewAttemptBySessionSwr = vi.hoisted(() => vi.fn())

vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr }))
vi.mock("@/hooks/swr/useQueryMockInterviewAttemptBySessionSwr", () => ({ useQueryMockInterviewAttemptBySessionSwr }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("next-intl", () => ({ useLocale: () => "en" }))
vi.mock("./component", () => ({
    CourseMockInterviewResultPageBase: ({ state, on }: StateProps) => <><div data-testid="state">{state}</div><button onClick={on?.retry}>retry</button><button onClick={on?.newSession}>new</button><button onClick={on?.back}>back</button></>,
}))

describe("CourseMockInterviewResultPage", () => {
    beforeEach(() => {
        useQueryCourseSwr.mockReset()
        useQueryMockInterviewAttemptBySessionSwr.mockReset()
        useQueryCourseSwr.mockReturnValue({ data: { id: "course-1" }, error: undefined, mutate: vi.fn() })
    })

    it.each([
        [new Error("network"), null, "failed"],
        [undefined, null, "grading"],
        [undefined, { overallScore: 80, phaseScores: [], questionReviews: [] }, "ready"],
    ])("resolves %s state", (error, data, state) => {
        useQueryCourseSwr.mockReturnValue({ data: error ? null : { id: "course-1" }, error, mutate: vi.fn() })
        useQueryMockInterviewAttemptBySessionSwr.mockReturnValue({ data, error: undefined, mutate: vi.fn() })
        render(<CourseMockInterviewResultPage displayId="course" sessionId="session" />)
        expect(screen.getByTestId("state")).toHaveTextContent(state)
    })
    it("dispatches result route actions with populated review data", () => {
        useQueryMockInterviewAttemptBySessionSwr.mockReturnValue({ data: { overallScore: 80, verdict: "pass", promptTitle: "Prompt", phaseScores: [{ phase: "qna", score: 80 }], strengths: ["clarity"], gaps: ["depth"], questionReviews: [{ question: "Q", score: 80, feedback: "Good" }] }, error: undefined, mutate: vi.fn() })
        render(<CourseMockInterviewResultPage displayId="course" sessionId="session" />)
        screen.getByText("retry").click(); screen.getByText("new").click(); screen.getByText("back").click()
    })
})
