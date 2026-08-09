/**
 * THE NAMED REGISTRY - the front door.
 *
 * This folder replaces the single `src/components/classNames.tsx`, and every import path that
 * pointed at that file still resolves here. Nothing was renamed; the file was split, because
 * it had grown two concepts that answer different questions and obey opposite import rules.
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
 * `starci-fe/classnames-type-imports-only`. A type import is erased, so a chain naming a block
 * costs nothing at runtime; a value import would invert the tier order and create a real module
 * cycle while the type checker stayed green - which is why it is made impossible rather than
 * merely discouraged.
 */

export type {
    TreeElement,
    TreeNodeSpec,
    TreeRole,
    TreeSlot,
    TreeSlotProps,
} from "./roles"

export {
    CLASS_NAMES,
    TREE_KEY_CEILING,
    TREE_KEYS,
    treeRoles,
    treeSpec,
} from "./shapes"

export type {
    TreeKey,
    TreeRolesOf,
    TreeSlots,
} from "./shapes"

export { DASHBOARD_SECTION_CHAIN_NAMES } from "./chains/dashboard"

export type { DashboardSectionChain } from "./chains/dashboard"

export { SIGN_IN_COMPOSITION_CHAIN_NAMES } from "./chains/auth"

export type { SignInCompositionChain } from "./chains/auth"
