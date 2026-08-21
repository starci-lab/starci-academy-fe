import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
    CoursePersonalProjectPageBase,
    type CoursePersonalProjectPageProps,
    type CoursePersonalProjectTaskRow,
} from "./component"

const tasks: ReadonlyArray<CoursePersonalProjectTaskRow> = [
    { id: "task-1", title: "1. Plan", status: "Completed", actionLabel: "Continue" },
    { id: "task-2", title: "2. Build", status: "Next task", actionLabel: "Continue", isCurrent: true },
]

const baseProps: CoursePersonalProjectPageProps["props"] = {
    breadcrumbLabel: "Course path",
    courseTitle: "System Design",
    title: "Personal Project",
    nextTask: { id: "task-2", position: "Next task · Build", title: "Build the service" },
    continueLabel: "Continue",
    allCompleteLabel: "All tasks complete",
    completionLabel: "Completion progress",
    completionPercent: 50,
    completionFacts: ["1/2 tasks completed", "3 submissions", "Average score 18/20"],
    milestoneTitle: "Build",
    tasks,
    retryLabel: "Try again",
}

const draw = (
    state: CoursePersonalProjectPageProps["state"],
    props: Partial<CoursePersonalProjectPageProps["props"]> = {},
    on?: CoursePersonalProjectPageProps["on"],
) => render(<CoursePersonalProjectPageBase state={state} props={{ ...baseProps, ...props }} on={on} />)

describe("CoursePersonalProjectPageBase", () => {
    it("orders next action before completion evidence and current milestone tasks", () => {
        const { container } = draw("ready")
        const text = container.textContent ?? ""

        expect(text.indexOf("Build the service")).toBeLessThan(text.indexOf("1/2 tasks completed"))
        expect(text.indexOf("1/2 tasks completed")).toBeLessThan(text.indexOf("1. Plan"))
        expect(screen.getByText("1/2 tasks completed · 3 submissions · Average score 18/20")).toBeInTheDocument()
        expect(container.querySelectorAll("[data-component=SurfaceCardSurface]")).toHaveLength(3)
    })

    it("routes the continue action and task tiles by task identity", () => {
        const openTask = vi.fn()
        draw("ready", {}, { openTask })

        const actions = screen.getAllByRole("button", { name: "Continue" })
        fireEvent.click(actions[0])
        fireEvent.click(actions[1])
        expect(openTask).toHaveBeenNthCalledWith(1, "task-2")
        expect(openTask).toHaveBeenNthCalledWith(2, "task-1")
    })

    it("keeps four task destinations in the pending geometry", () => {
        const { container } = draw("pending", {
            nextTask: undefined,
            completionPercent: undefined,
            completionFacts: ["", "", ""],
            milestoneTitle: undefined,
            tasks: [],
        })

        expect(container.querySelectorAll("[data-node=course-personal-project-task-card]")).toHaveLength(4)
    })

    it("replaces the next action with completion copy when no task remains", () => {
        draw("ready", { nextTask: undefined })

        expect(screen.getByText("All tasks complete")).toBeInTheDocument()
        expect(screen.getAllByRole("button", { name: "Continue" })).toHaveLength(2)
    })

    it("retains the page header and offers recovery after a failed query", () => {
        const retry = vi.fn()
        draw("failed", { notice: "Could not load the project", tasks: [] }, { retry })

        expect(screen.getByRole("heading", { name: "Personal Project" })).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retry).toHaveBeenCalledTimes(1)
    })

    it("does not render repository status without a source-backed value", () => {
        const { container } = draw("ready")
        expect(container.querySelector("[data-node=course-personal-project-github-status]")).toBeNull()
    })
})
