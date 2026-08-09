import { Fragment } from "react"
import {
    treeRoles,
    treeSpec,
    type TreeKey,
    type TreeSlot,
    type TreeSlots,
} from "@/components/classNames"

/**
 * FRAME - `Tree`: the ONE frame that renders a registry entry. It takes a key from
 * `src/components/classNames/shapes.ts` and one component per role that key declares, and draws
 * the node plus its children in registry order.
 *
 * WHY THERE IS EXACTLY ONE OF THESE. The retired arrangement had a frame per shape - Stack,
 * Cluster, Split, PinnedTrack - each with its own props, so an author picked a frame, then a
 * token, then a gap, then decided whether a wrapper was needed. Four guesses per node. Here
 * the registry already holds all four answers, so a second frame would only be a second
 * place to disagree with it.
 *
 * WHAT THIS FRAME DOES NOT DO. It never inspects what a child IS - it only knows the ROLE
 * the registry named, which is why the frames tier is still allowed to host it. It owns no
 * class of its own either: every class on the rendered node comes from the registry entry,
 * so there is no seam here for a caller or a maintainer to quietly adjust.
 *
 * INSPECTABILITY. The node carries `data-node` (which key drew it), `data-roles` (the
 * contract it is holding its children to) and `data-explain` (why the node exists at all) -
 * the same idea as the retired `data-principle` / `data-explain` pair, except the reason now
 * belongs to the key rather than being retyped, and mistyped, at every call site.
 */

/** Props for {@link Tree}. */
export interface TreeProps<K extends TreeKey> {
    /**
     * The registry key. This is the ONLY layout decision an author makes: it fixes the
     * node's classes, the children it accepts and the order they render in.
     */
    name: K
    /**
     * One component per role the key declares, passed UNCALLED so this frame can render
     * each of them with `isLoading`. A missing, extra or unknown role does not compile -
     * see `TreeSlots`.
     */
    slots: TreeSlots<K>
    /**
     * Renders every slot in its resting state. Same meaning as everywhere else in the tree -
     * nothing to show YET, the first load, SWR's `isLoading` - never "a request is in flight";
     * see {@link TreeSlotsProps.isLoading}, which is the declaration this one is handed to.
     */
    isLoading?: boolean
}

/**
 * Render the tree a registry key describes. See the file header for why one frame covers
 * every key.
 *
 * @param props - {@link TreeProps}
 */
const Tree = <K extends TreeKey>({ name, slots, isLoading }: TreeProps<K>) => {
    const spec = treeSpec(name)
    // `slots` is a mapped type over THIS key's roles, so it can only be indexed by a role of
    // THIS key - which is exactly what `treeRoles` hands back, while `spec.roles` is widened
    // to the shared union and cannot. Reading the order from the narrow list is what lets the
    // lookup below type-check; it used to be a double cast, which silenced the one check that
    // makes a wrong tree impossible.
    const roles = treeRoles(name)
    // The host element is the KEY's decision, never the caller's. A landmark is a structural
    // fact about the node, so it belongs in the registry beside the classes and the roles;
    // absent means the neutral `div`. Without this, a landmark could only be reached by writing
    // `<nav>` by hand - which the registry exists to forbid.
    const Host = spec.element ?? "div"
    return (
        <Host
            data-tier="frame"
            data-component="Tree"
            data-node={name}
            data-roles={spec.roles.join(" ")}
            data-explain={spec.explain}
            className={spec.classes}
        >
            {roles.map((role) => {
                // Annotated rather than inferred: `TreeSlots<K>[TreeRolesOf<K>]` is deferred
                // while `K` is generic, and JSX cannot check props against a type it has not
                // resolved. Every value of the mapped type IS a `TreeSlot`, so naming that is
                // a widening the compiler verifies - not an assertion that skips it.
                const Slot: TreeSlot | undefined = slots[role]
                if (!Slot) return null
                // The node inside a slot belongs to whoever passed it, so it gets no wrapper
                // and no badge of its own - a wrapper here would be a node the registry never
                // described, and every one of them is a seam nobody owns.
                return (
                    <Fragment key={role}>
                        <Slot isLoading={isLoading} />
                    </Fragment>
                )
            })}
        </Host>
    )
}

export { Tree }

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "frame", name: "Tree" } as const
