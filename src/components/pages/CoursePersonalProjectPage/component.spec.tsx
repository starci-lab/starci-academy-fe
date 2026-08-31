import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CoursePersonalProjectBase, type CoursePersonalProjectProps } from "@/components/blocks/learn/CoursePersonalProject/component"

const baseProps: CoursePersonalProjectProps["data"] = {
    breadcrumbLabel: "Course path",
    courseTitle: "System Design",
    title: "Personal Project",
    description: "One view of the next task and the whole project.",
    mediaAlt: "Illustration of a project delivery journey.",
    nextTaskLabel: "Next task",
    nextTask: { id: "task-2", milestone: "Build", title: "Build the service", evidence: "10/20 · 1 submission", href: "/en/courses/system-design/learn/personal-project/tasks/task-2" },
    continueLabel: "Continue project",
    nextTaskFallbackLabel: "All tasks complete",
    roadmapLabel: "Project roadmap",
    roadmapLoadingLabel: "Loading project roadmap…",
    roadmapSearchLabel: "Search the project roadmap",
    roadmapSearchClearLabel: "Clear roadmap search",
    roadmapCountLabel: "3 stages",
    roadmapEmptyLabel: "No stages match.",
    milestones: [
        { id: "milestone-1", title: "Plan", status: "Completed", progress: "1/1", targetTaskId: "task-1", tone: "success" },
        { id: "milestone-2", title: "Build", status: "In progress", progress: "0/2", targetTaskId: "task-2", tone: "accent" },
        { id: "milestone-3", title: "Ship", status: "Upcoming", progress: "0/1", tone: "neutral" },
    ],
    completionLabel: "Whole-project progress",
    projectRailLabel: "Project evidence",
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
        continueLabel: "Open task to connect repository",
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
        expect(container.querySelector("[data-grammar-composition='context-intro']")).not.toBeNull()
        expect(container.querySelector("[data-grammar-primary-region='true']")).not.toBeNull()
        expect(container.querySelector("[data-grammar-rail-inset='content'].px-3.py-6")).not.toBeNull()
        expect(container.querySelector("[data-grammar-rail-mode='sticky']")).not.toBeNull()
        expect(container.querySelectorAll("ol[data-project-roadmap='true'] > li")).toHaveLength(3)
        expect(screen.getByText("Tasks").parentElement?.parentElement).toHaveClass("flex-col")
        expect(screen.getByText("Tasks").parentElement).toHaveClass("justify-between", "text-left")
    })

    it("renders roadmap destinations as native links when Grammar receives resolved hrefs", () => {
        draw("ready", {
            milestones: [{ ...baseProps.milestones[0], targetTaskHref: "/en/courses/system-design/learn/personal-project/tasks/task-1" }],
        })

        expect(screen.getByRole("link", { name: "Plan" })).toHaveAttribute("href", "/en/courses/system-design/learn/personal-project/tasks/task-1")
    })

    it("renders the primary action as a native destination and routes fallback milestone controls", () => {
        const openTask = vi.fn()
        draw("ready", {}, { openTask })

        expect(screen.getByRole("link", { name: "Continue project" })).toHaveAttribute("href", "/en/courses/system-design/learn/personal-project/tasks/task-2")
        fireEvent.click(screen.getByRole("button", { name: "Plan" }))
        expect(openTask).toHaveBeenCalledWith("task-1")
        expect(screen.queryByRole("button", { name: "Ship" })).not.toBeInTheDocument()
    })

    it("submits roadmap search and keeps the collection bounded", () => {
        const searchRoadmap = vi.fn()
        const { container } = draw("ready", {}, { searchRoadmap })
        const search = screen.getByRole("search")
        fireEvent.change(screen.getByRole("searchbox", { name: "Search the project roadmap" }), { target: { value: "build" } })
        fireEvent.submit(search)

        expect(searchRoadmap).toHaveBeenCalledWith("build")
        const scrollOwner = container.querySelector("[data-grammar-scroll='contained']")
        expect(scrollOwner).not.toBeNull()
        expect(scrollOwner?.closest("[class*='--starci-core-contained-max-height']")).not.toBeNull()
        expect(scrollOwner?.className).not.toContain("overflow-visible")
        expect(scrollOwner?.querySelector("[data-grammar-list='true']")?.className).not.toContain("overflow-visible")
        expect(screen.getByText("3 stages")).toBeInTheDocument()
    })

    it("keeps loading feedback dense without exposing a ready-looking search control", () => {
        const { container } = draw("pending", { milestones: [] })

        expect(container.querySelectorAll("ol[data-project-roadmap='true'] > li")).toHaveLength(6)
        expect(screen.queryByRole("searchbox", { name: "Search the project roadmap" })).not.toBeInTheDocument()
        expect(screen.getByText("Loading project roadmap…")).toBeInTheDocument()
    })

    it("draws a deliberate empty result inside the roadmap surface", () => {
        draw("ready", { milestones: [], roadmapCountLabel: "0 results across 3 stages" })

        expect(screen.getByText("No stages match.")).toBeInTheDocument()
        expect(screen.getByText("0 results across 3 stages")).toBeInTheDocument()
    })

    it("keeps authored milestone positions when a filtered roadmap renders one result", () => {
        draw("ready", {
            roadmapCountLabel: "1 result across 20 stages",
            milestones: [{ id: "milestone-15", position: 15, title: "Package Docker", status: "Upcoming", progress: "0/5", tone: "neutral" }],
        })

        expect(screen.getByText("15")).toBeInTheDocument()
        expect(screen.getByRole("img", { name: "Illustration of a project delivery journey." })).toBeInTheDocument()
    })

    it("replaces the primary action with completion copy when no task remains", () => {
        draw("ready", { nextTask: undefined, nextTaskFallbackLabel: "All tasks complete" })

        expect(screen.getByText("All tasks complete")).toBeInTheDocument()
        expect(screen.queryByRole("link", { name: "Continue project" })).not.toBeInTheDocument()
    })

    it("keeps roadmap usable when repository evidence fails", () => {
        const retryRepository = vi.fn()
        draw("ready", { repository: { ...baseProps.repository, state: "failed" } }, { retryRepository })

        expect(screen.getByText("Project roadmap")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retryRepository).toHaveBeenCalledTimes(1)
    })

    it("offers the current task beside an unresolved repository", () => {
        draw("ready", { repository: { ...baseProps.repository, branch: undefined, url: undefined } })

        expect(screen.getByRole("link", { name: "Open task to connect repository" })).toHaveAttribute("href", "/en/courses/system-design/learn/personal-project/tasks/task-2")
    })

    it("retains the page header and offers recovery after the primary query fails", () => {
        const retry = vi.fn()
        draw("failed", { notice: "Could not load the project", milestones: [] }, { retry })

        expect(screen.getByRole("heading", { name: "Personal Project" })).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retry).toHaveBeenCalledTimes(1)
    })
})
