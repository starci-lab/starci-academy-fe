import type { ComponentType } from "react"

/**
 * THE ROLE VOCABULARY - the half of the registry that describes a child by what it DOES.
 *
 * Nothing in this file knows a single component. A role is the smallest thing a layout needs
 * to know about a child, and keeping it that small is what lets nine roles cover every key in
 * `./shapes.ts` instead of a key existing per children-combination.
 *
 * The complement - which CONCRETE component fills a named composition's slot - is the chain
 * layer in `./chains/`. The two are deliberately separate files because they have opposite
 * import rules: this one imports nothing but React's own type, and a chain may name a type
 * from any tier above it.
 */

/**
 * The closed set of child roles a registry key may ask for. A role says what a child DOES
 * in the tree, never which component it is.
 *
 * - `nav` - route-level navigation that stays put while the body changes.
 * - `heading` - the name of the thing; at most one per node.
 * - `meta` - secondary facts about the heading (count, timestamp, hint, unit).
 * - `media` - avatar, icon or thumbnail that identifies the row at a glance.
 * - `body` - the content the node exists to carry.
 * - `field` - something the reader types into or selects from.
 * - `action` - something the reader presses.
 * - `aside` - content that supports the body and may drop below it when narrow.
 * - `footer` - closing content of a bounded surface, below its body.
 */
export type TreeRole =
    | "nav"
    | "heading"
    | "meta"
    | "media"
    | "body"
    | "field"
    | "action"
    | "aside"
    | "footer"

/**
 * The props every slot component receives from the frame that mounts it. The frame owns the
 * loading state of the region, so it hands the flag down rather than asking the caller to
 * build two trees.
 *
 * `isLoading` IS THE ONE NAME FOR A REGION AT REST, declared here and threaded unchanged
 * through every frame, block and atom below it. One fact called two things is the drift this
 * registry exists to prevent: a tree that said `isSkeleton` in one file and spelled a
 * `"skeleton" | "empty" | "ready"` union in the next had two vocabularies for one flag, and
 * two vocabularies only ever diverge.
 */
export interface TreeSlotProps {
    /**
     * THERE IS NOTHING TO SHOW YET - the first load, no data in hand. This is exactly SWR's
     * `isLoading`, and the slot answers it by rendering its own resting shape.
     *
     * It does NOT mean "a request is in flight". SWR revalidates on focus, so routing
     * `isValidating` through here would flash a skeleton over data already on screen every
     * time the reader left the tab and came back.
     *
     * It does not mean "there is nothing to show, ever", either. A request that SETTLED with
     * nothing is an answer rather than a wait, and it belongs in a flag of its own - passed
     * as this one it would rest forever instead of saying so.
     */
    isLoading?: boolean
}

/**
 * A slot is passed UNCALLED - a component reference, never a built element - so the frame
 * can render it with `isLoading` and both states come from one source. Same contract as the
 * `ComponentTypeWithSkeleton` slot idiom the frames tier already uses.
 *
 * This is the WIDEST a slot can be typed: any component that accepts the resting flag. A
 * named composition that needs its slot narrowed to one concrete component says so in a
 * chain, which constrains the same position as `ComponentType<XxxProps>`.
 */
export type TreeSlot = ComponentType<TreeSlotProps>

/**
 * The host elements a registry key may render as - a closed set, so a key cannot reach for an
 * arbitrary tag. Everything here is either a landmark or the neutral default.
 */
export type TreeElement =
    | "div"
    | "nav"
    | "main"
    | "header"
    | "footer"
    | "aside"
    | "section"

/**
 * The shape of one registry entry: the node's own class string, the ordered contract for its
 * children, and the one sentence that says why the node exists.
 */
export interface TreeNodeSpec {
    /** The class string of the node itself. Not a prop, not reachable by a caller. */
    readonly classes: string
    /** The ordered child roles this node accepts - each role appears exactly once. */
    readonly roles: ReadonlyArray<TreeRole>
    /**
     * Why this node exists, in one sentence - emitted as `data-explain` so the reason is
     * readable exactly where the problem is being looked at. A reason, never a restatement
     * of the key: "row of chips" only repeats the key; "the tags wrap onto their own line
     * before the title does" is the fact that made the node exist.
     */
    readonly explain: string
    /**
     * The host element this node renders as. Omitted means `div`.
     *
     * A landmark is a structural decision, so the KEY owns it exactly the way the key already
     * owns the classes and the child roles - an author never picks the tag any more than they
     * pick the gap. Without this a landmark could only be reached by writing `<nav>` by hand,
     * which `no-structural-host-outside-registry-frame` rightly refuses: the registry would be
     * forcing the very violation it exists to prevent.
     */
    readonly element?: TreeElement
}
