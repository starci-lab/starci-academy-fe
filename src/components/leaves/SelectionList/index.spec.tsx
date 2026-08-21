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
        expect(all.className).toContain("data-[selected=true]:data-[hovered=true]:bg-accent-soft")
        expect(all.querySelector("svg[data-slot=\"icon\"]")).toBeTruthy()
        const count = screen.getByText("8")
        expect(count).toHaveAttribute("data-size", "xs")
        expect(count).toHaveAttribute("data-tone", "muted")
        expect(count).toHaveAttribute("data-parent-emphasis", "accent-soft")
        expect(count.className).toContain("group-data-[selected=true]:text-accent-soft-foreground")
        expect(count.className).not.toContain("group-hover:text-accent-soft")
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

    it("renders course-outline rows through ListBox and activates the chosen lesson", () => {
        const activate = vi.fn()
        render(
            <SelectionList
                props={{
                    id: "module-lessons",
                    label: "Linux fundamentals",
                    variant: "outline",
                    selectedKey: "lesson-one",
                    items: [{
                        id: "lesson-one",
                        textValue: "Filesystem",
                        title: "Filesystem",
                        icon: "complete",
                        meta: "12 min",
                    }],
                }}
                on={{ activate }}
            />,
        )

        const lessonTitle = screen.getByText("Filesystem")
        fireEvent.click(lessonTitle)
        expect(document.querySelector("[data-component=SelectionList][data-variant=outline]")).toBeTruthy()
        expect(lessonTitle.className).toContain("text-base")
        expect(lessonTitle.className).toContain("font-normal")
        expect(activate).toHaveBeenCalledWith("lesson-one")
    })

    it("renders navigation rows with prominent trailing chips without implying disabled state", () => {
        render(
            <SelectionList
                props={{
                    label: "Path",
                    variant: "navigation",
                    selectedKey: "modules",
                    items: [
                        { id: "modules", textValue: "Modules", title: "Modules", icon: "course", isCurrent: true },
                        { id: "capstone", textValue: "Capstone", title: "Capstone", icon: "jobs", badge: "Locked", badgeTone: "warning" },
                    ],
                }}
            />,
        )

        const list = document.querySelector("[data-component=SelectionList][data-variant=navigation]")
        const modules = screen.getByRole("option", { name: "Modules" })
        const capstone = screen.getByRole("option", { name: /Capstone/ })
        expect(list).toBeTruthy()
        expect(modules.className).not.toContain("data-[hovered=true]:bg-default")
        expect(modules.className).not.toContain("data-[focus-visible=true]:ring-2")
        expect(capstone).not.toHaveAttribute("aria-disabled")
        expect(screen.getByText("Locked").closest("[data-component=Badge]")).toHaveAttribute("data-tone", "warning")
        expect(screen.getByText("Locked").closest("[data-node=glyph-compact-action-fact-row]")?.className)
            .toContain("[&>*:nth-child(2)]:grow")
    })

    it("keeps compact navigation destinations circular", () => {
        render(
            <SelectionList
                props={{ label: "Path", variant: "navigation-collapsed", items }}
            />,
        )

        const destination = screen.getByRole("option", { name: "All" })
        expect(destination.closest("[role=listbox]")?.className).toContain("items-center")
        expect(destination.className).toContain("size-11")
        expect(destination.className).toContain("p-0")
        const visualCircle = destination.querySelector("[data-slot=compact-icon]")
        expect(visualCircle?.className).toContain("size-9")
        expect(visualCircle?.className).toContain("rounded-full")
    })
})
