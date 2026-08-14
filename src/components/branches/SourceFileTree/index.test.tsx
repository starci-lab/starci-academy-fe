/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { SourceFileTree } from "./index"

const files = [
    { path: "/src/App.tsx" },
    { path: "/src/hooks/useTodos.ts", isEdited: true },
    { path: "/README.md" },
]

describe("SourceFileTree", () => {
    it("renders a semantic list with active and locally edited source facts", () => {
        const { container } = render(
            <SourceFileTree
                props={{ label: "Source files", files, activePath: "/src/App.tsx", editedLabel: "Changed locally" }}
            />,
        )

        expect(screen.getByRole("navigation")).toBeInTheDocument()
        expect(screen.getByText("Source files")).toBeInTheDocument()
        expect(screen.getByRole("list")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Open /src/App.tsx" })).toHaveAttribute("data-active", "true")
        expect(screen.getAllByLabelText("Changed locally").length).toBeGreaterThan(0)
        expect(container.querySelectorAll("[data-node=source-file-row]").length).toBe(5)
    })

    it("activates a file and collapses descendants without losing sibling files", () => {
        const activate = vi.fn()
        render(<SourceFileTree props={{ label: "Source files", files }} on={{ activate }} />)

        fireEvent.click(screen.getByRole("button", { name: "Open /src/hooks/useTodos.ts" }))
        expect(activate).toHaveBeenCalledWith("/src/hooks/useTodos.ts")

        fireEvent.click(screen.getByRole("button", { name: "Collapse /src" }))
        expect(screen.queryByRole("button", { name: "Open /src/App.tsx" })).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Open /README.md" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Expand /src" })).toBeInTheDocument()
    })

    it("keeps each visible source control keyboard-focusable", () => {
        render(<SourceFileTree props={{ label: "Source files", files }} />)
        for (const control of screen.getAllByRole("button")) expect(control).not.toHaveAttribute("tabindex", "-1")
    })
})
