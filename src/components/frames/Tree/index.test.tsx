/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { Tree, meta } from "@/components/frames/Tree"
import {
    TREE_KEYS,
    treeSpec,
    type TreeKey,
    type TreeRole,
    type TreeSlot,
    type TreeSlotProps,
    type TreeSlots,
} from "@/components/classNames"

/**
 * What these tests are really guarding: that the rendered tree is the registry entry and
 * nothing else. Every class, every child, the order they appear in and the reason the node
 * exists all come from one key, so a drift between the registry and the DOM is the only
 * failure mode this frame has.
 */

/** A stand-in slot that records which role mounted it and whether it was told to rest. */
const slotFor = (role: TreeRole): TreeSlot => {
    const Slot = ({ isSkeleton }: TreeSlotProps) => (
        <span data-testid={`slot-${role}`} data-skeleton={isSkeleton === true ? "true" : "false"} />
    )
    return Slot
}

/**
 * Build the slots object for a key at runtime. The cast is the price of walking EVERY key in
 * one loop - `slots` is a mapped type over one key's roles, and a loop only has the widened
 * union. Call sites in real code never need it: they name the key and get the exact shape.
 */
const slotsFor = (name: TreeKey): TreeSlots<TreeKey> => {
    const entries: Array<[TreeRole, TreeSlot]> = treeSpec(name).roles.map((role) => [role, slotFor(role)])
    return Object.fromEntries(entries) as unknown as TreeSlots<TreeKey>
}

/** Render one key with a stand-in slot per declared role. */
const renderKey = (name: TreeKey, isSkeleton?: boolean) =>
    render(<Tree name={name} slots={slotsFor(name)} isSkeleton={isSkeleton} />)

/** The rendered role order, read back from the stand-in slots. */
const renderedRoles = (container: HTMLElement): string[] => {
    const mounted = [...container.querySelectorAll("[data-testid^='slot-']")]
    return mounted.map((node) => node.getAttribute("data-testid")?.replace("slot-", "") ?? "")
}

afterEach(() => {
    cleanup()
})

describe("Tree", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "frame", name: "Tree" })
    })

    it("renders every role of every key exactly once, in registry order", () => {
        for (const key of TREE_KEYS) {
            const { container } = renderKey(key)
            expect(renderedRoles(container), key).toEqual([...treeSpec(key).roles])
            cleanup()
        }
    })

    it("wears the registry class string and nothing else", () => {
        for (const key of TREE_KEYS) {
            const { container } = renderKey(key)
            const root = container.firstElementChild
            expect(root?.getAttribute("class"), key).toBe(treeSpec(key).classes)
            cleanup()
        }
    })

    it("emits the key, the child contract and the reason on the node", () => {
        for (const key of TREE_KEYS) {
            const { container } = renderKey(key)
            const root = container.firstElementChild
            expect(root?.getAttribute("data-node"), key).toBe(key)
            expect(root?.getAttribute("data-roles"), key).toBe(treeSpec(key).roles.join(" "))
            expect(root?.getAttribute("data-explain"), key).toBe(treeSpec(key).explain)
            expect(root?.getAttribute("data-tier"), key).toBe("frame")
            expect(root?.getAttribute("data-component"), key).toBe("Tree")
            cleanup()
        }
    })

    it("adds no wrapper node of its own around a slot", () => {
        const { container } = renderKey("content-row")
        const root = container.firstElementChild
        expect(root?.children.length).toBe(2)
        expect([...(root?.children ?? [])].map((node) => node.tagName)).toEqual(["SPAN", "SPAN"])
    })

    it("passes the skeleton flag down to every slot", () => {
        const { container } = renderKey("card", true)
        const slots = [...container.querySelectorAll("[data-skeleton]")]
        expect(slots.length).toBe(treeSpec("card").roles.length)
        for (const slot of slots) {
            expect(slot.getAttribute("data-skeleton")).toBe("true")
        }
    })

    it("leaves the skeleton flag off when it is not set", () => {
        const { container } = renderKey("card")
        for (const slot of container.querySelectorAll("[data-skeleton]")) {
            expect(slot.getAttribute("data-skeleton")).toBe("false")
        }
    })

    it("renders one key's tree independently of another", () => {
        const { container } = renderKey("form-field")
        expect(renderedRoles(container)).toEqual(["heading", "field", "meta"])
        expect(container.firstElementChild?.getAttribute("data-roles")).toBe("heading field meta")
    })

    it("skips a role with no component instead of crashing the tree", () => {
        // TypeScript rejects this shape at every real call site - a missing role is a compile
        // error. The runtime path exists so a JavaScript caller degrades to a thinner tree
        // rather than taking the page down.
        const partial = { field: slotFor("field") } as unknown as TreeSlots<"content-row">
        const { container } = render(<Tree name="content-row" slots={partial} />)
        expect(renderedRoles(container)).toEqual(["field"])
        expect(container.firstElementChild?.getAttribute("data-roles")).toBe("field action")
    })

    it("renders the host element the key declares, so a landmark is the registry's decision", () => {
        // `shell-nav` declares element: "nav". The point is not that a <nav> appears - it is
        // that NOBODY WROTE ONE. An author reaching for the tag by hand would be deciding
        // structure the registry is meant to own, and the lint rightly refuses that.
        const { container } = render(
            <Tree name="shell-nav" slots={{ action: slotFor("action") }} />,
        )
        expect(container.firstElementChild?.tagName).toBe("NAV")
    })

    it("falls back to a neutral div when a key declares no element", () => {
        // Most nodes are not landmarks, and promoting every node to one would make the
        // landmark map useless to a screen reader. Absent means div, deliberately.
        const { container } = render(
            <Tree
                name="content-row"
                slots={{
                    field: slotFor("field"),
                    action: slotFor("action"),
                }}
            />,
        )
        expect(container.firstElementChild?.tagName).toBe("DIV")
    })

    it("accepts exactly the slots a key declares", () => {
        // Type-level assertion: the slots object is checked against the key's own roles, so
        // "field" and "action" here are not interchangeable with any other key's roles.
        const slots: TreeSlots<"content-row"> = {
            field: slotFor("field"),
            action: slotFor("action"),
        }
        const { container } = render(<Tree name="content-row" slots={slots} />)
        expect(renderedRoles(container)).toEqual(["field", "action"])
    })
})
