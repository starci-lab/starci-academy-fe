import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CodingDomainPageBase } from "./component"

vi.mock("@/components/blocks/coding/CodingDomainStanding", () => ({ CodingDomainStanding: () => <div data-testid="domain-standing" /> }))
vi.mock("@/components/blocks/coding/CodingProblemList", () => ({ CodingProblemList: () => <div data-testid="problem-list" /> }))

describe("CodingDomainPageBase", () => {
    it("keeps topic anatomy while composing connected standing and problem owners", () => {
        render(<CodingDomainPageBase domain="arrays" navHome="Home" navPractice="Practice" title="Arrays" />)
        expect(screen.getByRole("heading", { name: "Arrays" })).toBeInTheDocument()
        expect(screen.getByTestId("domain-standing")).toBeInTheDocument()
        expect(screen.getByTestId("problem-list")).toBeInTheDocument()
    })
})
