import { fireEvent, render, screen } from "@testing-library/react"
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
    progress: { tasksCompleted: 1, tasksTotal: 3, completionPercent: 33 },
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
        vi.clearAllMocks()
    })

    it("derives one next decision, ordered milestone summaries and aggregate evidence", () => {
        render(<CoursePersonalProject displayId="system-design" />)

        expect(screen.getByTestId("state")).toHaveTextContent("ready")
        expect(props().nextTask).toEqual({ id: "task-2", milestone: "Build", title: "Code", evidence: "10/20 · 1 submission", href: "/en/courses/system-design/learn/personal-project/tasks/task-2" })
        expect(props().continueLabel).toBe("Continue: Code")
        expect(props().milestones.map((milestone) => milestone.id)).toEqual(["milestone-1", "milestone-2"])
        expect(props().milestones[0]).toMatchObject({ status: "In progress", progress: "1/2", completionPercent: 50, href: "/en/courses/system-design/learn/personal-project/tasks/task-2", tone: "accent" })
        expect(props().milestones[1]).toMatchObject({ status: "Upcoming", progress: "0/1", completionPercent: 0, tone: "neutral" })
        expect(props().completionFacts).toEqual([
            { label: "Tasks", value: "1/3" },
            { label: "Submissions", value: "3" },
            { label: "Average score", value: "13/20" },
        ])
        expect(props().repository).toMatchObject({ state: "ready", branch: "main", url: "https://github.com/starci/shop" })
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
})
