import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SkillSnapshot } from "./SkillSnapshot"

const rows = (root: HTMLElement) =>
    Array.from(root.querySelectorAll("[data-node=\"label-fact-over-progress\"]"), (row) => row.textContent)

describe("SkillSnapshot", () => {
    it("leads with the headline fact and follows it with one progress peer per breakdown", () => {
        const { container } = render(<SkillSnapshot
            label="Challenge skills"
            totalLabel="Passed"
            totalValue="12"
            rows={[
                { id: "difficulty-easy", title: "Easy", percent: 75, percentText: "9" },
                { id: "difficulty-hard", title: "Hard", percent: 25, percentText: "3" },
            ]}
        />)

        expect(screen.getByRole("heading", { name: "Challenge skills" })).toBeInTheDocument()
        expect(container.querySelector("[data-node=\"glyph-title-fact-row\"]")?.textContent).toBe("Passed12")
        expect(rows(container)).toEqual(["Easy9", "Hard3"])
        expect(screen.getByRole("progressbar", { name: "Easy" })).toHaveAttribute("aria-valuenow", "75")
    })

    it("replaces the whole control stack with the settled state message", () => {
        const { container } = render(<SkillSnapshot
            label="Challenge skills"
            totalLabel="Passed"
            totalValue="0"
            rows={[{ id: "difficulty-easy", title: "Easy", percent: 10, percentText: "1" }]}
            stateMessage="No solved challenges yet"
        />)

        expect(screen.getByText("No solved challenges yet")).toBeInTheDocument()
        expect(container.textContent).not.toContain("Passed")
        expect(rows(container)).toEqual([])
    })

    it("keeps the resting headline and rows while a state message is already known", () => {
        const { container } = render(<SkillSnapshot
            label="Challenge skills"
            totalLabel="Passed"
            rows={[{ id: "resting", title: "" }]}
            stateMessage="No solved challenges yet"
            isLoading
        />)

        expect(screen.queryByText("No solved challenges yet")).toBeNull()
        expect(container.querySelector("[data-node=\"glyph-title-fact-row\"]")?.textContent).toContain("Passed")
        expect(rows(container)).toHaveLength(1)
        expect(container.querySelector("[data-node=\"label-fact-over-progress\"] [data-component=\"Text\"]"))
            .toHaveAttribute("data-loading", "true")
    })
})
