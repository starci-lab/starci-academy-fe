import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CoursePersonalProject } from "@/components/blocks/learn/CoursePersonalProject"
import type { CoursePersonalProjectBlockProps } from "@/components/blocks/learn/CoursePersonalProject/component"

const mocks = vi.hoisted(() => ({
    locale: "en",
    push: vi.fn(),
    mutate: vi.fn(),
    data: undefined as unknown,
    error: undefined as unknown,
}))

vi.mock("next-intl", () => ({ useLocale: () => mocks.locale }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks/swr/useQueryCoursePersonalProjectSwr", () => ({
    useQueryCoursePersonalProjectSwr: () => ({ data: mocks.data, error: mocks.error, mutate: mocks.mutate }),
}))

type PageStubProps = CoursePersonalProjectBlockProps

vi.mock("@/components/blocks/learn/CoursePersonalProject/component", () => ({
    CoursePersonalProjectBase: (input: PageStubProps) => (
        <>
            <output data-testid="state">{input.state}</output>
            <output data-testid="props">{JSON.stringify(input.data)}</output>
            <button type="button" onClick={input.on?.openCourse}>Open course</button>
            <button type="button" onClick={() => input.on?.openTask?.("task-9")}>Open task</button>
            <button type="button" onClick={input.on?.retry}>Retry</button>
        </>
    ),
}))

const data = {
    course: { id: "course-1", title: "System Design", displayId: "system-design" },
    milestones: [
        {
            id: "milestone-2",
            title: "Ship",
            orderIndex: 1,
            tasks: [
                { id: "task-3", title: "Deploy", type: null, maxScore: 20, completed: false, lastScore: 0, numAttempts: 0 },
            ],
        },
        {
            id: "milestone-1",
            title: "Build",
            orderIndex: 0,
            tasks: [
                { id: "task-1", title: "Plan", type: null, maxScore: 20, completed: true, lastScore: 16, numAttempts: 2 },
                { id: "task-2", title: "Code", type: null, maxScore: 20, completed: false, lastScore: 10, numAttempts: 1 },
            ],
        },
    ],
    progress: { tasksCompleted: 1, tasksTotal: 3, completionPercent: 33 },
    currentTask: { kind: "milestoneTask", id: "task-2", milestoneId: "milestone-1" },
}

const props = () => JSON.parse(screen.getByTestId("props").textContent ?? "{}") as CoursePersonalProjectBlockProps["data"]

describe("CoursePersonalProjectPage", () => {
    beforeEach(() => {
        mocks.locale = "en"
        mocks.data = data
        mocks.error = undefined
        vi.clearAllMocks()
    })

    it("derives next action, aggregate evidence and only the current milestone task grid", () => {
        render(<CoursePersonalProject displayId="system-design" />)

        expect(screen.getByTestId("state")).toHaveTextContent("ready")
        expect(props().nextTask).toEqual({ id: "task-2", position: "Next task · Build", title: "Code" })
        expect(props().completionFacts).toEqual([
            "1/3 tasks completed",
            "3 submissions",
            "Average score 13/20",
        ])
        expect(props().milestoneTitle).toBe("Build")
        expect(props().tasks.map((task) => task.id)).toEqual(["task-1", "task-2"])
        expect(props().tasks[1].isCurrent).toBe(true)
    })

    it("uses the first incomplete milestone when no resume pointer exists", () => {
        mocks.data = { ...data, currentTask: null }
        render(<CoursePersonalProject displayId="system-design" />)

        expect(props().milestoneTitle).toBe("Build")
        expect(props().nextTask).toBeUndefined()
    })

    it("keeps pending, empty and failed outcomes distinct", () => {
        mocks.data = undefined
        const { unmount } = render(<CoursePersonalProject displayId="system-design" />)
        expect(screen.getByTestId("state")).toHaveTextContent("pending")
        unmount()

        mocks.data = { ...data, milestones: [], progress: { tasksCompleted: 0, tasksTotal: 0, completionPercent: 0 }, currentTask: null }
        const empty = render(<CoursePersonalProject displayId="system-design" />)
        expect(screen.getByTestId("state")).toHaveTextContent("empty")
        expect(props().notice).toContain("does not have")
        empty.unmount()

        mocks.data = undefined
        mocks.error = new Error("network")
        render(<CoursePersonalProject displayId="system-design" />)
        expect(screen.getByTestId("state")).toHaveTextContent("failed")
        expect(props().notice).toContain("could not be loaded")
    })

    it("routes course and task actions and retries the owned query", () => {
        render(<CoursePersonalProject displayId="system-design" />)

        fireEvent.click(screen.getByRole("button", { name: "Open course" }))
        fireEvent.click(screen.getByRole("button", { name: "Open task" }))
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(mocks.push).toHaveBeenNthCalledWith(1, "/courses/system-design/learn")
        expect(mocks.push).toHaveBeenNthCalledWith(2, "/courses/system-design/learn/personal-project/tasks/task-9")
        expect(mocks.mutate).toHaveBeenCalledTimes(1)
    })
})
