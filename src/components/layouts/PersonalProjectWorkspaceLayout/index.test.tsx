import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PersonalProjectWorkspaceLayout } from "."

/**
 * What these tests guard.
 *
 * The connected half turns one project answer into a flat rail of task destinations: milestones in
 * their declared order, each task labelled by the milestone it belongs to, and exactly one of them
 * marked current. Which one is current is decided by the ROUTE first and by the project's own
 * pointer only when the route names none - a rail that trusted the pointer while the reader is
 * standing on another task would highlight the wrong row.
 */

const mocks = vi.hoisted(() => ({
    pathname: "/courses/system-design/learn/personal-project",
    push: vi.fn(),
    data: undefined as unknown,
    error: undefined as unknown,
}))

vi.mock("@/i18n/navigation", () => ({
    usePathname: () => mocks.pathname,
    useRouter: () => ({ push: mocks.push }),
}))
vi.mock("@/hooks/swr/useQueryCoursePersonalProjectSwr", () => ({
    useQueryCoursePersonalProjectSwr: () => ({ data: mocks.data, error: mocks.error }),
}))

type LayoutStub = {
    readonly milestones: ReadonlyArray<{ readonly id: string, readonly label: string, readonly isCurrent?: boolean }>
    readonly onTask?: (id: string) => void
    readonly isLoading?: boolean
}

vi.mock("./component", () => ({
    PersonalProjectWorkspaceLayoutBase: (input: LayoutStub) => (
        <>
            <output data-testid="rail">{JSON.stringify(input.milestones)}</output>
            <output data-testid="loading">{String(input.isLoading)}</output>
            <button type="button" onClick={() => input.onTask?.("task-9")}>Open task 9</button>
        </>
    ),
}))

const project = {
    milestones: [
        { orderIndex: 1, title: "Ship", tasks: [{ id: "task-3", title: "Deploy" }] },
        { orderIndex: 0, title: "Plan", tasks: [{ id: "task-1", title: "Scope" }, { id: "task-2", title: "Design" }] },
    ],
    currentTask: { kind: "milestoneTask", id: "task-2" },
}

const rail = () => JSON.parse(screen.getByTestId("rail").textContent ?? "[]") as ReadonlyArray<{
    readonly id: string
    readonly label: string
    readonly isCurrent?: boolean
}>

describe("PersonalProjectWorkspaceLayout", () => {
    beforeEach(() => {
        mocks.pathname = "/courses/system-design/learn/personal-project"
        mocks.data = project
        mocks.error = undefined
        vi.clearAllMocks()
    })

    it("flattens milestones into task destinations in their declared order", () => {
        render(<PersonalProjectWorkspaceLayout displayId="system-design" surface={<div />} />)

        expect(rail().map((row) => row.id)).toEqual(["task-1", "task-2", "task-3"])
        expect(rail()[0].label).toBe("Plan · Scope")
        expect(rail()[2].label).toBe("Ship · Deploy")
    })

    it("marks the project's own pointer current while the route names no task", () => {
        render(<PersonalProjectWorkspaceLayout displayId="system-design" surface={<div />} />)
        expect(rail().filter((row) => row.isCurrent).map((row) => row.id)).toEqual(["task-2"])
    })

    it("lets the route the reader is standing on outrank the project's pointer", () => {
        mocks.pathname = "/courses/system-design/learn/personal-project/tasks/task-3"
        render(<PersonalProjectWorkspaceLayout displayId="system-design" surface={<div />} />)
        expect(rail().filter((row) => row.isCurrent).map((row) => row.id)).toEqual(["task-3"])
    })

    it("marks nothing current when the project points at something that is not a task", () => {
        mocks.data = { ...project, currentTask: { kind: "challenge", id: "task-2" } }
        render(<PersonalProjectWorkspaceLayout displayId="system-design" surface={<div />} />)
        expect(rail().some((row) => row.isCurrent)).toBe(false)
    })

    it("rests the rail while the project is still arriving and stops once it failed", () => {
        mocks.data = undefined
        const { unmount } = render(<PersonalProjectWorkspaceLayout displayId="system-design" surface={<div />} />)
        expect(screen.getByTestId("loading")).toHaveTextContent("true")
        expect(rail()).toEqual([])
        unmount()

        mocks.error = new Error("network")
        render(<PersonalProjectWorkspaceLayout displayId="system-design" surface={<div />} />)
        expect(screen.getByTestId("loading")).toHaveTextContent("false")
    })

    it("routes a pressed task under the course it belongs to", () => {
        render(<PersonalProjectWorkspaceLayout displayId="system-design" surface={<div />} />)
        fireEvent.click(screen.getByRole("button", { name: "Open task 9" }))
        expect(mocks.push).toHaveBeenCalledWith("/courses/system-design/learn/personal-project/tasks/task-9")
    })
})
