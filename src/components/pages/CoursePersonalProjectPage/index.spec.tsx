import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CoursePersonalProject } from "@/components/blocks/learn/CoursePersonalProject"
import type { CoursePersonalProjectProps } from "@/components/blocks/learn/CoursePersonalProject/component"

const mocks = vi.hoisted(() => ({
    locale: "en",
    push: vi.fn(),
    mutate: vi.fn(),
    repositoryMutate: vi.fn(),
    data: undefined as unknown,
    error: undefined as unknown,
    repositoryData: { githubUrl: "https://github.com/starci/shop", branch: "main", tokenLast4: "1234" } as unknown,
    repositoryError: undefined as unknown,
}))

vi.mock("next-intl", () => ({ useLocale: () => mocks.locale }))
type LocalizedPathnameInput = { readonly locale: string; readonly href: string }
vi.mock("@/i18n/navigation", () => ({
    useRouter: () => ({ push: mocks.push }),
    getPathname: ({ locale, href }: LocalizedPathnameInput) => `/${locale}${href}`,
}))
vi.mock("@/hooks/swr/useQueryCoursePersonalProjectSwr", () => ({
    useQueryCoursePersonalProjectSwr: () => ({ data: mocks.data, error: mocks.error, mutate: mocks.mutate }),
}))
vi.mock("@/hooks/swr/useQueryPersonalProjectRepositorySwr", () => ({
    useQueryPersonalProjectRepositorySwr: () => ({ data: mocks.repositoryData, error: mocks.repositoryError, mutate: mocks.repositoryMutate }),
}))

type PageStubProps = CoursePersonalProjectProps
vi.mock("@/components/blocks/learn/CoursePersonalProject/component", () => ({
    CoursePersonalProjectBase: (input: PageStubProps) => <>
        <output data-testid="state">{input.state}</output>
        <output data-testid="props">{JSON.stringify(input.data)}</output>
        <button type="button" onClick={input.on?.openCourse}>Open course</button>
        <button type="button" onClick={input.on?.retry}>Retry</button>
        <button type="button" onClick={input.on?.retryRepository}>Retry repository</button>
        <button type="button" onClick={() => input.on?.searchRoadmap?.("ship")}>Search roadmap</button>
    </>,
}))

const data = {
    course: { id: "course-1", title: "System Design", displayId: "system-design" },
    milestones: [
        { id: "milestone-2", title: "Ship", orderIndex: 1, tasks: [{ id: "task-3", title: "Deploy", type: null, maxScore: 20, completed: false, lastScore: 0, numAttempts: 0 }] },
        { id: "milestone-1", title: "Build", orderIndex: 0, tasks: [
            { id: "task-1", title: "Plan", type: null, maxScore: 20, completed: true, lastScore: 16, numAttempts: 2 },
            { id: "task-2", title: "Code", type: null, maxScore: 20, completed: false, lastScore: 10, numAttempts: 1 },
        ] },
    ],
    progress: { tasksCompleted: 1, tasksTotal: 3, completionPercent: 67 },
    currentTask: { kind: "milestoneTask", id: "task-2", milestoneId: "milestone-1" },
}

const props = () => JSON.parse(screen.getByTestId("props").textContent ?? "{}") as CoursePersonalProjectProps["data"]

describe("CoursePersonalProjectPage", () => {
    beforeEach(() => {
        mocks.locale = "en"
        mocks.data = data
        mocks.error = undefined
        mocks.repositoryData = { githubUrl: "https://github.com/starci/shop", branch: "main", tokenLast4: "1234" }
        mocks.repositoryError = undefined
        document.documentElement.scrollTop = 240
        document.body.scrollTop = 240
        vi.clearAllMocks()
    })

    it("derives one next decision, ordered milestone summaries and aggregate evidence", () => {
        render(<CoursePersonalProject displayId="system-design" />)

        expect(screen.getByTestId("state")).toHaveTextContent("ready")
        expect(props().nextTask).toEqual({ id: "task-2", milestone: "Build", title: "Code", evidence: "10/20 · 1 submission", href: "/en/courses/system-design/learn/personal-project/tasks/task-2" })
        expect(props().continueLabel).toBe("Continue project")
        expect(props().milestones.map((milestone) => milestone.id)).toEqual(["milestone-1", "milestone-2"])
        expect(props().milestones[0]).toMatchObject({ position: 1, status: "In progress", progress: "1/2", targetTaskId: "task-2", tone: "accent" })
        expect(props().milestones[1]).toMatchObject({ position: 2, status: "Upcoming", progress: "0/1", tone: "neutral" })
        expect(props().completionFacts).toEqual([
            { label: "Tasks", value: "1/3" },
            { label: "Submissions", value: "3" },
            { label: "Average score", value: "13/20" },
        ])
        expect(props().completionPercent).toBe(33)
        expect(props().completionPercentLabel).toBe("33%")
        expect(props().projectRailLabel).toBe("Project evidence")
        expect(props().repository).toMatchObject({ state: "ready", branch: "main", url: "https://github.com/starci/shop" })
    })

    it("restores the overview to the page start when the course changes", () => {
        const view = render(<CoursePersonalProject displayId="system-design" />)

        expect(document.documentElement.scrollTop).toBe(0)
        expect(document.body.scrollTop).toBe(0)

        document.documentElement.scrollTop = 180
        document.body.scrollTop = 180
        view.rerender(<CoursePersonalProject displayId="distributed-systems" />)

        expect(document.documentElement.scrollTop).toBe(0)
        expect(document.body.scrollTop).toBe(0)
    })

    it("keeps pending, empty and failed outcomes distinct", () => {
        mocks.data = undefined
        mocks.repositoryData = undefined
        const pending = render(<CoursePersonalProject displayId="system-design" />)
        expect(screen.getByTestId("state")).toHaveTextContent("pending")
        pending.unmount()

        mocks.data = { ...data, milestones: [], progress: { tasksCompleted: 0, tasksTotal: 0, completionPercent: 0 }, currentTask: null }
        const empty = render(<CoursePersonalProject displayId="system-design" />)
        expect(screen.getByTestId("state")).toHaveTextContent("empty")
        empty.unmount()

        mocks.data = undefined
        mocks.error = new Error("network")
        render(<CoursePersonalProject displayId="system-design" />)
        expect(screen.getByTestId("state")).toHaveTextContent("failed")
    })

    it("recovers one transient null response instead of presenting it as an empty project", async () => {
        mocks.data = null
        mocks.repositoryData = undefined
        mocks.mutate.mockResolvedValueOnce(data)
        const view = render(<CoursePersonalProject displayId="system-design" />)

        expect(screen.getByTestId("state")).toHaveTextContent("pending")
        await waitFor(() => expect(mocks.mutate).toHaveBeenCalledTimes(1))

        mocks.data = data
        view.rerender(<CoursePersonalProject displayId="system-design" />)
        expect(screen.getByTestId("state")).toHaveTextContent("ready")
    })

    it("fails visibly when the one-shot null recovery still cannot resolve a project", async () => {
        mocks.data = null
        mocks.repositoryData = undefined
        mocks.mutate.mockResolvedValueOnce(null)
        render(<CoursePersonalProject displayId="system-design" />)

        expect(screen.getByTestId("state")).toHaveTextContent("pending")
        await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("failed"))
        expect(mocks.mutate).toHaveBeenCalledTimes(1)
    })

    it("routes owned actions and retries primary and ancillary queries independently", () => {
        render(<CoursePersonalProject displayId="system-design" />)

        fireEvent.click(screen.getByRole("button", { name: "Open course" }))
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        fireEvent.click(screen.getByRole("button", { name: "Retry repository" }))
        expect(mocks.push).toHaveBeenNthCalledWith(1, "/courses/system-design/learn")
        expect(mocks.mutate).toHaveBeenCalledTimes(1)
        expect(mocks.repositoryMutate).toHaveBeenCalledTimes(1)
    })

    it("filters the roadmap by title or state without dropping project evidence", () => {
        render(<CoursePersonalProject displayId="system-design" />)

        fireEvent.click(screen.getByRole("button", { name: "Search roadmap" }))
        expect(props().milestones).toHaveLength(1)
        expect(props().milestones[0]).toMatchObject({ id: "milestone-2", title: "Ship" })
        expect(props().roadmapCountLabel).toBe("1 results across 2 stages")
        expect(props().completionFacts).toHaveLength(3)
    })

    it("does not present the total stage inventory as completed progress", () => {
        render(<CoursePersonalProject displayId="system-design" />)

        expect(props().roadmapCountLabel).toBe("2 stages")
        expect(props().roadmapCountLabel).not.toContain("2/2")
    })

    it("does not claim project completion when an incomplete learner has no current task", () => {
        mocks.data = { ...data, currentTask: null, progress: { tasksCompleted: 0, tasksTotal: 3, completionPercent: 0 } }
        render(<CoursePersonalProject displayId="system-design" />)

        expect(props().nextTask).toBeUndefined()
        expect(props().nextTaskFallbackLabel).toBe("No personal-project task is currently available to continue.")
    })

    it("uses completion copy only when every project task is complete", () => {
        mocks.data = { ...data, currentTask: null, progress: { tasksCompleted: 3, tasksTotal: 3, completionPercent: 100 } }
        render(<CoursePersonalProject displayId="system-design" />)

        expect(props().nextTaskFallbackLabel).toBe("You've completed every task in your personal project.")
    })
})
