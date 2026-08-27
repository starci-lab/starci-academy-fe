/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { GlobalSearchResultsBase } from "./component"

class TestResizeObserver implements ResizeObserver {
    observe = () => undefined
    unobserve = () => undefined
    disconnect = () => undefined
}
globalThis.ResizeObserver = TestResizeObserver
afterEach(cleanup)

describe("GlobalSearchResultsBase", () => {
    it("uses one label-less nested SurfaceListCard when results exist", () => {
        render(<GlobalSearchResultsBase props={{ label: "Results", items: [{ id: "one", textValue: "One", title: "One" }], emptyMessage: "Empty" }} />)
        expect(screen.getByRole("listbox", { name: "Results" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "One" })).toBeInTheDocument()
        expect(screen.queryByRole("heading")).toBeNull()
    })

    it("selects a result for detail without exposing row activation", () => {
        const select = vi.fn()
        render(<GlobalSearchResultsBase props={{ label: "Results", items: [{ id: "one", textValue: "One", title: "One" }], emptyMessage: "Empty" }} on={{ select }} />)
        fireEvent.click(screen.getByRole("option", { name: /One/ }))
        expect(select).toHaveBeenCalledWith("one")
    })

    it("replaces the list surface with EmptyNotice when no result exists", () => {
        const recover = vi.fn()
        render(<GlobalSearchResultsBase props={{ label: "Results", items: [], emptyMessage: "Empty", emptyActionLabel: "Retry" }} on={{ recover }} />)
        expect(screen.queryByRole("listbox")).toBeNull()
        expect(screen.getByText("Empty")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(recover).toHaveBeenCalledOnce()
    })
})
