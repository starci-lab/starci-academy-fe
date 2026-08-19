import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseHeadhuntingsPageBase } from "./component"

/**
 * What these tests guard.
 *
 * The directory promises two lists and one honest rule about what can be pressed: a company row
 * opens only when the page was given a destination for it, and a consultant row becomes a contact
 * only when that consultant is actually reachable. Everything else stays plain text rather than a
 * link that leads nowhere.
 */

const props = {
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
}

describe("CourseHeadhuntingsPage", () => {
    it("renders proven company and consultant directory rows", () => {
        render(<CourseHeadhuntingsPageBase state="ready" props={props} />)
        expect(screen.getByText(/Acme Talent/)).toBeInTheDocument()
        expect(screen.getByText(/Alex/)).toBeInTheDocument()
    })

    it("rests both directories rather than hiding the consultant list while loading", () => {
        const { container } = render(<CourseHeadhuntingsPageBase state="pending" props={props} />)

        expect(container.querySelectorAll("[data-node=\"next-action-list\"]")).toHaveLength(2)
        expect(container.querySelectorAll("[data-node=\"next-action-list\"] > [data-component=\"Text\"][data-loading=\"true\"]")).toHaveLength(8)
        expect(container.querySelector("[data-component=\"TextLink\"]")).toBeNull()
    })

    it("replaces both directories with a talents notice when nothing is published", () => {
        const { container } = render(<CourseHeadhuntingsPageBase state="empty" props={props} />)

        expect(screen.getByText("No companies.")).toBeInTheDocument()
        expect(container.querySelector("[data-node=\"next-action-list\"]")).toBeNull()
        expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument()
    })

    it("offers the way back from a failed directory", () => {
        const retry = vi.fn()
        render(<CourseHeadhuntingsPageBase state="failed" props={props} on={{ retry }} />)

        expect(screen.getByText("Could not load companies.")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("opens a company and contacts a reachable consultant through their own outcomes", () => {
        const open = vi.fn()
        const contact = vi.fn()
        const search = vi.fn()
        const course = vi.fn()
        const { container } = render(
            <CourseHeadhuntingsPageBase
                state="ready"
                props={{
                    ...props,
                    consultants: [
                        ...props.consultants,
                        { id: "consultant-2", label: "Blair", actionLabel: "Contact", isActionAvailable: false },
                    ],
                }}
                on={{ "open:company-1": open, "contact:consultant-1": contact, search, course }}
            />,
        )

        fireEvent.click(screen.getByText("Acme Talent · Technology hiring"))
        expect(open).toHaveBeenCalledOnce()
        fireEvent.click(screen.getByText("Alex · Recruiter · Contact"))
        expect(contact).toHaveBeenCalledOnce()
        expect(screen.getByText("Blair · Contact").getAttribute("data-component")).not.toBe("TextLink")

        fireEvent.change(screen.getByRole("searchbox", { name: "Find a company" }), { target: { value: "acme" } })
        fireEvent.submit(container.querySelector("form[role=\"search\"]") as HTMLFormElement)
        expect(search).toHaveBeenCalledWith("acme")

        fireEvent.click(screen.getByText("TypeScript"))
        expect(course).toHaveBeenCalledOnce()
    })

    it("drops the consultant surface entirely when the course has no consultants", () => {
        const { container } = render(
            <CourseHeadhuntingsPageBase state="ready" props={{ ...props, consultants: [] }} />,
        )

        expect(container.querySelectorAll("[data-node=\"next-action-list\"]")).toHaveLength(1)
        expect(screen.queryByText("Consultants")).not.toBeInTheDocument()
        expect(screen.getByText("Companies")).toBeInTheDocument()
    })
})
