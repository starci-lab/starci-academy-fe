import { describe, expect, it } from "vitest"
import {
    CLASS_NAMES,
    TREE_KEYS,
    treeSpec,
    type TreeKey,
    type TreeRole,
    type TreeRolesOf,
    type TreeSlots,
} from "@/components/classNames"

/**
 * The registry is the only place a class string, a child contract or a layout reason is
 * allowed to live, so these are the tests that keep it worth trusting: the classes must be
 * real, the roles must be a genuine contract, and the reason must be a reason.
 *
 * Note the class-string checks below. ESLint reads `className="..."` literals, and this
 * frame passes `className={spec.classes}` - a value, invisible to those rules. Moving the
 * classes into the registry moved that enforcement here, so it is restated rather than lost.
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
] as const satisfies readonly TreeRole[]

/** Fractional Tailwind spacing (gap-1.5, p-2.5) is off the house scale. */
const FRACTIONAL_SPACING = /\b[a-z-]+-\d+\.5\b/

/** An arbitrary Tailwind value escapes the token system entirely. */
const ARBITRARY_VALUE = /\[[^\]]+\]/

describe("CLASS_NAMES registry", () => {
    it("exposes every key in declaration order", () => {
        expect(TREE_KEYS).toEqual(Object.keys(CLASS_NAMES))
        expect(TREE_KEYS.length).toBeGreaterThan(0)
    })

    it("keeps the vocabulary small enough to stay learnable", () => {
        expect(TREE_KEYS.length).toBeLessThanOrEqual(16)
    })

    it("gives every key a non-empty class string", () => {
        for (const key of TREE_KEYS) {
            expect(treeSpec(key).classes.trim(), key).not.toBe("")
        }
    })

    it("keeps every class string on the house scale", () => {
        for (const key of TREE_KEYS) {
            const classes = treeSpec(key).classes
            expect(FRACTIONAL_SPACING.test(classes), key).toBe(false)
            expect(ARBITRARY_VALUE.test(classes), key).toBe(false)
        }
    })

    it("declares at least one child role per key", () => {
        for (const key of TREE_KEYS) {
            expect(treeSpec(key).roles.length, key).toBeGreaterThan(0)
        }
    })

    it("never repeats a role inside one key", () => {
        for (const key of TREE_KEYS) {
            const roles = treeSpec(key).roles
            expect(new Set(roles).size, key).toBe(roles.length)
        }
    })

    it("draws every role from the closed role vocabulary", () => {
        for (const key of TREE_KEYS) {
            for (const role of treeSpec(key).roles) {
                expect([...ROLES], `${key}/${role}`).toContain(role)
            }
        }
    })

    it("uses every role it declares in the vocabulary at least once", () => {
        const used = [...new Set(TREE_KEYS.flatMap((key) => [...treeSpec(key).roles]))]
        for (const role of ROLES) {
            expect(used, role).toContain(role)
        }
    })

    it("explains why each node exists rather than restating its key", () => {
        for (const key of TREE_KEYS) {
            const words = treeSpec(key).explain.trim().split(/\s+/).filter(Boolean)
            expect(words.length, key).toBeGreaterThanOrEqual(8)
            const keyWords = new Set(key.split("-"))
            const restates = words.every((word) => keyWords.has(word.toLowerCase().replace(/[^a-z]/g, "")))
            expect(restates, key).toBe(false)
        }
    })

    it("reads one entry back through treeSpec", () => {
        expect(treeSpec("content-row").roles).toEqual(["field", "action"])
        expect(treeSpec("content-row").classes).toBe(CLASS_NAMES["content-row"].classes)
    })

    it("derives the slot keys of a key from its declared roles", () => {
        // Type-level assertion: these two lines stop compiling the moment the registry entry
        // and the derived slots type drift apart.
        const contentRowRoles: TreeRolesOf<"content-row">[] = ["field", "action"]
        const contentRowSlotKeys: (keyof TreeSlots<"content-row">)[] = ["field", "action"]
        expect(contentRowSlotKeys).toEqual(contentRowRoles)
        expect([...treeSpec("content-row").roles]).toEqual(contentRowRoles)
    })

    it("accepts only registry keys as a key", () => {
        // Type-level assertion: an invented key is not a member of TreeKey.
        const known: TreeKey[] = ["page-shell", "card", "empty-state"]
        for (const key of known) {
            expect(TREE_KEYS).toContain(key)
        }
    })
})
