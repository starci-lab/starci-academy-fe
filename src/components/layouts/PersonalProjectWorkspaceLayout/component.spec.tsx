import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PersonalProjectWorkspaceLayoutBase } from "./component"

/**
 * What these tests guard.
 *
 * The rail stays mounted while dashboard, task and result surfaces swap under it, so the frame owns
 * exactly two things: the milestone destinations and where the routed surface goes. A roadmap that
 * has not arrived rests as milestones rather than as an empty rail, because an empty rail claims the
 * project has none.
 */

const Surface = () => <div>Task workspace</div>
const frame = {
    progress: { label: "Progress", value: 25, fact: "1/4 tasks" },
    search: { placeholder: "Search tasks...", label: "Search milestones", clearLabel: "Clear search" },
    toggleLabel: "Collapse project outline",
} as const

describe("PersonalProjectWorkspaceLayoutBase", () => {
    it("keeps milestone navigation beside the routed personal-project surface", () => {
        render(
            <PersonalProjectWorkspaceLayoutBase
                {...frame}
                milestones={[
                    { id: "task-1", label: "Milestone 1 · Plan", fact: "1/2" },
                    { id: "task-2", label: "Milestone 1 · Build", fact: "0/2", isCurrent: true },
                ]}
                surface={<Surface />}
                onTask={vi.fn()}
            />,
        )

        expect(screen.getByText("Milestone 1 · Plan")).toBeInTheDocument()
        expect(screen.getByText("Task workspace")).toBeInTheDocument()
    })

    it("routes a pressed milestone to the task the rail names", () => {
        const onTask = vi.fn()
        render(
            <PersonalProjectWorkspaceLayoutBase
                {...frame}
                milestones={[
                    { id: "task-1", label: "Milestone 1 · Plan", fact: "1/2" },
                    { id: "task-2", label: "Milestone 1 · Build", fact: "0/2", isCurrent: true },
                ]}
                surface={<Surface />}
                onTask={onTask}
            />,
        )

        fireEvent.click(screen.getByText("Milestone 1 · Plan"))
        expect(onTask).toHaveBeenCalledWith("task-1")
    })

    it("submits the milestone query to the connected rail owner", () => {
        const onSearch = vi.fn()
        render(
            <PersonalProjectWorkspaceLayoutBase
                {...frame}
                milestones={[]}
                surface={<Surface />}
                onSearch={onSearch}
            />,
        )

        fireEvent.change(screen.getByRole("searchbox", { name: "Search milestones" }), { target: { value: "database" } })
        fireEvent.submit(screen.getByRole("search"))
        expect(onSearch).toHaveBeenCalledWith("database")
    })

    it("rests four milestones rather than showing an empty roadmap while it loads", () => {
        const { container } = render(
            <PersonalProjectWorkspaceLayoutBase {...frame} milestones={[]} surface={<Surface />} isLoading />,
        )

        expect(container.querySelectorAll("[data-component=NavLink]")).toHaveLength(4)
        expect(screen.getByText("Task workspace")).toBeInTheDocument()
    })

    it("keeps the milestones it already has while a later read is in flight", () => {
        const { container } = render(
            <PersonalProjectWorkspaceLayoutBase
                {...frame}
                milestones={[{ id: "task-1", label: "Milestone 1 · Plan", fact: "0/1" }]}
                surface={<Surface />}
                isLoading
            />,
        )

        expect(container.querySelectorAll("[data-component=NavLink]")).toHaveLength(1)
        expect(screen.getByText("Milestone 1 · Plan")).toBeInTheDocument()
    })

    it("draws an empty rail only once the project settled with no roadmap at all", () => {
        const { container } = render(
            <PersonalProjectWorkspaceLayoutBase {...frame} milestones={[]} surface={<Surface />} />,
        )

        expect(container.querySelectorAll("[data-component=NavLink]")).toHaveLength(0)
        expect(screen.getByText("Task workspace")).toBeInTheDocument()
    })

    it("compacts the rail without removing the routed surface", () => {
        const onToggle = vi.fn()
        render(
            <PersonalProjectWorkspaceLayoutBase
                {...frame}
                milestones={[]}
                surface={<Surface />}
                collapsed
                toggleLabel="Expand project outline"
                onToggle={onToggle}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Expand project outline" }))
        expect(onToggle).toHaveBeenCalledTimes(1)
        expect(screen.getByText("Task workspace")).toBeInTheDocument()
    })
})
