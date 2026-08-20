import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseHeadhuntingCompanyPageBase } from "./component"

/**
 * What these tests guard.
 *
 * A company profile offers contact, never an application: the page has no apply route to honour.
 * Contact exists at two scales - the company itself, when the partner published one, and each
 * consultant who is actually reachable - and a profile that could not be found says so with the way
 * back rather than with a retry that would fetch the same nothing.
 */

const props = {
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
}

describe("CourseHeadhuntingCompanyPage", () => {
    it("offers contact without inventing a company application", () => {
        render(<CourseHeadhuntingCompanyPageBase state="ready" props={props} />)
        expect(screen.getByRole("button", { name: /Contact company/ })).toBeInTheDocument()
        expect(screen.queryByText(/apply/i)).not.toBeInTheDocument()
    })

    it("rests three consultant rows and the company name while the profile arrives", () => {
        const { container } = render(<CourseHeadhuntingCompanyPageBase state="pending" props={props} />)

        expect(container.querySelectorAll("[data-node=\"next-action-list\"] > [data-component=\"Text\"][data-loading=\"true\"]")).toHaveLength(3)
        expect(container.querySelector("[data-component=\"Heading\"][data-loading=\"true\"]")).not.toBeNull()
        expect(container.querySelector("[data-component=\"TextLink\"]")).toBeNull()
    })

    it("sends a reader back rather than retrying a company that does not exist", () => {
        const back = vi.fn()
        const retry = vi.fn()
        const { container } = render(
            <CourseHeadhuntingCompanyPageBase state="not-found" props={props} on={{ back, retry }} />,
        )

        expect(screen.getByText("Not found.")).toBeInTheDocument()
        expect(container.querySelector("[data-node=\"next-action-list\"]")).toBeNull()
        fireEvent.click(screen.getAllByRole("button", { name: /Back to partners/ })[1])
        expect(back).toHaveBeenCalledOnce()
        expect(retry).not.toHaveBeenCalled()
    })

    it("offers the way back from a failed company load", () => {
        const retry = vi.fn()
        render(<CourseHeadhuntingCompanyPageBase state="failed" props={props} on={{ retry }} />)

        expect(screen.getByText("Could not load company.")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: /Try again/ }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("keeps a contactless partner to one back control and says the roster is empty", () => {
        const { container } = render(
            <CourseHeadhuntingCompanyPageBase
                state="ready"
                props={{ ...props, contactLabel: undefined, description: undefined, consultants: [] }}
            />,
        )

        expect(screen.queryByRole("button", { name: /Contact company/ })).not.toBeInTheDocument()
        expect(screen.getByText("No consultants.")).toBeInTheDocument()
        expect(screen.queryByText("Technology hiring")).not.toBeInTheDocument()
        expect(container.querySelectorAll("[data-node=\"next-action-list\"] [data-node=\"empty-notice-stack\"]")).toHaveLength(1)
    })

    it("contacts the company and only the consultants who are reachable", () => {
        const back = vi.fn()
        const companyContact = vi.fn()
        const contact = vi.fn()
        const course = vi.fn()
        render(
            <CourseHeadhuntingCompanyPageBase
                state="ready"
                props={{
                    ...props,
                    address: "12 Le Loi",
                    consultants: [
                        ...props.consultants,
                        { id: "consultant-2", label: "Blair", actionLabel: "Contact", isActionAvailable: false },
                    ],
                }}
                on={{ back, companyContact, course, "contact:consultant-1": contact }}
            />,
        )

        expect(screen.getByText("12 Le Loi")).toBeInTheDocument()
        fireEvent.click(screen.getByText("Alex · Contact"))
        expect(contact).toHaveBeenCalledOnce()
        expect(screen.getByText("Blair · Contact").getAttribute("data-component")).not.toBe("TextLink")

        fireEvent.click(screen.getByRole("button", { name: /Contact company/ }))
        expect(companyContact).toHaveBeenCalledOnce()
        fireEvent.click(screen.getByRole("button", { name: /Back to partners/ }))
        expect(back).toHaveBeenCalledOnce()
        fireEvent.click(screen.getByText("TypeScript"))
        expect(course).toHaveBeenCalledOnce()
    })
})
