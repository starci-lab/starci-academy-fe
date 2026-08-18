import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
    _CoursePersonalProjectPage,
    type CoursePersonalProjectPageProps,
    type CoursePersonalProjectTaskRow,
} from "./component"

/**
 * What these tests guard: the reader's own figures and the ordered way through the project.
 * A retry control that appears on any state but `failed` invites a refetch of an answer that
 * already arrived, and a resting dashboard that draws no rows looks like a project with no tasks.
 */

const copy = {
    title: "Personal Project",
    description: "Build the project step by step.",
    progressLabel: "Completion progress",
    retryLabel: "Try again",
}

const tasks: ReadonlyArray<CoursePersonalProjectTaskRow> = [
    { id: "task-1", label: "Milestone 1 · Plan · Completed" },
    { id: "task-2", label: "Milestone 1 · Build · Next task", isCurrent: true },
]

const draw = (
    state: CoursePersonalProjectPageProps["state"],
    props: Partial<CoursePersonalProjectPageProps["props"]> = {},
    on?: CoursePersonalProjectPageProps["on"],
) => render(
    <_CoursePersonalProjectPage
        state={state}
        props={{ ...copy, tasks, progressText: "1/2 tasks completed", completionPercent: 50, ...props }}
        on={on}
    />,
)

describe("_CoursePersonalProjectPage", () => {
    it("keeps progress facts before ordered task destinations", () => {
        const { container } = draw("ready", {}, { openTask: vi.fn() })

        const text = container.textContent ?? ""
        expect(text.indexOf("1/2 tasks completed")).toBeLessThan(text.indexOf("Milestone 1 · Plan"))
        expect(screen.getByText("Milestone 1 · Build · Next task")).toBeInTheDocument()
    })

    it("reports the pressed task by its own id", () => {
        const openTask = vi.fn()
        draw("ready", {}, { openTask })
        fireEvent.click(screen.getByText("Milestone 1 · Plan · Completed"))
        expect(openTask).toHaveBeenCalledWith("task-1")
    })

    // NOTE: the page stands in four placeholder rows here, but `NavLink` ignores `isLoading`
    // entirely, so they currently render as live blank links rather than skeletons. That is a
    // defect in the leaf, reported separately - these tests assert only what is observably true.
    it("stands in four placeholder task rows before the project has answered", () => {
        const { container } = draw("pending", { tasks: [], progressText: undefined, completionPercent: undefined })
        expect(container.querySelectorAll("[data-component=NavLink]")).toHaveLength(4)
        expect(screen.queryByText("Build the project step by step.")).not.toBeInTheDocument()
    })

    it("keeps the tasks it already has rather than replacing them while refreshing", () => {
        const { container } = draw("pending")
        expect(container.querySelectorAll("[data-component=NavLink]")).toHaveLength(2)
    })

    it("carries no notice line when there is nothing to say about the project", () => {
        draw("ready")
        expect(screen.queryByText("Nothing published yet")).not.toBeInTheDocument()
    })

    it("shows the notice the owner resolved for this project", () => {
        draw("empty", { notice: "Nothing published yet", tasks: [] })
        expect(screen.getByText("Nothing published yet")).toBeInTheDocument()
    })

    it("offers a retry only on the state a retry can fix", () => {
        draw("ready")
        expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument()
    })

    it("offers a retry once the project could not be read, and reports the press", () => {
        const retry = vi.fn()
        draw("failed", { notice: "Could not load the project", tasks: [] }, { retry })
        expect(screen.getByText("Could not load the project")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retry).toHaveBeenCalledTimes(1)
    })

    it("stays inert rather than throwing when the owner registered no handlers", () => {
        draw("failed")
        expect(() => {
            fireEvent.click(screen.getByText("Milestone 1 · Plan · Completed"))
            fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        }).not.toThrow()
    })
})
