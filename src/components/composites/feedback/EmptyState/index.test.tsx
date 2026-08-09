/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { EmptyState, meta, type EmptyStateProps } from "@/components/composites/feedback/EmptyState"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: that an empty region is never a dead end. The action is required by
 * the props type and by the key, so the honest question - what can the reader do about it - has
 * to be answered before this state can be drawn at all. The second guard is that the sentence is
 * a real heading: a reader moving by headings has to be able to land on the reason a region is
 * empty rather than on silence.
 */

/**
 * The copy this state is exercised with.
 *
 * Hoisted rather than typed into the call, the way every twin test in this tree supplies resolved
 * copy: a vocabulary-tier component takes translated text as a prop, and a literal sitting on the
 * call reads as a component that spells its own - which is the thing the rule exists to catch.
 */
const copy = {
    /** What the emptiness means. */
    title: "You have not enrolled in a course yet",
    /** The same, shortened, for the door test. */
    short: "Nothing yet",
}

/** A stand-in for the way out. */
const Action = () => <button data-part="action" type="button">Check again</button>

/** Render with the given props and hand back the state. */
const renderEmpty = (props: Partial<EmptyStateProps> = {}): Element => {
    const merged: EmptyStateProps = {
        icon: "course",
        title: copy.title,
        action: Action,
        ...props,
    }
    const { container } = render(<EmptyState {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("EmptyState rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("EmptyState", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "composite", name: "EmptyState" })
    })

    it("draws the registry key, and wears its classes rather than any of its own", () => {
        const root = renderEmpty()
        expect(root.getAttribute("data-node")).toBe("empty-state")
        expect(root.getAttribute("data-roles")).toBe("media heading action")
        expect(root.getAttribute("class")).toBe(contractSpec("empty-state").classes)
    })

    it("says what is missing, as a heading a reader can jump to", () => {
        expect(renderEmpty().querySelector("h3")?.textContent).toBe(copy.title)
        cleanup()
        expect(renderEmpty({ level: 2 }).querySelector("h2")).not.toBeNull()
    })

    it("always offers a way out, in the node itself rather than beside it", () => {
        const root = renderEmpty()
        expect(root.querySelector("[data-part='action']")).not.toBeNull()
        expect(root.children[root.children.length - 1].getAttribute("data-part")).toBe("action")
    })

    it("leads with a tile whose fill and glyph are one decision", () => {
        const tile = renderEmpty({ tone: "warning" }).querySelector("[data-component='IconTile']")
        expect(tile?.getAttribute("data-tone")).toBe("warning")
        expect(tile?.querySelector("svg")).not.toBeNull()
    })

    it("rests as the same state rather than as a second one", () => {
        const root = renderEmpty({ isLoading: true })
        expect(root.getAttribute("data-node")).toBe("empty-state")
        expect(root.querySelector("[data-component='IconTile']")?.getAttribute("data-loading")).toBe("true")
    })

    it("offers no className door", () => {
        const backDoor = { className: "back-door" } as unknown as EmptyStateProps
        const { container } = render(
            <EmptyState {...backDoor} icon="course" title={copy.short} action={Action} />,
        )
        expect(container.firstElementChild?.getAttribute("class")).toBe(contractSpec("empty-state").classes)
    })
})
