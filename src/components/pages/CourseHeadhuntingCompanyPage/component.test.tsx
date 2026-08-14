import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { _CourseHeadhuntingCompanyPage } from "./component"

describe("CourseHeadhuntingCompanyPage", () => {
    it("offers contact without inventing a company application", () => {
        render(<_CourseHeadhuntingCompanyPage state="ready" props={{
            title: "Acme Talent",
            trail: [{ id: "course", label: "TypeScript" }, { id: "directory", label: "Partners" }, { id: "company", label: "Acme Talent" }],
            description: "Technology hiring",
            contactLabel: "Contact company",
            consultantsLabel: "Consultants",
            consultants: [{ id: "consultant-1", label: "Alex", actionLabel: "Contact", isActionAvailable: true }],
            backLabel: "Back to partners",
            notFoundMessage: "Not found.",
            emptyMessage: "No consultants.",
            errorMessage: "Could not load company.",
            retryLabel: "Try again",
        }} />)
        expect(screen.getByRole("button", { name: /Contact company/ })).toBeInTheDocument()
        expect(screen.queryByText(/apply/i)).not.toBeInTheDocument()
    })
})
