import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CoursePrerequisiteListBase } from "./component"
describe("CoursePrerequisiteListBase", () => {
    it("renders ordered requirements and omits an empty list", () => {
        render(<CoursePrerequisiteListBase state="required" props={{ prerequisites: [{ id: "one", requirement: "TypeScript" }] }} />)
        expect(screen.getByRole("list")).toBeInTheDocument(); expect(screen.getByText("TypeScript")).toBeInTheDocument()
    })
    it("renders nothing when no prerequisites are required", () => { const { container } = render(<CoursePrerequisiteListBase state="none" props={{ prerequisites: [] }} />); expect(container).toBeEmptyDOMElement() })
})
