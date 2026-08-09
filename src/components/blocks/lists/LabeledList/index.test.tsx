/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import {
    LabeledList,
    meta,
    type LabeledListProps,
    type LabeledListRow,
} from "@/components/blocks/lists/LabeledList"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: that this panel draws NO surface - a rail of four bounded panels is a
 * rail of four cards competing with each other - and that the lines line their values up, which
 * is the only reason a run of facts is easier to read than a paragraph of them.
 */

/** Two settled lines. */
const ROWS: ReadonlyArray<LabeledListRow> = [
    { id: "a", label: "Streak", value: "2 days" },
    { id: "b", label: "Credit", value: "3 of 10" },
]

/** The way on. */
const Action = () => <span data-testid="action">Review now</span>

/** Render with the given props and hand back the root node. */
const renderList = (props: Partial<LabeledListProps> = {}): Element => {
    const merged: LabeledListProps = {
        label: "Your standing",
        rows: ROWS,
        ...props,
    }
    const { container } = render(<LabeledList {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("LabeledList rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("LabeledList", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "block", name: "LabeledList" })
    })

    it("names a region without drawing a surface around it", () => {
        const root = renderList()
        expect(root.getAttribute("data-node")).toBe("section")
        expect(root.getAttribute("class")).toBe(contractSpec("section").classes)
        expect(root.querySelector("[data-node='card']")).toBeNull()
        expect(root.querySelector("[data-node='surface-card']")).toBeNull()
    })

    it("draws one line per fact, with the value pushed to the far end", () => {
        const root = renderList()
        const lines = root.querySelectorAll("[data-node='key-value-row']")
        expect(lines.length).toBe(2)
        expect(lines[0].children[0].textContent).toBe("Streak")
        expect(lines[0].children[1].textContent).toBe("2 days")
    })

    it("puts the way on below the lines rather than beside the name", () => {
        const root = renderList({ action: Action })
        const stack = root.querySelector("[data-node='stack']")
        const children = [...(stack?.children ?? [])]
        expect(children[children.length - 1].getAttribute("data-testid")).toBe("action")
    })

    it("says what is missing when the panel settles with nothing", () => {
        const root = renderList({ rows: [], emptyLabel: "Nothing to review today" })
        expect(root.textContent).toContain("Nothing to review today")
        expect(root.querySelector("[data-node='key-value-row']")).toBeNull()
    })

    it("rests as itself, at the height of a real panel, and never as a settled nothing", () => {
        const root = renderList({ rows: [], emptyLabel: "Nothing to review today", isLoading: true })
        expect(root.querySelectorAll("[data-node='key-value-row']").length).toBe(3)
        expect(root.textContent).not.toContain("Nothing to review today")
    })

    it("keeps the panel named while its lines rest", () => {
        const root = renderList({ meta: "2 facts", isLoading: true })
        expect(root.querySelector("h3")?.textContent).toBe("Your standing")
    })
})
