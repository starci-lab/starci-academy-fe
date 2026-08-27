import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PersonalProjectWorkspaceLayoutBase } from "./component"

vi.mock("@/components/blocks/learn/PersonalProjectContentMap", () => ({
    PersonalProjectContentMap: () => <div data-testid="project-map">Project roadmap</div>,
}))

Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: { getItem: vi.fn(() => null), setItem: vi.fn() },
})

describe("PersonalProjectWorkspaceLayoutBase", () => {
    it("composes the connected roadmap block beside the routed surface", () => {
        render(
            <PersonalProjectWorkspaceLayoutBase
                surface={<div>Task workspace</div>}
                resizeLabel="Resize the project roadmap"
            />,
        )

        expect(screen.getByTestId("project-map")).toBeInTheDocument()
        expect(screen.getByText("Task workspace")).toBeInTheDocument()
        expect(screen.queryByRole("list")).toBeNull()
    })

    it("keeps the roadmap in a resizable persistent rail", () => {
        render(
            <PersonalProjectWorkspaceLayoutBase
                surface={<div>Task workspace</div>}
                resizeLabel="Resize the project roadmap"
            />,
        )

        expect(screen.getByTestId("project-map")).toBeInTheDocument()
        expect(screen.getByRole("separator", { name: "Resize the project roadmap" })).toBeInTheDocument()
    })
})
