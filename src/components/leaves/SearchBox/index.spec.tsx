/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { SearchBox } from "./index"

/**
 * What these tests guard - that clearing the box searches again.
 *
 * A field emptied over a filtered list leaves the reader looking at results for a query that is no
 * longer on screen, so the clear control is not a text operation: it reports an empty search. That
 * is asserted by the argument the handler receives, since an emptied input alone would look correct
 * and change nothing.
 *
 * It also guards the suffix, which holds exactly one thing at a time: a keyboard hint into an empty
 * box, and a way to empty a full one. Both drawn at once would offer a shortcut into a field
 * somebody is already typing in.
 */

const props = {
    placeholder: "Search courses",
    label: "Search",
    clearLabel: "Clear search",
    shortcut: "Ctrl K",
} as const

afterEach(cleanup)

describe("SearchBox", () => {
    it("prints the keyboard shortcut in the empty box, so a reader can learn it exists", () => {
        render(<SearchBox props={props} />)
        expect(screen.getByText("Ctrl K")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull()
    })

    it("draws no hint at all where the caller named no shortcut", () => {
        render(<SearchBox props={{ ...props, shortcut: undefined }} />)
        expect(screen.queryByText("Ctrl K")).toBeNull()
        expect(screen.getByRole("searchbox", { name: "Search" })).toHaveAttribute("placeholder", "Search courses")
        expect(document.querySelector("kbd")).toBeNull()
    })

    it("reports the query on submit", () => {
        const search = vi.fn()
        const { container } = render(<SearchBox props={props} on={{ search }} />)
        fireEvent.change(screen.getByRole("searchbox", { name: "Search" }), { target: { value: "rust" } })
        fireEvent.submit(container.querySelector("form") as HTMLFormElement)
        expect(search).toHaveBeenCalledWith("rust")
    })

    it("reports the query when Enter is pressed in the vendor input host", () => {
        const search = vi.fn()
        render(<SearchBox props={props} on={{ search }} />)
        const field = screen.getByRole("searchbox", { name: "Search" })

        fireEvent.change(field, { target: { value: "rust" } })
        fireEvent.keyDown(field, { key: "Enter" })

        expect(search).toHaveBeenCalledTimes(1)
        expect(search).toHaveBeenCalledWith("rust")
    })

    it("submits without a listener rather than throwing at the reader", () => {
        const { container } = render(<SearchBox props={props} />)
        fireEvent.change(screen.getByRole("searchbox", { name: "Search" }), { target: { value: "rust" } })
        expect(() => fireEvent.submit(container.querySelector("form") as HTMLFormElement)).not.toThrow()
    })

    it("gives the hint up to the clear control the moment there is text", () => {
        render(<SearchBox props={props} on={{ search: vi.fn() }} />)
        const field = screen.getByRole("searchbox", { name: "Search" })

        fireEvent.change(field, { target: { value: "r" } })
        expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument()
        expect(screen.queryByText("Ctrl K")).toBeNull()

        fireEvent.change(field, { target: { value: "" } })
        expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull()
        expect(screen.getByText("Ctrl K")).toBeInTheDocument()
    })

    it("empties the field, keeps the caret in it, and searches again for nothing", () => {
        const search = vi.fn()
        render(<SearchBox props={props} on={{ search }} />)
        const field = screen.getByRole("searchbox", { name: "Search" }) as HTMLInputElement

        fireEvent.change(field, { target: { value: "rust" } })
        fireEvent.click(screen.getByRole("button", { name: "Clear search" }))

        expect(field).toHaveValue("")
        expect(field).toHaveFocus()
        expect(search).toHaveBeenCalledWith("")
        // The hint comes back with the empty box, and the clear control goes with the text.
        expect(screen.getByText("Ctrl K")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull()
    })

    it("clears without a listener rather than throwing at the reader", () => {
        render(<SearchBox props={props} />)
        const field = screen.getByRole("searchbox", { name: "Search" }) as HTMLInputElement
        fireEvent.change(field, { target: { value: "rust" } })
        fireEvent.click(screen.getByRole("button", { name: "Clear search" }))
        expect(field).toHaveValue("")
    })
})
