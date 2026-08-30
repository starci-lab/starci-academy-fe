import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CoursePersonalProjectBase, type CoursePersonalProjectProps } from "@/components/blocks/learn/CoursePersonalProject/component"

const baseProps: CoursePersonalProjectProps["data"] = {
    breadcrumbLabel: "Course path",
    courseTitle: "System Design",
    title: "Personal Project",
    description: "One view of the next task and the whole project.",
    nextTaskLabel: "Next task",
    nextTask: { id: "task-2", milestone: "Build", title: "Build the service", evidence: "10/20 · 1 submission", href: "/en/courses/system-design/learn/personal-project/tasks/task-2" },
    continueLabel: "Continue project",
    allCompleteLabel: "All tasks complete",
    roadmapLabel: "Project roadmap",
    roadmapSearchLabel: "Search the project roadmap",
    roadmapSearchClearLabel: "Clear roadmap search",
    roadmapCountLabel: "3 stages",
    roadmapEmptyLabel: "No stages match.",
    milestones: [
        { id: "milestone-1", title: "Plan", status: "Completed", progress: "1/1", completionPercent: 100, href: "/en/courses/system-design/learn/personal-project/tasks/task-1", tone: "success" },
        { id: "milestone-2", title: "Build", status: "In progress", progress: "0/2", completionPercent: 0, href: "/en/courses/system-design/learn/personal-project/tasks/task-2", tone: "accent" },
        { id: "milestone-3", title: "Ship", status: "Upcoming", progress: "0/1", completionPercent: 0, tone: "neutral" },
    ],
    completionLabel: "Whole-project progress",
    completionPercent: 50,
    completionPercentLabel: "50%",
    completionFacts: [
        { label: "Tasks", value: "1/2" },
        { label: "Submissions", value: "3" },
        { label: "Average score", value: "18/20" },
    ],
    repository: {
        state: "ready",
        label: "Repository",
        connectedLabel: "Connected",
        emptyLabel: "Not connected",
        failedLabel: "Unavailable",
        branchLabel: "Branch",
        branch: "main",
        url: "https://github.com/starci/shop",
        openLabel: "Open repository",
        retryLabel: "Try again",
    },
    retryLabel: "Try again",
}

const draw = (state: CoursePersonalProjectProps["state"], data: Partial<CoursePersonalProjectProps["data"]> = {}, on?: CoursePersonalProjectProps["on"]) =>
    render(<CoursePersonalProjectBase state={state} data={{ ...baseProps, ...data }} on={on} />)

describe("CoursePersonalProjectPageBase", () => {
    it("ranks the next decision before the roadmap and supporting evidence", () => {
        const { container } = draw("ready")
        const text = container.textContent ?? ""

        expect(text.indexOf("Build the service")).toBeLessThan(text.indexOf("Project roadmap"))
        expect(text.indexOf("Project roadmap")).toBeLessThan(text.indexOf("Whole-project progress"))
        expect(screen.getByText("50%")).toBeInTheDocument()
        expect(screen.getByText("18/20")).toBeInTheDocument()
    })

    it("renders the primary action and navigable milestone summaries as native destinations", () => {
        draw("ready")

        expect(screen.getByRole("link", { name: "Continue project" })).toHaveAttribute("href", "/en/courses/system-design/learn/personal-project/tasks/task-2")
        expect(screen.getByRole("link", { name: "Plan" })).toHaveAttribute("href", "/en/courses/system-design/learn/personal-project/tasks/task-1")
        expect(screen.queryByRole("link", { name: "Ship" })).not.toBeInTheDocument()
    })

    it("submits roadmap search and keeps the collection bounded", () => {
        const searchRoadmap = vi.fn()
        const { container } = draw("ready", {}, { searchRoadmap })
        const search = screen.getByRole("search")
        fireEvent.change(screen.getByRole("searchbox", { name: "Search the project roadmap" }), { target: { value: "build" } })
        fireEvent.submit(search)

        expect(searchRoadmap).toHaveBeenCalledWith("build")
        expect(container.querySelector("[data-grammar-scroll='contained']")).not.toBeNull()
        expect(screen.getAllByRole("progressbar")).toHaveLength(4)
        expect(screen.getByText("3 stages")).toBeInTheDocument()
    })

    it("draws a deliberate empty result inside the roadmap surface", () => {
        draw("ready", { milestones: [], roadmapCountLabel: "0 results across 3 stages" })

        expect(screen.getByText("No stages match.")).toBeInTheDocument()
        expect(screen.getByText("0 results across 3 stages")).toBeInTheDocument()
    })

    it("replaces the primary action with completion copy when no task remains", () => {
        draw("ready", { nextTask: undefined })

        expect(screen.getByText("All tasks complete")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Continue project" })).not.toBeInTheDocument()
    })

    it("keeps roadmap usable when repository evidence fails", () => {
        const retryRepository = vi.fn()
        draw("ready", { repository: { ...baseProps.repository, state: "failed" } }, { retryRepository })

        expect(screen.getByText("Project roadmap")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retryRepository).toHaveBeenCalledTimes(1)
    })

    it("retains the page header and offers recovery after the primary query fails", () => {
        const retry = vi.fn()
        draw("failed", { notice: "Could not load the project", milestones: [] }, { retry })

        expect(screen.getByRole("heading", { name: "Personal Project" })).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retry).toHaveBeenCalledTimes(1)
    })
})
