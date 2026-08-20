import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
    CoursePersonalProjectPageBase,
    type CoursePersonalProjectPageProps,
    type CoursePersonalProjectTaskRow,
} from "./component"

const tasks: ReadonlyArray<CoursePersonalProjectTaskRow> = [
    { id: "task-1", label: "1. Plan · Completed" },
    { id: "task-2", label: "2. Build · Next task", isCurrent: true },
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
        expect(text.indexOf("1/2 tasks completed")).toBeLessThan(text.indexOf("1. Plan · Completed"))
        expect(screen.getByText("3 submissions")).toBeInTheDocument()
        expect(screen.getByText("Average score 18/20")).toBeInTheDocument()
    })

    it("routes the continue action and task tiles by task identity", () => {
        const openTask = vi.fn()
        draw("ready", {}, { openTask })

        fireEvent.click(screen.getByRole("button", { name: "Continue" }))
        fireEvent.click(screen.getByText("1. Plan · Completed"))
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

        expect(container.querySelectorAll("[data-component=NavLink]")).toHaveLength(4)
    })

    it("replaces the next action with completion copy when no task remains", () => {
        draw("ready", { nextTask: undefined })

        expect(screen.getByText("All tasks complete")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Continue" })).not.toBeInTheDocument()
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
