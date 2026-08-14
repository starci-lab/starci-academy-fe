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

        expect(screen.getByRole("navigation", { name: "Source files" })).toBeInTheDocument()
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

    it("moves keyboard focus through the visible source controls", () => {
        render(<SourceFileTree props={{ label: "Source files", files }} />)
        const first = screen.getByRole("button", { name: "Open /README.md" })
        first.focus()

        fireEvent.keyDown(screen.getByRole("navigation", { name: "Source files" }), { key: "ArrowDown" })
        expect(screen.getByRole("button", { name: "Collapse /src" })).toHaveFocus()

        fireEvent.keyDown(screen.getByRole("navigation", { name: "Source files" }), { key: "End" })
        expect(screen.getByRole("button", { name: "Open /src/hooks/useTodos.ts" })).toHaveFocus()
    })
})
