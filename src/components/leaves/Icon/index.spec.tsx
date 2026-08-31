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

    it("keeps the original two-pane glyph for the persistent course rail", () => {
        const { container } = render(<Icon props={{ name: "collapseRail", role: "leading" }} />)
        const glyph = container.querySelector("svg")
        expect(glyph).toHaveAttribute("viewBox", "0 0 24 24")
        expect(glyph).toHaveClass("size-5")
        expect(glyph?.querySelectorAll("path")).toHaveLength(2)
        expect(glyph?.querySelectorAll("path")[1]).toHaveAttribute("d", "M9 4.5v15")
        const gridGlyph = render(<Icon props={{ name: "viewGrid", role: "leading" }} />).container.querySelector("svg")
        expect(glyph?.innerHTML).not.toBe(gridGlyph?.innerHTML)
    })

    it("draws an included value as a foreground circle-check, not achieved success", () => {
        const { container } = render(<Icon props={{ name: "included", role: "leading" }} />)
        const glyph = container.querySelector("svg")
        expect(glyph).toBeInTheDocument()
        expect(glyph).toHaveClass("size-5")
        expect(glyph).not.toHaveClass("text-success-soft-foreground")
    })

    it.each([
        "learnHome",
        "courseContent",
        "personalProject",
        "flashcards",
        "mindMap",
        "mockInterview",
        "foundations",
        "playground",
        "courseLeaderboard",
        "courseQa",
        "menu",
        "navigationOverflow",
    ] as const)("owns a reviewed Heroicons glyph for %s", (name) => {
        const { container } = render(<Icon props={{ name, role: "leading" }} />)
        const glyph = container.querySelector("svg")
        expect(glyph).toHaveAttribute("viewBox", "0 0 24 24")
        expect(glyph).toHaveAttribute("data-slot", "icon")
        expect(glyph).toHaveAttribute("stroke-width", "1.5")
        expect(glyph?.querySelectorAll("path").length).toBeGreaterThan(0)
    })

    it("uses the native open-book glyph for course content", () => {
        const course = render(<Icon props={{ name: "course", role: "leading" }} />).container.querySelector("svg")
        const content = render(<Icon props={{ name: "courseContent", role: "leading" }} />).container.querySelector("svg")
        expect(content?.innerHTML).toBe(course?.innerHTML)
    })

    it("uses the approved four-cell grid for the learn Home destination", () => {
        const home = render(<Icon props={{ name: "learnHome", role: "leading" }} />).container.querySelector("svg")
        const grid = render(<Icon props={{ name: "viewGrid", role: "leading" }} />).container.querySelector("svg")
        expect(home?.innerHTML).toBe(grid?.innerHTML)
    })
})
