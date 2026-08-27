import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseHeadhuntingCompanyBlockBase } from "@/components/blocks/learn/CourseHeadhuntingCompanyBlock/component"
type TestBlockProps = { readonly blockState: string; readonly on?: Record<string, (...args: Array<never>) => void>; readonly [key: string]: unknown }
const CourseHeadhuntingCompanyPageBase = ({ blockState, on, ...props }: TestBlockProps) => (
    <CourseHeadhuntingCompanyBlockBase blockState={blockState as "pending" | "ready" | "not-found" | "failed"} props={props as never} on={on} />
)

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
    description: "Technology hiring", contactLabel: "Contact company", consultantsLabel: "Consultants", consultants: [{ id: "consultant-1", label: "Alex", actionLabel: "Contact", isActionAvailable: true }],
    backLabel: "Back to partners",
    notFoundMessage: "Not found.",
    emptyMessage: "No consultants.",
    errorMessage: "Could not load company.",
    retryLabel: "Try again",
}
const withState = (blockState: "pending" | "ready" | "not-found" | "failed", overrides: Record<string, unknown> = {}) => ({ ...props, ...overrides, blockState })

describe("CourseHeadhuntingCompanyPage", () => {
    it("offers contact without inventing a company application", () => {
        render(<CourseHeadhuntingCompanyPageBase {...withState("ready")} />)
        expect(screen.getByRole("button", { name: /Contact company/ })).toBeInTheDocument()
        expect(screen.queryByText(/apply/i)).not.toBeInTheDocument()
    })

    it("rests three consultant rows and the company name while the profile arrives", () => {
        render(<CourseHeadhuntingCompanyPageBase {...withState("pending")} />)

        expect(screen.getByRole("main", { name: "Acme Talent" })).toBeInTheDocument()
        expect(screen.getByRole("list", { name: "Consultants" })).toBeInTheDocument()
        expect(document.querySelectorAll("[data-loading=\"true\"]").length).toBeGreaterThanOrEqual(3)
        expect(screen.queryByRole("link", { name: "Alex" })).toBeNull()
    })

    it("sends a reader back rather than retrying a company that does not exist", () => {
        const back = vi.fn()
        const retry = vi.fn()
        render(
            <CourseHeadhuntingCompanyPageBase {...withState("not-found")} on={{ back, retry }} />,
        )

        expect(screen.getByText("Not found.")).toBeInTheDocument()
        expect(screen.queryByRole("list", { name: "Consultants" })).toBeNull()
        fireEvent.click(screen.getAllByRole("button", { name: /Back to partners/ })[1])
        expect(back).toHaveBeenCalledOnce()
        expect(retry).not.toHaveBeenCalled()
    })

    it("offers the way back from a failed company load", () => {
        const retry = vi.fn()
        render(<CourseHeadhuntingCompanyPageBase {...withState("failed")} on={{ retry }} />)

        expect(screen.getByText("Could not load company.")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: /Try again/ }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("keeps a contactless partner to one back control and says the roster is empty", () => {
        render(
            <CourseHeadhuntingCompanyPageBase
                {...withState("ready", { contactLabel: undefined, description: undefined, consultants: [] })}
            />,
        )

        expect(screen.queryByRole("button", { name: /Contact company/ })).not.toBeInTheDocument()
        expect(screen.getByText("No consultants.")).toBeInTheDocument()
        expect(screen.queryByText("Technology hiring")).not.toBeInTheDocument()
        expect(screen.getByRole("main", { name: "Acme Talent" })).toBeInTheDocument()
    })

    it("contacts the company and only the consultants who are reachable", () => {
        const back = vi.fn()
        const companyContact = vi.fn()
        const contact = vi.fn()
        const course = vi.fn()
        render(
            <CourseHeadhuntingCompanyPageBase
                {...withState("ready", {
                    address: "12 Le Loi",
                    consultants: [
                        ...props.consultants,
                        { id: "consultant-2", label: "Blair", actionLabel: "Contact", isActionAvailable: false },
                    ],
                })}
                on={{ back, companyContact, course, "contact:consultant-1": contact }}
            />,
        )

        expect(screen.getByText("12 Le Loi")).toBeInTheDocument()
        fireEvent.click(screen.getByText("Alex · Contact"))
        expect(contact).toHaveBeenCalledOnce()
        expect(screen.getByText("Blair · Contact")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: /Contact company/ }))
        expect(companyContact).toHaveBeenCalledOnce()
        fireEvent.click(screen.getByRole("button", { name: /Back to partners/ }))
        expect(back).toHaveBeenCalledOnce()
    })
})
