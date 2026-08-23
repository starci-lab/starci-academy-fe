import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CodingPracticeHubPageBase } from "./component"

vi.mock("@/components/blocks/coding/DomainMasteryGrid", () => ({ DomainMasteryGrid: () => <div data-testid="domain-grid" /> }))

describe("CodingPracticeHubPageBase", () => {
    it("keeps shell copy and composes the connected domain region", () => {
        render(<CodingPracticeHubPageBase navHome="Home" navPractice="Practice" title="Coding practice" />)
        expect(screen.getByRole("heading", { name: "Coding practice" })).toBeInTheDocument()
        expect(screen.getByTestId("domain-grid")).toBeInTheDocument()
    })
})
