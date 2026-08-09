import { describe, expect, it } from "vitest"
import * as registry from "@/components/classNames"
import * as roles from "@/components/classNames/roles"
import * as shapes from "@/components/classNames/shapes"
import * as dashboardChain from "@/components/classNames/chains/dashboard"
import * as authChain from "@/components/classNames/chains/auth"
import type {
    DashboardSectionChain,
    SignInCompositionChain,
    TreeElement,
    TreeKey,
    TreeNodeSpec,
    TreeRole,
    TreeRolesOf,
    TreeSlot,
    TreeSlotProps,
    TreeSlots,
} from "@/components/classNames"

/**
 * What these tests guard: the FRONT DOOR. This folder replaced a single file, and the whole
 * promise of that move is that no call site had to change - so the promise is tested rather
 * than assumed. Every name the tree imports from `@/components/classNames` is asserted here to
 * exist and to be the very same binding the split file exports, not a copy of it.
 *
 * The type re-exports are checked by the import above: under `isolatedModules` a type that the
 * index failed to forward would not resolve, and `tsc --noEmit` covers this file.
 */

/** Names imported from `@/components/classNames` by the tree as it stands. */
const IMPORTED_BY_THE_TREE = [
    "treeSpec",
    "treeRoles",
    "CLASS_NAMES",
    "TREE_KEYS",
] as const

describe("the registry front door", () => {
    it("still exports every runtime name the tree imports from it", () => {
        for (const name of IMPORTED_BY_THE_TREE) {
            expect(Object.keys(registry), name).toContain(name)
        }
    })

    it("forwards the shape layer as the same bindings, not copies", () => {
        expect(registry.CLASS_NAMES).toBe(shapes.CLASS_NAMES)
        expect(registry.TREE_KEYS).toBe(shapes.TREE_KEYS)
        expect(registry.TREE_KEY_CEILING).toBe(shapes.TREE_KEY_CEILING)
        expect(registry.treeSpec).toBe(shapes.treeSpec)
        expect(registry.treeRoles).toBe(shapes.treeRoles)
    })

    it("forwards the chain layer too, so both layers arrive by one path", () => {
        expect(registry.DASHBOARD_SECTION_CHAIN_NAMES).toBe(dashboardChain.DASHBOARD_SECTION_CHAIN_NAMES)
        expect(registry.SIGN_IN_COMPOSITION_CHAIN_NAMES).toBe(authChain.SIGN_IN_COMPOSITION_CHAIN_NAMES)
    })

    it("keeps the role layer type-only, with nothing to run", () => {
        // `roles.ts` declares a vocabulary and no behaviour, so it contributes no runtime
        // export. If a value ever appears there, this is where the decision gets made.
        expect(Object.keys(roles)).toEqual([])
    })

    it("re-exports every type the split modules declare", () => {
        // Type-level assertion: each name below resolves only if the index forwards it, and
        // each is annotated so an accidental `any` cannot stand in for a missing forward.
        const key: TreeKey = "section"
        const role: TreeRole = "body"
        const element: TreeElement = "section"
        const slotProps: TreeSlotProps = { isLoading: false }
        const slot: TreeSlot = () => null
        const slots: TreeSlots<"section"> = { heading: slot, body: slot }
        const rolesOf: TreeRolesOf<"section"> = "heading"
        const spec: TreeNodeSpec = registry.treeSpec("section")
        const dashboardEntry: DashboardSectionChain["name"] = "identity-stats"
        const signInEntry: SignInCompositionChain["name"] = "sign-in-page"

        expect(key).toBe("section")
        expect(role).toBe("body")
        expect(element).toBe("section")
        expect(slotProps.isLoading).toBe(false)
        expect(slots.heading).toBe(slot)
        expect(rolesOf).toBe("heading")
        expect(spec.roles).toEqual(["heading", "body"])
        expect(dashboardEntry).toBe("identity-stats")
        expect(signInEntry).toBe("sign-in-page")
    })
})
