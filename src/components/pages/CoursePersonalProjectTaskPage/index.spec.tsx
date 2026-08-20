import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CoursePersonalProjectTaskPage } from "./index"
type StateProps = { state: string }

const useQueryCoursePersonalProjectSwr = vi.hoisted(() => vi.fn())
const useQueryPersonalTaskAttemptsSwr = vi.hoisted(() => vi.fn())
const useMutateSubmitPersonalTaskAttemptSwr = vi.hoisted(() => vi.fn())

vi.mock("@/hooks/swr/useQueryCoursePersonalProjectSwr", () => ({ useQueryCoursePersonalProjectSwr }))
vi.mock("@/hooks/swr/useQueryPersonalTaskAttemptsSwr", () => ({ useQueryPersonalTaskAttemptsSwr }))
vi.mock("@/hooks/swr/useMutateSubmitPersonalTaskAttemptSwr", () => ({ useMutateSubmitPersonalTaskAttemptSwr }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("next-intl", () => ({ useLocale: () => "en" }))
vi.mock("./component", () => ({
    CoursePersonalProjectTaskPageBase: ({ state }: StateProps) => <div data-testid="state">{state}</div>,
}))

const project = {
    data: {
        course: { id: "course-1" },
        milestones: [{ tasks: [{ id: "task-1", title: "Task", maxScore: 10, description: "Do it" }] }],
    },
    error: undefined,
    mutate: vi.fn(),
}

describe("CoursePersonalProjectTaskPage", () => {
    beforeEach(() => {
        useQueryCoursePersonalProjectSwr.mockReset()
        useQueryPersonalTaskAttemptsSwr.mockReset().mockReturnValue({ data: [], error: undefined, mutate: vi.fn() })
        useMutateSubmitPersonalTaskAttemptSwr.mockReset().mockReturnValue({ error: undefined, isMutating: false, trigger: vi.fn() })
    })

    it.each([
        [{ ...project, data: undefined }, { error: undefined, isMutating: false }, "pending"],
        [{ ...project, error: new Error("load") }, { error: undefined, isMutating: false }, "failed"],
        [project, { error: undefined, isMutating: true }, "submitting"],
        [project, { error: new Error("submit"), isMutating: false }, "failed"],
        [project, { error: undefined, isMutating: false }, "ready"],
    ])("resolves %s state", (projectValue, submission, state) => {
        useQueryCoursePersonalProjectSwr.mockReturnValue(projectValue)
        useMutateSubmitPersonalTaskAttemptSwr.mockReturnValue({ ...submission, trigger: vi.fn() })
        render(<CoursePersonalProjectTaskPage displayId="course" taskId="task-1" />)
        expect(screen.getByTestId("state")).toHaveTextContent(state)
    })
})
