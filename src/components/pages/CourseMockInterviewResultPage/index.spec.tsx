import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CourseMockInterviewResultPage } from "./index"
type StateProps = { state: string }

const useQueryCourseSwr = vi.hoisted(() => vi.fn())
const useQueryMockInterviewAttemptBySessionSwr = vi.hoisted(() => vi.fn())

vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr }))
vi.mock("@/hooks/swr/useQueryMockInterviewAttemptBySessionSwr", () => ({ useQueryMockInterviewAttemptBySessionSwr }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("next-intl", () => ({ useLocale: () => "en" }))
vi.mock("./component", () => ({
    CourseMockInterviewResultPageBase: ({ state }: StateProps) => <div data-testid="state">{state}</div>,
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
})
