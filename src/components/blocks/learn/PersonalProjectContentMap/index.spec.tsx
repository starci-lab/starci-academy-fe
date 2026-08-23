import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PersonalProjectContentMap } from "."

const mocks = vi.hoisted(() => ({
    pathname: "/courses/system-design/learn/personal-project",
    push: vi.fn(),
    data: undefined as unknown,
    error: undefined as unknown,
}))

vi.mock("next/navigation", () => ({ useParams: () => ({ displayId: "system-design" }) }))
vi.mock("@/i18n/navigation", () => ({
    usePathname: () => mocks.pathname,
    useRouter: () => ({ push: mocks.push }),
}))
vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) => (
        values === undefined ? key : `${key}:${Object.values(values).join("/")}`
    ),
}))
vi.mock("@/hooks/swr/useQueryCoursePersonalProjectSwr", () => ({
    useQueryCoursePersonalProjectSwr: () => ({ data: mocks.data, error: mocks.error }),
}))

type BaseStub = {
    readonly state: string
    readonly props: {
        readonly progressFact?: string
        readonly modules?: ReadonlyArray<{
            readonly id: string
            readonly title: string
            readonly isOpen: boolean
            readonly completionPercent: number
            readonly lessons: ReadonlyArray<{ readonly id: string; readonly title: string; readonly isCurrent: boolean }>
        }>
    }
    readonly on?: {
        readonly search?: (query: string) => void
        readonly toggleModule?: (id: string, isOpen: boolean) => void
        readonly openLesson?: (id: string) => void
    }
}

vi.mock("./component", () => ({
    PersonalProjectContentMapBase: (input: BaseStub) => (
        <>
            <output data-testid="map">{JSON.stringify(input.props.modules)}</output>
            <output data-testid="state">{input.state}</output>
            <output data-testid="fact">{input.props.progressFact}</output>
            <button type="button" onClick={() => input.on?.openLesson?.("task-9")}>Open task</button>
            <button type="button" onClick={() => input.on?.search?.("deploy")}>Search deploy</button>
            <button type="button" onClick={() => input.on?.toggleModule?.("milestone-ship", true)}>Open ship</button>
        </>
    ),
}))

const project = {
    milestones: [
        { id: "milestone-ship", orderIndex: 1, title: "Ship", tasks: [{ id: "task-3", title: "Deploy", completed: false, maxScore: 20, lastScore: 0, numAttempts: 0 }] },
        { id: "milestone-plan", orderIndex: 0, title: "Plan", tasks: [
            { id: "task-1", title: "Scope", completed: true, maxScore: 20, lastScore: 18, numAttempts: 2 },
            { id: "task-2", title: "Design", completed: false, maxScore: 20, lastScore: 0, numAttempts: 0 },
        ] },
    ],
    progress: { tasksCompleted: 1, tasksTotal: 3, completionPercent: 33 },
    currentTask: { kind: "milestoneTask", id: "task-2", milestoneId: "milestone-plan" },
}

const map = () => JSON.parse(screen.getByTestId("map").textContent ?? "[]") as ReadonlyArray<{
    readonly id: string
    readonly title: string
    readonly isOpen: boolean
    readonly completionPercent: number
    readonly lessons: ReadonlyArray<{ readonly id: string; readonly title: string; readonly isCurrent: boolean }>
}>

describe("PersonalProjectContentMap", () => {
    beforeEach(() => {
        mocks.pathname = "/courses/system-design/learn/personal-project"
        mocks.data = project
        mocks.error = undefined
        vi.clearAllMocks()
    })

    it("maps ordered milestones and their tasks inside the connected block", () => {
        render(<PersonalProjectContentMap />)
        expect(map().map((row) => row.title)).toEqual(["Plan", "Ship"])
        expect(map()[0]?.lessons.map((task) => task.title)).toEqual(["Scope", "Design"])
        expect(map()[0]?.completionPercent).toBe(50)
        expect(screen.getByTestId("fact")).toHaveTextContent("1/3")
    })

    it("owns route selection, filtering, expansion and navigation", () => {
        mocks.pathname = "/courses/system-design/learn/personal-project/tasks/task-3"
        render(<PersonalProjectContentMap />)
        expect(map().filter((row) => row.isOpen).map((row) => row.id)).toEqual(["milestone-ship"])
        expect(map()[1]?.lessons.filter((task) => task.isCurrent).map((task) => task.id)).toEqual(["task-3"])

        fireEvent.click(screen.getByRole("button", { name: "Search deploy" }))
        expect(map().map((row) => row.id)).toEqual(["milestone-ship"])
        fireEvent.click(screen.getByRole("button", { name: "Open ship" }))
        fireEvent.click(screen.getByRole("button", { name: "Open task" }))
        expect(mocks.push).toHaveBeenCalledWith("/courses/system-design/learn/personal-project/tasks/task-9")
    })

    it("keeps pending and failed states at the roadmap block owner", () => {
        mocks.data = undefined
        const { unmount } = render(<PersonalProjectContentMap />)
        expect(screen.getByTestId("state")).toHaveTextContent("pending")
        unmount()
        mocks.error = new Error("network")
        render(<PersonalProjectContentMap />)
        expect(screen.getByTestId("state")).toHaveTextContent("failed")
    })
})
