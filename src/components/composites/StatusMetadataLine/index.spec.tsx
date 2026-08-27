import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StatusMetadataLine } from "./index"

describe("StatusMetadataLine", () => {
    it("promotes one status and keeps every other fact in one dotted text run", () => {
        render(<StatusMetadataLine props={{
            status: { content: "Unread", tone: "neutral", icon: "incomplete" },
            facts: ["22 min", "2 challenges"],
        }} />)

        expect(screen.getByText("Unread")).toBeInTheDocument()
        expect(screen.getByText("22 min · 2 challenges")).toBeInTheDocument()
        expect(screen.getByText("22 min · 2 challenges")).toHaveAttribute("data-size", "sm")
    })

    it("renders no chip when metadata carries no status meaning", () => {
        render(<StatusMetadataLine props={{ facts: ["25 modules", "59 study hours", "0 learners"] }} />)

        expect(screen.queryByText("Unread")).toBeNull()
        expect(screen.getByText("25 modules · 59 study hours · 0 learners")).toBeInTheDocument()
    })

    it("omits the whole optional content when neither status nor facts exist", () => {
        const { container } = render(<StatusMetadataLine props={{ facts: [] }} />)
        expect(container.firstElementChild).toBeEmptyDOMElement()
    })
})
