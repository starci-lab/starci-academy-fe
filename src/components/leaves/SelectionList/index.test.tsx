/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { SelectionList } from "."

class TestResizeObserver implements ResizeObserver {
    observe = () => undefined
    unobserve = () => undefined
    disconnect = () => undefined
}
globalThis.ResizeObserver = TestResizeObserver
afterEach(cleanup)

const items = [
    { id: "all", textValue: "All", title: "All", icon: "viewGrid" as const, badge: "8" },
    { id: "courses", textValue: "Courses", title: "Courses", icon: "course" as const, badge: "1" },
]

describe("SelectionList", () => {
    it("renders fixed scope rows and reports activation", () => {
        const select = vi.fn()
        const activate = vi.fn()
        render(<SelectionList props={{ label: "Scopes", items, selectedKey: "all", variant: "scopes" }} on={{ select, activate }} />)
        const courses = screen.getByRole("option", { name: /Courses/ })
        fireEvent.click(courses)
        expect(select).toHaveBeenCalledWith("courses")
        fireEvent.keyDown(courses, { key: "Enter" })
        expect(activate).toHaveBeenCalledWith("courses")
        expect(document.querySelector("[data-slot=\"list-box\"]")).toBeTruthy()
        expect(document.querySelector("[data-slot=\"list-box-item-indicator\"]")).toBeNull()
        const all = screen.getByRole("option", { name: /All/ })
        expect(all.className).toContain("data-[selected=true]:bg-accent-soft")
        expect(all.className).toContain("data-[selected=true]:text-accent-soft-foreground")
        expect(all.querySelector("svg[data-slot=\"icon\"]")).toBeTruthy()
        const count = screen.getByText("8")
        expect(count).toHaveAttribute("data-size", "xs")
        expect(count).toHaveAttribute("data-tone", "muted")
        expect(count).toHaveAttribute("data-parent-emphasis", "accent-soft")
        expect(count.className).toContain("group-hover:text-accent-soft")
        expect(count.className).not.toContain("rounded")
        expect(count.className).not.toContain("bg-")
        expect(all.querySelector("[data-node=glyph-compact-action-fact-row]")).toBeTruthy()
    })

    it("renders result description without accepting arbitrary children", () => {
        render(<SelectionList props={{ label: "Results", items: [{ id: "one", textValue: "One", title: "One", description: "Safe snippet", badge: "Course" }], variant: "results" }} />)
        expect(screen.getByText("Safe snippet")).toBeTruthy()
        expect(screen.getByText("Course")).toBeTruthy()
        expect(document.querySelector("[data-slot=\"list-box-item-indicator\"]")).toBeTruthy()
    })

    it("treats result action as detail selection instead of navigation activation", () => {
        const select = vi.fn()
        const activate = vi.fn()
        render(<SelectionList props={{ label: "Results", items: [{ id: "one", textValue: "One", title: "One" }], variant: "results" }} on={{ select, activate }} />)
        fireEvent.click(screen.getByRole("option", { name: "One" }))
        expect(select).toHaveBeenCalledWith("one")
        expect(activate).not.toHaveBeenCalled()
    })
})
