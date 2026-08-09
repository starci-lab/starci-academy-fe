/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { KeyValue, meta, type KeyValueProps } from "@/components/composites/data/KeyValue"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: that a specification line puts the name first and the value at the end,
 * so a column of them lines its values up - and that only the value rests, because the name is
 * copy the caller already holds and shimmering it hides a word that is not waiting on anything.
 */

/** Render with the given props and hand back the line. */
const renderPair = (props: Partial<KeyValueProps> = {}): Element => {
    const merged: KeyValueProps = { label: "Plan", value: "Pro", ...props }
    const { container } = render(<KeyValue {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("KeyValue rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("KeyValue", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "composite", name: "KeyValue" })
    })

    it("draws the registry key, and wears its classes rather than any of its own", () => {
        const root = renderPair()
        expect(root.getAttribute("data-node")).toBe("key-value-row")
        expect(root.getAttribute("data-roles")).toBe("heading meta")
        expect(root.getAttribute("class")).toBe(contractSpec("key-value-row").classes)
    })

    it("puts the name first and the fact at the end", () => {
        const root = renderPair()
        expect(root.children.length).toBe(2)
        expect(root.children[0].textContent).toBe("Plan")
        expect(root.children[1].textContent).toBe("Pro")
    })

    it("keeps the name quieter than the fact, because the fact is what was come for", () => {
        const root = renderPair()
        expect(root.children[0].getAttribute("class")).toContain("color-muted")
        expect(root.children[1].getAttribute("class")).not.toContain("color-muted")
    })

    it("sets the fact firmly only when a list asks for it", () => {
        expect(renderPair({ isStrong: true }).children[1].getAttribute("class")).toContain("weight-medium")
        cleanup()
        expect(renderPair().children[1].getAttribute("class")).toContain("weight-normal")
    })

    it("leads with no glyph - this line is read down a column, not scanned across", () => {
        expect(renderPair().querySelector("svg")).toBeNull()
    })

    it("rests the fact and never the name", () => {
        const root = renderPair({ isLoading: true })
        expect(root.children[0].getAttribute("data-loading")).toBe("false")
        expect(root.children[1].getAttribute("data-loading")).toBe("true")
    })

    it("offers no className door", () => {
        const backDoor = { className: "back-door" } as unknown as KeyValueProps
        const { container } = render(<KeyValue {...backDoor} label="Plan" value="Pro" />)
        expect(container.firstElementChild?.getAttribute("class")).toBe(contractSpec("key-value-row").classes)
    })
})
