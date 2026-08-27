import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ProfileSkillsBase, type ProfileSkillsBlockProps } from "@/components/blocks/profile/ProfileSkills/component"

/**
 * What these tests guard.
 *
 * The coding tab is one settled reading: a metric ribbon, three breakdowns, then a searchable solve
 * history. The breakdown shapes are fixed - difficulty and language are segment runs, topic is a
 * chip run - and a resting tab keeps all three rather than collapsing to a spinner.
 */

const ready: ProfileSkillsBlockProps["props"] = {
    metrics: [
        { id: "solved", value: "42", label: "solved" },
        { id: "xp", value: "3280", label: "coding XP" },
        { id: "percentile", value: "Top 8%", label: "percentile" },
        { id: "rank", value: "#126", label: "rank" },
    ],
    byDifficulty: [{ key: "easy", solved: 18 }],
    byDomain: [{ key: "graphs", solved: 9 }],
    byLanguage: [{ key: "TypeScript", solved: 20 }],
    history: [{ slug: "shortest-path", problemTitle: "Shortest path", difficulty: "hard", domain: "graphs", languages: ["TypeScript"], firstSolvedAt: "2026-08-03" }],
    filterLabel: "Filters",
}

describe("ProfileSkillsBase", () => {
    it("keeps legacy metric, breakdown and solve-history order without generic evidence owner", () => {
        const select = vi.fn()
        const { container } = render(<ProfileSkillsBase state="ready" props={ready} on={{ select }} />)
        const text = container.textContent ?? ""
        expect(text.indexOf("Coding metrics")).toBeLessThan(text.indexOf("Stats"))
        expect(text.indexOf("Stats")).toBeLessThan(text.indexOf("Solve history"))
        expect(screen.getByText("By difficulty")).toBeInTheDocument()
        expect(screen.getByText("By topic")).toBeInTheDocument()
        expect(screen.getByText("By language")).toBeInTheDocument()
        expect(screen.getByText("Shortest path")).toBeInTheDocument()
        expect(screen.queryByText("Profile evidence")).not.toBeInTheDocument()
    })

    it("rests four metrics and all three breakdown runs rather than collapsing the tab", () => {
        render(<ProfileSkillsBase state="pending" props={ready} on={{}} />)

        expect(screen.getByText("Coding metrics")).toBeInTheDocument()
        expect(screen.getByText("By difficulty")).toBeInTheDocument()
        expect(screen.getByText("By topic")).toBeInTheDocument()
        expect(screen.getByText("By language")).toBeInTheDocument()
        expect(screen.queryByText(/results/)).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Shortest path" })).not.toBeInTheDocument()
    })

    it("keeps a failed tab readable and its controls inert when no outcomes are wired", () => {
        render(<ProfileSkillsBase state="error" props={{ ...ready, history: [] }} />)

        expect(screen.getByText("Solve history")).toBeInTheDocument()
        expect(screen.getByRole("searchbox", { name: "Search solve history" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Filters" })).toBeInTheDocument()
        expect(screen.queryByText(/results/)).not.toBeInTheDocument()
        expect(screen.getByText("Top 8%")).toBeInTheDocument()
    })

    it("counts settled results and opens the solved problem behind a pressed row", () => {
        const select = vi.fn()
        const search = vi.fn()
        const filter = vi.fn()
        render(<ProfileSkillsBase state="ready" props={ready} on={{ select, search, filter }} />)

        expect(screen.getByText("1 results")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Shortest path" }))
        expect(select).toHaveBeenCalledWith("shortest-path")
        fireEvent.click(screen.getByRole("button", { name: "Filters" }))
        expect(filter).toHaveBeenCalledOnce()
        expect(screen.getByText("2026-08-03 · graphs · TypeScript")).toBeInTheDocument()
    })

    it("tones a medium problem apart from an unclassified one and leaves the latter factless", () => {
        render(
            <ProfileSkillsBase
                state="ready"
                props={{
                    ...ready,
                    history: [
                        { slug: "lru-cache", problemTitle: "LRU cache", difficulty: "medium", languages: [], firstSolvedAt: "2026-08-01" },
                        { slug: "two-sum", problemTitle: "Two sum", difficulty: null, languages: ["Go"], firstSolvedAt: "2026-07-30" },
                    ],
                }}
                on={{ select: vi.fn() }}
            />,
        )

        expect(screen.getByText("medium")).toBeInTheDocument()
        expect(screen.getByText("2026-07-30 · Go")).toBeInTheDocument()
    })
})
