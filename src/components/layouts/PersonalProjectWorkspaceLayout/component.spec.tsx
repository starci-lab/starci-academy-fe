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

describe("PersonalProjectWorkspaceLayoutBase", () => {
    it("keeps milestone navigation beside the routed personal-project surface", () => {
        render(
            <PersonalProjectWorkspaceLayoutBase
                milestones={[
                    { id: "task-1", label: "Milestone 1 · Plan" },
                    { id: "task-2", label: "Milestone 1 · Build", isCurrent: true },
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
                milestones={[
                    { id: "task-1", label: "Milestone 1 · Plan" },
                    { id: "task-2", label: "Milestone 1 · Build", isCurrent: true },
                ]}
                surface={<Surface />}
                onTask={onTask}
            />,
        )

        fireEvent.click(screen.getByText("Milestone 1 · Plan"))
        expect(onTask).toHaveBeenCalledWith("task-1")
    })

    it("rests four milestones rather than showing an empty roadmap while it loads", () => {
        const { container } = render(
            <PersonalProjectWorkspaceLayoutBase milestones={[]} surface={<Surface />} isLoading />,
        )

        expect(container.querySelectorAll("[data-component=NavLink]")).toHaveLength(4)
        for (const link of container.querySelectorAll("[data-component=NavLink]")) expect(link.textContent).toBe("")
        expect(screen.getByText("Task workspace")).toBeInTheDocument()
    })

    it("keeps the milestones it already has while a later read is in flight", () => {
        const { container } = render(
            <PersonalProjectWorkspaceLayoutBase
                milestones={[{ id: "task-1", label: "Milestone 1 · Plan" }]}
                surface={<Surface />}
                isLoading
            />,
        )

        expect(container.querySelectorAll("[data-component=NavLink]")).toHaveLength(1)
        expect(screen.getByText("Milestone 1 · Plan")).toBeInTheDocument()
    })

    it("draws an empty rail only once the project settled with no roadmap at all", () => {
        const { container } = render(
            <PersonalProjectWorkspaceLayoutBase milestones={[]} surface={<Surface />} />,
        )

        expect(container.querySelectorAll("[data-component=NavLink]")).toHaveLength(0)
        expect(screen.getByText("Task workspace")).toBeInTheDocument()
    })
})
