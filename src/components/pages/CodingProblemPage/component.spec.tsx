import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CodingProblemPageBase } from "./component"

vi.mock("@/components/blocks/coding/ProblemReadingColumn", () => ({ ProblemReadingColumn: () => <div data-testid="reading-column" /> }))
vi.mock("@/components/blocks/coding/CodingProblemWork", () => ({ CodingProblemWork: () => <div data-testid="problem-work" /> }))

describe("CodingProblemPageBase", () => {
    it("keeps the canonical two-region anatomy and composes connected owners", () => {
        render(<CodingProblemPageBase slug="two-sum" />)
        expect(screen.getByTestId("reading-column")).toBeInTheDocument()
        expect(screen.getByTestId("problem-work")).toBeInTheDocument()
    })
})
