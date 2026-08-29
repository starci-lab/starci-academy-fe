import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SurfaceListCard } from "."

const rows = <ul><li>Alpha</li><li>Beta</li></ul>

describe("SurfaceListCard", () => {
    it("renders labelled children and preserves nested context", () => {
        render(
            <SurfaceListCard props={{ label: "Results", isNested: true, isVerdict: true }}>{rows}</SurfaceListCard>,
        )
        const heading = screen.getByRole("heading", { name: "Results" })
        expect(heading.tagName).toBe("H4")
        expect(heading).toHaveClass("text-xs", "font-medium", "leading-4")
        expect(screen.getByText("Alpha")).toBeInTheDocument()
        expect(heading.closest("section")).toHaveAttribute("data-grammar-surface-depth", "nested")
    })

    it("renders an action footer or description, never both", () => {
        render(<SurfaceListCard props={{ label: "Results", actionLabel: "Open all", description: "Updated" }} on={{ act: () => undefined }}>{rows}</SurfaceListCard>)
        expect(screen.getByRole("button", { name: "Open all" })).toBeInTheDocument()
        expect(screen.queryByText("Updated")).not.toBeInTheDocument()
    })
})
