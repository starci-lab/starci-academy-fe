/**
 * THE NAMED REGISTRY - the front door.
 *
 * This folder was once the single file `src/components/classNames.tsx`. It was split first,
 * because it had grown two concepts that answer different questions and obey opposite import
 * rules, and RENAMED afterwards: `classNames` described what an entry was made of, which put
 * it one letter away from the vendor's `className` prop that this registry exists to make
 * unnecessary. `contracts` describes what an entry IS - a key, the classes it owns, and the
 * children it will accept.
 *
 * SHAPES - `./shapes.ts`, with the role vocabulary it is built from in `./roles.ts`.
 * The generic layer. A key owns a node's classes and the ordered ROLES its children fill, so
 * it constrains the SHAPE of a tree and nothing more. It names no component, which is exactly
 * what lets every tier use it. It is CAPPED at sixteen keys, because a vocabulary that keeps
 * growing stops being a vocabulary.
 *
 * CHAINS - `./chains/`.
 * The specific layer. A chain names ONE composition that really exists and pins the component
 * type filling each of its slots, so `name="identity-stats"` with the wrong body is a compile
 * error. A chain may name a type from any tier above it. It is NOT capped: one entry per real
 * composition is the right count, and a ceiling here would only push authors to reuse an entry
 * that does not describe what they are building.
 *
 * WHY BOTH. A shape says a `section` takes a `heading` and a `body`. It cannot say WHICH body,
 * so `section` is used at seven call sites with seven unrelated bodies and every one of them
 * type-checks. The chain is the complementary constraint, and the two are meant to be read
 * together: the shape decides what the tree looks like, the chain decides what is in it.
 *
 * ONE RULE GOVERNS THIS WHOLE FOLDER. Every import inside it is `import type`, enforced by
 * `starci-fe/contracts-type-imports-only`. A type import is erased, so a chain naming a block
 * costs nothing at runtime; a value import would invert the tier order and create a real module
 * cycle while the type checker stayed green - which is why it is made impossible rather than
 * merely discouraged.
 */

export type {
    ContractElement,
    ContractSpec,
    ContractRole,
    ContractSlot,
    ContractSlotProps,
} from "./roles"

export {
    CONTRACTS,
    CONTRACT_CEILING,
    CONTRACT_KEYS,
    contractRoles,
    contractSpec,
} from "./shapes"

export type {
    ContractKey,
    ContractRolesOf,
    ContractSlots,
} from "./shapes"

export { DASHBOARD_SECTION_CHAIN_NAMES } from "./chains/dashboard"

export type { DashboardSectionChain } from "./chains/dashboard"

export { SIGN_IN_COMPOSITION_CHAIN_NAMES } from "./chains/auth"

export type { SignInCompositionChain } from "./chains/auth"
