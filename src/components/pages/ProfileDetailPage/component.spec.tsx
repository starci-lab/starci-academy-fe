import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ProfileCodingProblemBase } from "@/components/blocks/profile/ProfileCodingProblem/component"

describe("ProfileCodingProblemBase", () => {
    it("renders executable legacy statement and accepted evidence without invented source code", () => {
        const { container } = render(<ProfileCodingProblemBase state="ready" detail={{ problem: { title: "Shortest path", statement: "Find the shortest constrained route.", difficulty: "hard", domain: "graphs", tags: ["Dijkstra"] }, submission: { languages: ["TypeScript"], verdict: "accepted", passedCount: 18, totalCount: 18 } }} on={{ back: vi.fn(), retry: vi.fn() }} />)
        expect(screen.getByText("Find the shortest constrained route.")).toBeInTheDocument()
        expect(screen.getByText("18/18")).toBeInTheDocument()
        expect(screen.queryByRole("code")).toBeNull()
        expect(container.querySelector("pre code")).toBeNull()
    })

    it("keeps proof recovery actionable when the detail request fails", () => {
        const retry = vi.fn()
        render(<ProfileCodingProblemBase state="error" on={{ back: vi.fn(), retry }} />)

        screen.getByRole("button", { name: "Try again" }).click()
        expect(retry).toHaveBeenCalledOnce()
        expect(screen.getByText("This proof couldn't be loaded.")).toBeInTheDocument()
    })

    it("uses the attempted slug for one honest empty proof state without a faux statement strip", () => {
        render(<ProfileCodingProblemBase state="ready" slug="two-sum" detail={null} on={{ back: vi.fn(), retry: vi.fn() }} />)

        expect(screen.getByRole("heading", { name: "Coding problem · two-sum" })).toBeInTheDocument()
        expect(screen.getByText("No public accepted proof was found for two-sum.")).toBeInTheDocument()
        expect(screen.getByText("Accepted solutions appear here when the learner publishes this problem's evidence.")).toBeInTheDocument()
        expect(screen.queryByText("No public coding proof was found.")).not.toBeInTheDocument()
        expect(screen.queryByText("Problem statement")).not.toBeInTheDocument()
    })
})
