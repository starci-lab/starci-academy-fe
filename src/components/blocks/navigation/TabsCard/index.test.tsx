/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import { TabsCard, meta, type TabsCardProps } from "@/components/blocks/navigation/TabsCard"
import type { ExtendedTabsItem } from "@/components/blocks/navigation/ExtendedTabs"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: that the two runs stay two different KINDS of choice - what is shown,
 * and how - so a row can never end up with two things claiming to be the primary. The original
 * needed a flag to prevent that after the fact; here the shape prevents it.
 */

/** What is being shown. */
const ITEMS: ReadonlyArray<ExtendedTabsItem> = [
    { id: "overview", label: "Overview" },
    { id: "courses", label: "Courses" },
]

/** How it is being shown. */
const ASPECTS: ReadonlyArray<ExtendedTabsItem> = [
    { id: "en", label: "English" },
    { id: "vi", label: "Vietnamese" },
]

/** Render with the given props and hand back the root node. */
const renderToolbar = (props: Partial<TabsCardProps> = {}): Element => {
    const merged: TabsCardProps = {
        items: ITEMS,
        selectedId: "overview",
        ...props,
    }
    const { container } = render(<TabsCard {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("TabsCard rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("TabsCard", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "block", name: "TabsCard" })
    })

    it("draws one row holding the choices, and wears the key's classes", () => {
        const root = renderToolbar()
        expect(root.getAttribute("data-node")).toBe("content-row")
        expect(root.getAttribute("data-roles")).toBe("field action")
        expect(root.getAttribute("class")).toBe(contractSpec("content-row").classes)
    })

    it("carries only the primary run when there is nothing acting on it", () => {
        const root = renderToolbar()
        expect(root.querySelectorAll("[data-node='track']").length).toBe(1)
    })

    it("keeps the two runs apart, so neither can be mistaken for the other", () => {
        const root = renderToolbar({ aspectItems: ASPECTS, selectedAspectId: "en" })
        const runs = root.querySelectorAll("[data-node='track']")
        expect(runs.length).toBe(2)
        expect(runs[0].textContent).toContain("Overview")
        expect(runs[1].textContent).toContain("English")
    })

    it("reports each kind of choice to its own owner", () => {
        const onSelect = vi.fn()
        const onSelectAspect = vi.fn()
        const root = renderToolbar({
            aspectItems: ASPECTS,
            selectedAspectId: "en",
            onSelect,
            onSelectAspect,
        })
        const buttons = [...root.querySelectorAll("button")]
        fireEvent.click(buttons.find((node) => node.textContent === "Courses") as HTMLButtonElement)
        fireEvent.click(buttons.find((node) => node.textContent === "Vietnamese") as HTMLButtonElement)
        expect(onSelect).toHaveBeenCalledWith("courses")
        expect(onSelectAspect).toHaveBeenCalledWith("vi")
    })
})
