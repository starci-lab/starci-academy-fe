/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import {
    ExtendedTabs,
    meta,
    type ExtendedTabsItem,
    type ExtendedTabsProps,
} from "@/components/blocks/navigation/ExtendedTabs"

/**
 * What these tests guard: that the run is a LIST, so assistive technology is told how many
 * choices there are; that exactly one of them reads as chosen; and that the block reports the
 * choice rather than answering it, because which panel is showing is the surface's fact.
 */

/** Three choices, one of them unavailable. */
const ITEMS: ReadonlyArray<ExtendedTabsItem> = [
    { id: "overview", label: "Overview" },
    { id: "courses", label: "Courses" },
    { id: "community", label: "Community", isDisabled: true },
]

/** Render with the given props and hand back the root node. */
const renderTabs = (props: Partial<ExtendedTabsProps> = {}): Element => {
    const merged: ExtendedTabsProps = {
        items: ITEMS,
        selectedId: "overview",
        ...props,
    }
    const { container } = render(<ExtendedTabs {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("ExtendedTabs rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("ExtendedTabs", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "block", name: "ExtendedTabs" })
    })

    it("draws the run as a list, so the count of choices is announced", () => {
        const root = renderTabs()
        expect(root.tagName).toBe("UL")
        expect(root.querySelectorAll("[data-part='tab']").length).toBe(3)
    })

    it("marks exactly one choice as the one being read", () => {
        const root = renderTabs()
        const selected = [...root.querySelectorAll("[data-part='tab']")]
            .filter((node) => node.getAttribute("data-selected") === "true")
        expect(selected.length).toBe(1)
        expect(selected[0].textContent).toBe("Overview")
    })

    it("reports the choice rather than answering it", () => {
        const onSelect = vi.fn()
        const root = renderTabs({ onSelect })
        const courses = [...root.querySelectorAll("button")].find((node) => node.textContent === "Courses")
        fireEvent.click(courses as HTMLButtonElement)
        expect(onSelect).toHaveBeenCalledWith("courses")
    })

    it("shows a choice that cannot be taken, and refuses the press", () => {
        const onSelect = vi.fn()
        const root = renderTabs({ onSelect })
        const community = [...root.querySelectorAll("button")].find((node) => node.textContent === "Community")
        fireEvent.click(community as HTMLButtonElement)
        expect(onSelect).not.toHaveBeenCalled()
    })

    it("rests at its real width, with every choice still in the run", () => {
        const root = renderTabs({ isLoading: true })
        expect(root.querySelectorAll("[data-part='tab']").length).toBe(3)
        expect(root.querySelector("button")?.getAttribute("data-loading")).toBe("true")
    })
})
