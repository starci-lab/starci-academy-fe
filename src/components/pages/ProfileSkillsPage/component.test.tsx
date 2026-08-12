import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _ProfileSkillsPage } from "./component"

describe("_ProfileSkillsPage", () => {
    it("keeps legacy metric, breakdown and solve-history order without generic evidence owner", () => {
        const select = vi.fn()
        const { container } = render(<_ProfileSkillsPage state="ready" props={{
            metrics: [{ id: "solved", value: "42", label: "solved" }, { id: "xp", value: "3280", label: "coding XP" }, { id: "percentile", value: "Top 8%", label: "percentile" }, { id: "rank", value: "#126", label: "rank" }],
            byDifficulty: [{ key: "easy", solved: 18 }], byDomain: [{ key: "graphs", solved: 9 }], byLanguage: [{ key: "TypeScript", solved: 20 }],
            history: [{ slug: "shortest-path", problemTitle: "Shortest path", difficulty: "hard", domain: "graphs", languages: ["TypeScript"], firstSolvedAt: "2026-08-03" }], filterLabel: "Filters",
        }} on={{ select }} />)
        const text = container.textContent ?? ""
        expect(text.indexOf("Coding metrics")).toBeLessThan(text.indexOf("Stats"))
        expect(text.indexOf("Stats")).toBeLessThan(text.indexOf("Solve history"))
        expect(container.querySelectorAll("[data-node='profile-breakdown']")).toHaveLength(3)
        expect(screen.getByText("Shortest path")).toBeInTheDocument()
        expect(container.querySelector("[data-component='ProfileEvidenceSection']")).toBeNull()
    })
})
