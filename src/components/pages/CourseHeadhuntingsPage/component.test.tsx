import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { _CourseHeadhuntingsPage } from "./component"

describe("CourseHeadhuntingsPage", () => {
    it("renders proven company and consultant directory rows", () => {
        render(<_CourseHeadhuntingsPage state="ready" props={{
            title: "Headhunting partners",
            trail: [{ id: "course", label: "TypeScript" }, { id: "headhuntings", label: "Headhunting partners" }],
            searchPlaceholder: "Find a company",
            searchLabel: "Find a company",
            clearSearchLabel: "Clear search",
            companiesLabel: "Companies",
            consultantsLabel: "Consultants",
            companies: [{ id: "company-1", label: "Acme Talent", meta: "Technology hiring" }],
            consultants: [{ id: "consultant-1", label: "Alex", meta: "Recruiter", actionLabel: "Contact", isActionAvailable: true }],
            emptyMessage: "No companies.",
            errorMessage: "Could not load companies.",
            retryLabel: "Try again",
        }} />)
        expect(screen.getByText(/Acme Talent/)).toBeInTheDocument()
        expect(screen.getByText(/Alex/)).toBeInTheDocument()
    })
})
