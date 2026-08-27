import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SupportingDotList } from "."

describe("SupportingDotList", () => {
    it("renders static supporting entries with same-tone dots and no actionable glyph", () => {
        const { container } = render(
            <SupportingDotList props={{
                entries: [
                    { id: "selector", content: "Subscribe with a selector." },
                    { id: "persist", content: "Persist state across reloads." },
                ],
            }} />,
        )

        const list = container.querySelector("ul")
        const rows = list?.querySelectorAll("li") ?? []
        expect(list?.tagName).toBe("UL")
        expect(rows).toHaveLength(2)
        expect(container.querySelector("svg")).toBeNull()
        expect(screen.getAllByText("•")).toHaveLength(2)
        for (const row of rows) {
            const parts = row.querySelectorAll("[data-tone]")
            expect(parts).toHaveLength(2)
            expect(parts[0]).toHaveAttribute("data-tone", "muted")
            expect(parts[1]).toHaveAttribute("data-tone", "muted")
        }
    })
})
