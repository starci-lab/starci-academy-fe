import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ContinuationHighlightCard } from "."

describe("ContinuationHighlightCard", () => {
    it("renders the continuation content in one surface", () => {
        const copy = { heading: ["Continue"].join(""), fact: ["In", "progress"].join(" "), action: ["Resume"].join("") }
        render(<ContinuationHighlightCard><h3>{copy.heading}</h3><p>{copy.fact}</p><button type="button">{copy.action}</button></ContinuationHighlightCard>)
        expect(screen.getByRole("heading", { name: "Continue", level: 3 })).toBeInTheDocument()
        expect(screen.getByText("In progress")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Resume" })).toBeInTheDocument()
    })
})
