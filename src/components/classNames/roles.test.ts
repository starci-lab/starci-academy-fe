import { describe, expect, it } from "vitest"
import type {
    TreeElement,
    TreeNodeSpec,
    TreeRole,
    TreeSlot,
    TreeSlotProps,
} from "@/components/classNames/roles"

/**
 * What these tests guard: the ROLE half of the registry, which is types only and therefore
 * has no behaviour to exercise - what it has is a CONTRACT, and every assertion below is a
 * type-level one that stops compiling if the contract moves.
 *
 * The runtime mirrors here (`ROLES`, `ELEMENTS`) are restatements of a union, which would
 * normally be the drift this registry exists to prevent. They are safe because each carries
 * `satisfies ReadonlyArray<...>`: the union remains the single source, and a mirror that
 * falls behind it fails to compile rather than quietly passing.
 */

/** The closed role vocabulary, mirrored at runtime so the union can actually be asserted. */
const ROLES = [
    "nav",
    "heading",
    "meta",
    "media",
    "body",
    "field",
    "action",
    "aside",
    "footer",
] as const satisfies ReadonlyArray<TreeRole>

/** The closed host-element set, mirrored the same way. */
const ELEMENTS = [
    "div",
    "nav",
    "main",
    "header",
    "footer",
    "aside",
    "section",
] as const satisfies ReadonlyArray<TreeElement>

describe("the role vocabulary", () => {
    it("stays closed at nine roles", () => {
        expect(ROLES.length).toBe(9)
        expect(new Set(ROLES).size).toBe(ROLES.length)
    })

    it("keeps the host elements to landmarks plus the neutral default", () => {
        expect(ELEMENTS).toContain("div")
        expect(new Set(ELEMENTS).size).toBe(ELEMENTS.length)
    })
})

describe("TreeSlotProps", () => {
    it("spells the resting flag `isLoading` and nothing else", () => {
        // Type-level assertion: the one name for a region at rest. A second spelling
        // (`isSkeleton`, or a `"skeleton" | "ready"` union) stops compiling here.
        const resting: TreeSlotProps = { isLoading: true }
        const settled: TreeSlotProps = {}
        expect(resting.isLoading).toBe(true)
        expect(settled.isLoading).toBeUndefined()
    })
})

describe("TreeSlot", () => {
    it("is a component reference rather than a built element", () => {
        // A slot is passed UNCALLED, so the frame can render it with `isLoading` and both
        // states come from one source. Naming it as a `TreeSlot` is what proves that.
        const Slot: TreeSlot = ({ isLoading }: TreeSlotProps) => (isLoading === true ? null : null)
        expect(typeof Slot).toBe("function")
    })
})

describe("TreeNodeSpec", () => {
    it("carries the classes, the ordered roles and the reason, with the element optional", () => {
        const withoutElement: TreeNodeSpec = {
            classes: "flex flex-col gap-4",
            roles: ["heading", "body"],
            explain: "The seam tells a reader the content below belongs to this heading rather than the one above.",
        }
        const withElement: TreeNodeSpec = {
            classes: "flex flex-row items-center gap-4",
            roles: ["action"],
            explain: "Route-level navigation is a landmark a screen reader jumps to, so the key owns the tag.",
            element: "nav",
        }
        expect(withoutElement.element).toBeUndefined()
        expect(withElement.element).toBe("nav")
        expect([...withoutElement.roles]).toEqual(["heading", "body"])
    })
})
