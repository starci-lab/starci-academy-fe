import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SurfaceListCard } from "."

const rows = <ul><li>Alpha</li><li>Beta</li></ul>

describe("SurfaceListCard", () => {
    it("renders labelled children and preserves nested context", () => {
        render(
            <SurfaceListCard props={{ label: "Results", isNested: true, isVerdict: true }}>{rows}</SurfaceListCard>,
        )
        const label = screen.getByText("Results")
        expect(label).toHaveAttribute("data-grammar-label", "true")
        expect(label).toHaveAttribute("data-grammar-label-depth", "nested")
        expect(label).toHaveClass("text-xs", "font-medium", "leading-4")
        expect(screen.getByText("Alpha")).toBeInTheDocument()
        expect(label.closest("section")).toHaveAttribute("data-grammar-surface-depth", "nested")
    })

    it("renders an action footer or description, never both", () => {
        render(<SurfaceListCard props={{ label: "Results", actionLabel: "Open all", description: "Updated" }} on={{ act: () => undefined }}>{rows}</SurfaceListCard>)
        expect(screen.getByRole("button", { name: "Open all" })).toBeInTheDocument()
        expect(screen.queryByText("Updated")).not.toBeInTheDocument()
    })

    it("keeps label controls outside a bounded list frame", () => {
        render(<SurfaceListCard props={{ label: "Roadmap", fact: "9 stages", isScrollable: true }} labelEnd={<button type="button">Search</button>}>{rows}</SurfaceListCard>)

        const label = screen.getByText("Roadmap")
        const search = screen.getByRole("button", { name: "Search" })
        const frame = label.closest("section")?.querySelector("[data-grammar-surface='true']")
        expect(search.closest("[data-grammar-surface-label='true']")).not.toBeNull()
        expect(search.closest("[data-grammar-surface='true']")).toBeNull()
        expect(frame).toHaveAttribute("data-grammar-scroll", "contained")
        expect(screen.queryByText("9 stages")).not.toBeInTheDocument()
    })
})
