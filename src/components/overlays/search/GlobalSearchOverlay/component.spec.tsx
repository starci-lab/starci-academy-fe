/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { GlobalSearchOverlayView, type GlobalSearchOverlayCopy } from "./component"

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

describe("GlobalSearchOverlayView", () => {
    it("renders idle recovery inside one modal surface", () => {
        render(<GlobalSearchOverlayView isOpen state={{ status: "idle", ...base }} copy={copy} />)
        expect(screen.getByRole("dialog")).toBeTruthy()
        expect(screen.getByText("Search all")).toBeTruthy()
        expect(screen.getByText("Start typing")).toBeTruthy()
        expect(screen.queryByRole("heading")).toBeNull()
        expect(screen.getByRole("listbox", { name: "Scopes" })).toBeTruthy()
    })

    it("renders selected result context and opens its canonical outcome", () => {
        const resultOpen = vi.fn()
        const result = { id: "courses:1", textValue: "System", title: "System", snippet: "Design", kindLabel: "Course" }
        render(<GlobalSearchOverlayView isOpen state={{
            status: "ready",
            ...base,
            query: "sys",
            results: [result],
            selectedResult: result.id,
            detail: { status: "ready", id: result.id, title: "System detail", description: "Loaded from detail API", kindLabel: "Course" },
        }} copy={copy} on={{ resultOpen }} />)
        expect(screen.getAllByText("System").length).toBeGreaterThan(0)
        expect(screen.getByText("Loaded from detail API")).toBeTruthy()
        expect(screen.queryByText("Design")).toBeNull()
        expect(screen.queryByRole("heading")).toBeNull()
        fireEvent.click(screen.getByRole("button", { name: "Open result" }))
        expect(resultOpen).toHaveBeenCalledWith("courses:1")
    })

    it("renders detail loading and detail recovery independently of autocomplete", () => {
        const retry = vi.fn()
        const result = { id: "courses:1", textValue: "System", title: "System", snippet: "Search snippet", kindLabel: "Course" }
        const { rerender } = render(<GlobalSearchOverlayView isOpen state={{
            status: "ready", ...base, query: "sys", results: [result], selectedResult: result.id,
            detail: { status: "pending", kindLabel: "Course" },
        }} copy={copy} on={{ retry }} />)
        expect(screen.getByText("Loading details")).toBeTruthy()
        expect(screen.queryByText("Search snippet")).toBeNull()
        rerender(<GlobalSearchOverlayView isOpen state={{
            status: "ready", ...base, query: "sys", results: [result], selectedResult: result.id,
            detail: { status: "error", kindLabel: "Course" },
        }} copy={copy} on={{ retry }} />)
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("tells a search that matched nothing apart from one nobody has typed yet", () => {
        const browseCourses = vi.fn()
        render(<GlobalSearchOverlayView isOpen state={{ status: "empty", ...base, query: "zzz" }} copy={copy} on={{ browseCourses }} />)

        expect(screen.getByText("Nothing")).toBeTruthy()
        expect(screen.getByText("Try again")).toBeTruthy()
        expect(screen.queryByText("Search all")).toBeNull()
        fireEvent.click(screen.getByRole("button", { name: "Browse courses" }))
        expect(browseCourses).toHaveBeenCalledOnce()
    })

    it("carries the selected result's own status into the context card", () => {
        const result = { id: "courses:1", textValue: "System", title: "System", kindLabel: "Course" }
        render(<GlobalSearchOverlayView isOpen state={{
            status: "ready", ...base, query: "sys", results: [result], selectedResult: result.id,
            detail: { status: "ready", id: result.id, title: "System detail", kindLabel: "Course", statusLabel: "Enrolled" },
        }} copy={copy} />)

        expect(screen.getByText("Enrolled")).toBeTruthy()
    })

    it("reports the vendor's own way out as one dismissal", () => {
        const dismiss = vi.fn()
        render(<GlobalSearchOverlayView isOpen state={{ status: "idle", ...base }} copy={copy} on={{ dismiss }} />)

        fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape", code: "Escape" })
        expect(dismiss).toHaveBeenCalled()
    })

    it("keeps query controls available in error state", () => {
        const retry = vi.fn()
        render(<GlobalSearchOverlayView isOpen state={{ status: "error", ...base, query: "sys" }} copy={copy} on={{ retry }} />)
        expect((screen.getByRole("combobox", { name: "Search" }) as HTMLInputElement).value).toBe("sys")
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(retry).toHaveBeenCalledOnce()
    })
})
