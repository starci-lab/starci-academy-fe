/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { GlobalSearchOverlayBase, type GlobalSearchOverlayCopy } from "./component"

class TestResizeObserver implements ResizeObserver {
    observe = () => undefined
    unobserve = () => undefined
    disconnect = () => undefined
}
globalThis.ResizeObserver = TestResizeObserver
afterEach(cleanup)

const copy: GlobalSearchOverlayCopy = {
    label: "Search", placeholder: "Find", clearLabel: "Clear", shortcut: "Ctrl K",
    scopesLabel: "Scopes", resultsLabel: "Results",
    idleMessage: "Search all", idleDescription: "Start typing",
    emptyMessage: "Nothing", emptyDescription: "Try again",
    errorMessage: "Offline", errorDescription: "Retry later",
    browseCourses: "Browse courses", retry: "Retry", openResult: "Open result",
    detailLoading: "Loading details", detailError: "Detail unavailable",
}
const base = {
    query: "",
    scopes: [{ id: "all", textValue: "All", label: "All", icon: "viewGrid" as const, count: 0 }],
    selectedScope: "all",
    results: [],
    detail: { status: "idle" as const },
}

describe("GlobalSearchOverlayBase", () => {
    it("renders idle recovery inside one modal surface", () => {
        render(<GlobalSearchOverlayBase isOpen state={{ status: "idle", ...base }} copy={copy} />)
        expect(screen.getByRole("dialog")).toBeTruthy()
        expect(screen.getByText("Search all")).toBeTruthy()
        expect(document.querySelector("[data-node=\"global-search-result-region\"] [data-node=\"empty-notice-stack\"]")).toBeTruthy()
        expect(screen.queryByRole("heading")).toBeNull()
        expect(document.querySelector("[data-component=SelectionList][data-variant=scopes] [data-node=glyph-compact-action-fact-row]")).toBeTruthy()
        const body = document.querySelector("[data-node=\"global-search-body\"]")
        expect(body?.className).toContain("[data-variant=scopes]")
        expect(body?.className).toContain("[data-node=global-search-result-region]")
        expect(body?.className).not.toContain("last-child")
    })

    it("renders selected result context and opens its canonical outcome", () => {
        const resultOpen = vi.fn()
        const result = { id: "courses:1", textValue: "System", title: "System", snippet: "Design", kindLabel: "Course" }
        render(<GlobalSearchOverlayBase isOpen state={{
            status: "ready",
            ...base,
            query: "sys",
            results: [result],
            selectedResult: result.id,
            detail: { status: "ready", id: result.id, title: "System detail", description: "Loaded from detail API", kindLabel: "Course" },
        }} copy={copy} on={{ resultOpen }} />)
        expect(screen.getAllByText("System").length).toBeGreaterThan(0)
        expect(document.querySelector("[data-node=\"global-search-result-region\"] [data-component=\"SurfaceListCard\"] [data-component=\"SelectionList\"]")).toBeTruthy()
        expect(document.querySelector("[data-component=\"SurfaceListCardSurface\"][data-surface-context=\"nested\"]")).toBeTruthy()
        expect(document.querySelector("[data-node=\"global-search-context-card\"]")).toBeTruthy()
        expect(screen.getByText("Loaded from detail API")).toBeTruthy()
        expect(screen.queryByText("Design")).toBeNull()
        expect(screen.queryByRole("heading")).toBeNull()
        fireEvent.click(screen.getByRole("button", { name: "Open result" }))
        expect(resultOpen).toHaveBeenCalledWith("courses:1")
    })

    it("renders detail loading and detail recovery independently of autocomplete", () => {
        const retry = vi.fn()
        const result = { id: "courses:1", textValue: "System", title: "System", snippet: "Search snippet", kindLabel: "Course" }
        const { rerender } = render(<GlobalSearchOverlayBase isOpen state={{
            status: "ready", ...base, query: "sys", results: [result], selectedResult: result.id,
            detail: { status: "pending", kindLabel: "Course" },
        }} copy={copy} on={{ retry }} />)
        expect(screen.getByText("Loading details")).toBeTruthy()
        expect(screen.queryByText("Search snippet")).toBeNull()
        rerender(<GlobalSearchOverlayBase isOpen state={{
            status: "ready", ...base, query: "sys", results: [result], selectedResult: result.id,
            detail: { status: "error", kindLabel: "Course" },
        }} copy={copy} on={{ retry }} />)
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("tells a search that matched nothing apart from one nobody has typed yet", () => {
        const browseCourses = vi.fn()
        render(<GlobalSearchOverlayBase isOpen state={{ status: "empty", ...base, query: "zzz" }} copy={copy} on={{ browseCourses }} />)

        expect(screen.getByText("Nothing")).toBeTruthy()
        expect(screen.getByText("Try again")).toBeTruthy()
        expect(screen.queryByText("Search all")).toBeNull()
        fireEvent.click(screen.getByRole("button", { name: "Browse courses" }))
        expect(browseCourses).toHaveBeenCalledOnce()
    })

    it("carries the selected result's own status into the context card", () => {
        const result = { id: "courses:1", textValue: "System", title: "System", kindLabel: "Course" }
        render(<GlobalSearchOverlayBase isOpen state={{
            status: "ready", ...base, query: "sys", results: [result], selectedResult: result.id,
            detail: { status: "ready", id: result.id, title: "System detail", kindLabel: "Course", statusLabel: "Enrolled" },
        }} copy={copy} />)

        const card = document.querySelector("[data-node=\"global-search-context-card\"]")
        expect(card?.querySelector("[data-component=\"Badge\"]")).toHaveTextContent("Enrolled")
    })

    it("reports the vendor's own way out as one dismissal", () => {
        const dismiss = vi.fn()
        render(<GlobalSearchOverlayBase isOpen state={{ status: "idle", ...base }} copy={copy} on={{ dismiss }} />)

        fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape", code: "Escape" })
        expect(dismiss).toHaveBeenCalled()
    })

    it("keeps query controls available in error state", () => {
        const retry = vi.fn()
        render(<GlobalSearchOverlayBase isOpen state={{ status: "error", ...base, query: "sys" }} copy={copy} on={{ retry }} />)
        expect((screen.getByRole("combobox", { name: "Search" }) as HTMLInputElement).value).toBe("sys")
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(retry).toHaveBeenCalledOnce()
    })
})
