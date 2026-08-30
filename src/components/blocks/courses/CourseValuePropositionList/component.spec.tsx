import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CourseValuePropositionList } from "./component"

describe("CourseValuePropositionList", () => {
    it("keeps every grammar row as one direct list item", () => {
        const { container } = render(<CourseValuePropositionList props={{ label: "Promises", promises: ["First", "Second"] }} />)

        expect(screen.getByRole("list").children).toHaveLength(2)
        expect(container.querySelector("li li")).toBeNull()
        expect(screen.getAllByRole("listitem")).toHaveLength(2)
        expect(container.querySelector("[data-grammar-state=\"affirmative\"]")).toBeNull()
        expect(container.querySelector("[data-course-value-marker]")).toBeNull()
        expect(container.querySelectorAll("svg")).toHaveLength(2)
        for (const glyph of container.querySelectorAll("svg")) {
            expect(glyph).toHaveClass("size-5")
            expect(glyph).not.toHaveClass("text-success-soft-foreground")
        }
    })
})
