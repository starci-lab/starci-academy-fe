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
        expect(document.querySelector("[data-component=\"SurfaceListCard\"]")).toBeTruthy()
        expect(document.querySelector("[data-component=\"SurfaceListCardSurface\"][data-surface-context=\"nested\"]")).toBeTruthy()
        expect(document.querySelector("[data-component=\"SelectionList\"][data-variant=\"results\"]")).toBeTruthy()
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
        expect(document.querySelector("[data-component=\"SurfaceListCard\"]")).toBeNull()
        expect(document.querySelector("[data-node=\"empty-notice-stack\"]")).toBeTruthy()
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(recover).toHaveBeenCalledOnce()
    })
})
