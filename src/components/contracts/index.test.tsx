import { describe, expect, it } from "vitest"
import * as registry from "@/components/contracts"
import * as roles from "@/components/contracts/roles"
import * as shapes from "@/components/contracts/shapes"
import * as dashboardChain from "@/components/contracts/chains/dashboard"
import * as authChain from "@/components/contracts/chains/auth"
import type {
    DashboardSectionChain,
    SignInCompositionChain,
    ContractElement,
    ContractKey,
    ContractSpec,
    ContractRole,
    ContractRolesOf,
    ContractSlot,
    ContractSlotProps,
    ContractSlots,
} from "@/components/contracts"

/**
 * What these tests guard: the FRONT DOOR. This folder replaced a single file, and the whole
 * promise of that move is that no call site had to change - so the promise is tested rather
 * than assumed. Every name the tree imports from `@/components/contracts` is asserted here to
 * exist and to be the very same binding the split file exports, not a copy of it.
 *
 * The type re-exports are checked by the import above: under `isolatedModules` a type that the
 * index failed to forward would not resolve, and `tsc --noEmit` covers this file.
 */

/** Names imported from `@/components/contracts` by the tree as it stands. */
const IMPORTED_BY_THE_TREE = [
    "contractSpec",
    "contractRoles",
    "CONTRACTS",
    "CONTRACT_KEYS",
] as const

describe("the registry front door", () => {
    it("still exports every runtime name the tree imports from it", () => {
        for (const name of IMPORTED_BY_THE_TREE) {
            expect(Object.keys(registry), name).toContain(name)
        }
    })

    it("forwards the shape layer as the same bindings, not copies", () => {
        expect(registry.CONTRACTS).toBe(shapes.CONTRACTS)
        expect(registry.CONTRACT_KEYS).toBe(shapes.CONTRACT_KEYS)
        expect(registry.CONTRACT_CEILING).toBe(shapes.CONTRACT_CEILING)
        expect(registry.contractSpec).toBe(shapes.contractSpec)
        expect(registry.contractRoles).toBe(shapes.contractRoles)
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
        const key: ContractKey = "section"
        const role: ContractRole = "body"
        const element: ContractElement = "section"
        const slotProps: ContractSlotProps = { isLoading: false }
        const slot: ContractSlot = () => null
        const slots: ContractSlots<"section"> = { heading: slot, body: slot }
        const rolesOf: ContractRolesOf<"section"> = "heading"
        const spec: ContractSpec = registry.contractSpec("section")
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
