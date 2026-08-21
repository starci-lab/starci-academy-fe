import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StatusMetadataLine } from "./index"

describe("StatusMetadataLine", () => {
    it("promotes one status and keeps every other fact in one dotted text run", () => {
        const { container } = render(<StatusMetadataLine props={{
            status: { content: "Unread", tone: "neutral", icon: "incomplete" },
            facts: ["22 min", "2 challenges"],
        }} />)

        expect(container.querySelectorAll("[data-component=Badge]")).toHaveLength(1)
        expect(screen.getByText("22 min · 2 challenges")).toBeInTheDocument()
        expect(container.querySelectorAll("[data-component=Text]")).toHaveLength(1)
    })

    it("renders no chip when metadata carries no status meaning", () => {
        const { container } = render(<StatusMetadataLine props={{ facts: ["25 modules", "59 study hours", "0 learners"] }} />)

        expect(container.querySelector("[data-component=Badge]")).toBeNull()
        expect(screen.getByText("25 modules · 59 study hours · 0 learners")).toBeInTheDocument()
    })

    it("omits the whole optional content when neither status nor facts exist", () => {
        const { container } = render(<StatusMetadataLine props={{ facts: [] }} />)
        expect(container.querySelector("[data-component=Badge]")).toBeNull()
        expect(container.querySelector("[data-component=Text]")).toBeNull()
    })
})
