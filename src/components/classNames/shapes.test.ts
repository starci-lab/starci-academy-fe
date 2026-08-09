import { describe, expect, it } from "vitest"
import {
    CLASS_NAMES,
    TREE_KEY_CEILING,
    TREE_KEYS,
    treeRoles,
    treeSpec,
    type TreeKey,
    type TreeRolesOf,
    type TreeSlots,
} from "@/components/classNames/shapes"
import type { TreeRole } from "@/components/classNames/roles"
import { DASHBOARD_SECTION_CHAIN_NAMES } from "@/components/classNames/chains/dashboard"
import { SIGN_IN_COMPOSITION_CHAIN_NAMES } from "@/components/classNames/chains/auth"
import * as shapesModule from "@/components/classNames/shapes"
import * as dashboardChainModule from "@/components/classNames/chains/dashboard"
import * as authChainModule from "@/components/classNames/chains/auth"

/**
 * The registry is the only place a class string, a child contract or a layout reason is
 * allowed to live, so these are the tests that keep it worth trusting: the classes must be
 * real, the roles must be a genuine contract, and the reason must be a reason.
 *
 * Note the class-string checks below. ESLint reads `className="..."` literals, and the frame
 * passes `className={spec.classes}` - a value, invisible to those rules. Moving the classes
 * into the registry moved that enforcement here, so it is restated rather than lost.
 */

/**
 * The closed role vocabulary, mirrored at runtime so the union can actually be asserted.
 * `satisfies` is what keeps the mirror honest - the union stays the single source.
 */
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

/** Fractional Tailwind spacing (gap-1.5, p-2.5) is off the house scale. */
const FRACTIONAL_SPACING = /\b[a-z-]+-\d+\.5\b/

/** An arbitrary Tailwind value escapes the token system entirely. */
const ARBITRARY_VALUE = /\[[^\]]+\]/

describe("CLASS_NAMES registry", () => {
    it("exposes every key in declaration order", () => {
        expect(TREE_KEYS).toEqual(Object.keys(CLASS_NAMES))
        expect(TREE_KEYS.length).toBeGreaterThan(0)
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

    it("keeps treeRoles at the narrow role type of the key it was asked about", () => {
        // Type-level assertion: this is the read that lets the frame index `TreeSlots` without
        // a cast. Widening it back to the shared union is what used to cost a double cast.
        const roles: ReadonlyArray<TreeRolesOf<"split">> = treeRoles("split")
        expect([...roles]).toEqual(["body", "aside"])
    })

    it("derives the slot keys of a key from its declared roles", () => {
        // Type-level assertion: these two lines stop compiling the moment the registry entry
        // and the derived slots type drift apart.
        const contentRowRoles: Array<TreeRolesOf<"content-row">> = ["field", "action"]
        const contentRowSlotKeys: Array<keyof TreeSlots<"content-row">> = ["field", "action"]
        expect(contentRowSlotKeys).toEqual(contentRowRoles)
        expect([...treeSpec("content-row").roles]).toEqual(contentRowRoles)
    })

    it("accepts only registry keys as a key", () => {
        // Type-level assertion: an invented key is not a member of TreeKey.
        const known: Array<TreeKey> = ["page-shell", "card", "empty-state"]
        for (const key of known) {
            expect(TREE_KEYS).toContain(key)
        }
    })
})

/**
 * THE CEILING, AND WHAT IT DOES NOT COVER.
 *
 * These two tests are a pair and belong together. The first is the vocabulary ceiling that has
 * always guarded the shape layer. The second exists so the ceiling's ABSENCE from the chain
 * layer reads as a decision rather than as an oversight: a later reader who notices that shapes
 * are counted and chains are not must not "fix" the discrepancy by deleting either one.
 */
describe("the vocabulary ceiling", () => {
    it("keeps the SHAPE vocabulary small enough to stay learnable", () => {
        expect(TREE_KEYS.length).toBeLessThanOrEqual(TREE_KEY_CEILING)
    })

    it("does NOT apply to chains, which are one entry per real composition", () => {
        const chainNames = [...DASHBOARD_SECTION_CHAIN_NAMES, ...SIGN_IN_COMPOSITION_CHAIN_NAMES]
        // A chain entry names a composition that exists; the right number of them is however
        // many exist. Capping that would only push an author to reuse an entry that describes
        // something else, which is the drift the chain layer was added to prevent.
        expect(chainNames.length).toBeGreaterThan(0)
        expect(new Set(chainNames).size).toBe(chainNames.length)
        // The asymmetry, stated as something that can actually fail: the SHAPE module publishes
        // a ceiling and each CHAIN module publishes none. Deleting the shape ceiling breaks the
        // first assertion; adding a chain ceiling breaks the second, so either move has to be
        // argued here rather than made quietly to tidy up a discrepancy.
        expect(Object.keys(shapesModule)).toContain("TREE_KEY_CEILING")
        for (const chainModule of [dashboardChainModule, authChainModule]) {
            expect(Object.keys(chainModule).some((name) => name.includes("CEILING"))).toBe(false)
        }
    })
})
