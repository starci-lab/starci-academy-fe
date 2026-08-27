import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CoursePrerequisiteListBase } from "./component"

const prerequisites = [
    { id: "js", requirement: "Comfortable with JavaScript syntax" },
    { id: "git", requirement: "Can clone and push a Git branch" },
    { id: "http", requirement: "Knows what an HTTP request is" },
]

describe("CoursePrerequisiteListBase", () => {
    it("numbers every requirement in the order the course stores them", () => {
        render(<CoursePrerequisiteListBase state="required" props={{ prerequisites }} />)

        const list = screen.getByRole("list")
        expect(list.tagName).toBe("OL")
        const rows = document.querySelectorAll("[data-node=\"course-prerequisite-row\"]")
        expect(Array.from(rows, (row) => row.textContent)).toEqual([
            "1.Comfortable with JavaScript syntax",
            "2.Can clone and push a Git branch",
            "3.Knows what an HTTP request is",
        ])
        expect(screen.getByText("2.")).toHaveAttribute("data-grammar-leading-number", "true")
        expect(screen.getByText("Can clone and push a Git branch")).toHaveAttribute("data-size", "sm")
    })

    it("draws nothing at all for a course that asks for nothing", () => {
        const { container } = render(
            <CoursePrerequisiteListBase state="none" props={{ prerequisites: [] }} />,
        )

        expect(container).toBeEmptyDOMElement()
        expect(screen.queryByRole("list")).toBeNull()
    })

    it("still draws nothing when a course carries requirements it no longer asks for", () => {
        const { container } = render(
            <CoursePrerequisiteListBase state="none" props={{ prerequisites }} />,
        )

        expect(container).toBeEmptyDOMElement()
        expect(screen.queryByText("Comfortable with JavaScript syntax")).toBeNull()
    })
})
