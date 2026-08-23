import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Icon } from "./index"

describe("Icon", () => {
    it("draws the distinct StarCi AI conversation-and-code mark", () => {
        const { container } = render(<Icon props={{ name: "aiChatbot", role: "heading" }} />)
        const glyph = container.querySelector("svg")
        expect(glyph).toBeInTheDocument()
        expect(glyph).toHaveClass("size-6")
        expect(glyph?.querySelectorAll("path")).toHaveLength(3)
    })

    it("draws the persistent course rail as two bounded panes", () => {
        const { container } = render(<Icon props={{ name: "collapseRail", role: "leading" }} />)
        const glyph = container.querySelector("svg")
        expect(glyph).toHaveAttribute("viewBox", "0 0 24 24")
        expect(glyph).toHaveClass("size-5")
        expect(glyph?.querySelectorAll("path")).toHaveLength(2)
        expect(glyph?.querySelectorAll("path")[1]).toHaveAttribute("d", "M9 4.5v15")
    })

    it.each([
        ["learnHome", 3],
        ["courseContent", 2],
        ["personalProject", 3],
        ["flashcards", 3],
        ["mindMap", 2],
        ["mockInterview", 2],
        ["foundations", 2],
        ["playground", 2],
        ["courseLeaderboard", 2],
        ["courseQa", 3],
    ] as const)("owns a reviewed product cut for %s", (name, pathCount) => {
        const { container } = render(<Icon props={{ name, role: "leading" }} />)
        expect(container.querySelector("svg")).toHaveAttribute("viewBox", "0 0 24 24")
        expect(container.querySelectorAll("path")).toHaveLength(pathCount)
    })
})
