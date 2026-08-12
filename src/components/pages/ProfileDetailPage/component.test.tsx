import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _ProfileCodingProblemPage } from "./component"

describe("_ProfileCodingProblemPage", () => {
    it("renders executable legacy statement and accepted evidence without invented source code", () => {
        const { container } = render(<_ProfileCodingProblemPage state="ready" detail={{ problem: { title: "Shortest path", statement: "Find the shortest constrained route.", difficulty: "hard", domain: "graphs", tags: ["Dijkstra"] }, submission: { languages: ["TypeScript"], verdict: "accepted", passedCount: 18, totalCount: 18 } }} on={{ back: vi.fn(), retry: vi.fn() }} />)
        expect(screen.getByText("Find the shortest constrained route.")).toBeInTheDocument()
        expect(screen.getByText("18/18")).toBeInTheDocument()
        expect(container.querySelector("[data-component='CodeBlock']")).toBeNull()
        expect(container.querySelector("pre code")).toBeNull()
    })
})
