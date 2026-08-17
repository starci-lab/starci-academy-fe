import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _PersonalProjectWorkspaceLayout } from "./component"

describe("_PersonalProjectWorkspaceLayout", () => {
    it("keeps milestone navigation beside the routed personal-project surface", () => {
        const Surface = () => <div>Task workspace</div>
        render(
            <_PersonalProjectWorkspaceLayout
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
})
