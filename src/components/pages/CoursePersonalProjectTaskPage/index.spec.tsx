import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CoursePersonalProjectTaskPage } from "./index"

type BaseProps = { state: string; on?: Record<string, (...args: Array<never>) => void> }
const mocks = vi.hoisted(() => ({
    project: vi.fn(), workspace: vi.fn(), attempts: vi.fn(), submit: vi.fn(), settings: vi.fn(), push: vi.fn(),
}))

vi.mock("@/hooks/swr/useQueryCoursePersonalProjectSwr", () => ({ useQueryCoursePersonalProjectSwr: mocks.project }))
vi.mock("@/hooks/swr/useQueryPersonalProjectTaskWorkspaceSwr", () => ({ useQueryPersonalProjectTaskWorkspaceSwr: mocks.workspace }))
vi.mock("@/hooks/swr/useQueryPersonalTaskAttemptsSwr", () => ({ useQueryPersonalTaskAttemptsSwr: mocks.attempts }))
vi.mock("@/hooks/swr/useMutateSubmitPersonalTaskAttemptSwr", () => ({ useMutateSubmitPersonalTaskAttemptSwr: mocks.submit }))
vi.mock("@/hooks/swr/useMutateSyncPersonalProjectGithubSwr", () => ({ useMutateSyncPersonalProjectGithubSwr: mocks.settings }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("next-intl", () => ({ useLocale: () => "en" }))
vi.mock("./component", () => ({
    CoursePersonalProjectTaskPageBase: ({ state, on }: BaseProps) => <>
        <div data-testid="state">{state}</div>
        <button onClick={on?.submit}>submit</button>
        <button onClick={on?.retry}>retry</button>
        <button onClick={on?.back}>back</button>
    </>,
}))

const projectData = {
    course: { id: "course-1" },
    milestones: [{ tasks: [{ id: "task-1", title: "Task", maxScore: 10, description: "Do it" }] }],
}
const workspaceData = {
    task: {
        id: "task-1", title: "Task", description: "Do it", maxScore: 10, briefs: [], codeImplementations: [], criterias: [],
    },
    repository: { githubUrl: "https://github.com/starci/demo", branch: "main" },
    models: [],
}

describe("CoursePersonalProjectTaskPage", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.project.mockReturnValue({ data: projectData, error: undefined, mutate: vi.fn() })
        mocks.workspace.mockReturnValue({ data: workspaceData, error: undefined, mutate: vi.fn() })
        mocks.attempts.mockReturnValue({ data: { data: [], count: 0 }, error: undefined, mutate: vi.fn() })
        mocks.submit.mockReturnValue({ error: undefined, isMutating: false, trigger: vi.fn().mockResolvedValue({}) })
        mocks.settings.mockReturnValue({ error: undefined, isMutating: false, trigger: vi.fn().mockResolvedValue({}) })
    })

    it.each([
        [undefined, undefined, false, "pending"],
        [projectData, new Error("load"), false, "failed"],
        [projectData, undefined, true, "submitting"],
        [projectData, undefined, false, "ready"],
    ])("maps project=%s error=%s submitting=%s to %s", (data, error, isMutating, state) => {
        mocks.project.mockReturnValue({ data, error, mutate: vi.fn() })
        mocks.submit.mockReturnValue({ error: undefined, isMutating, trigger: vi.fn() })
        render(<CoursePersonalProjectTaskPage displayId="course" taskId="task-1" />)
        expect(screen.getByTestId("state")).toHaveTextContent(state)
    })

    it("submits the repository and routes to the accepted result page", async () => {
        const trigger = vi.fn().mockResolvedValue({})
        mocks.submit.mockReturnValue({ error: undefined, isMutating: false, trigger })
        render(<CoursePersonalProjectTaskPage displayId="course" taskId="task-1" />)

        fireEvent.click(screen.getByText("submit"))
        await waitFor(() => expect(trigger).toHaveBeenCalledWith(expect.objectContaining({
            courseId: "course-1", taskId: "task-1", githubUrl: "https://github.com/starci/demo", branch: "main",
        })))
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/courses/course/learn/personal-project/tasks/task-1/result"))
    })
})
