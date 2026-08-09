import type { ComponentType } from "react"
import type { SignInFlowConnectedProps } from "@/components/overlays/auth/SignInFlow"
import type { SignInOverlayProps } from "@/components/overlays/auth/SignInOverlay/component"
import type { AuthenticationPageProps } from "@/components/pages/AuthenticationPage/component"

/**
 * CHAINS - sign-in.
 *
 * Two surfaces run the same sign-in, and the shape keys cannot tell them apart: both draw a
 * `section` whose `body` is "a component that takes `isLoading`". That is true of every
 * component in the tree, so the shape layer permits an arrangement nobody meant. A chain
 * names the composition and pins the components it is actually made of.
 *
 * WHAT IS REALLY HERE, AND NOTHING ELSE. There are exactly two sign-in compositions in this
 * repository: the floating one (`SignInOverlay`, a real `<dialog>` summoned from a shell) and
 * the routed one (`AuthenticationPage`, reached by bookmark or redirect when there is no shell
 * to summon anything). Both hang the SAME connected flow inside, which is the point of the
 * pair rather than an oversight - the flow is written once and the surface around it is the
 * only difference.
 *
 * WHAT LEVEL A CATCHES HERE, AND WHAT IT DOES NOT. A slot typed `ComponentType<XxxProps>` is
 * satisfied by any component whose props the composition's props can be assigned to. That
 * refuses every component that could not actually be rendered in the position - the case worth
 * refusing - but it does NOT refuse one whose props happen to be a strict superset. Concretely:
 * `_SignInOverlay` cannot stand in for `sign-in-page` (it needs `isOpen` and `onDismiss`, which
 * the page never passes), while `_AuthenticationPage` would technically be accepted as the
 * overlay's surface, because it asks for strictly less. Closing that last gap needs a nominal
 * brand, and a brand is applied with an `as` assertion - provenance asserted rather than
 * derived, which is exactly what `starci-fe/no-double-cast` was added to end. The residual
 * looseness is recorded here rather than paid for in casts.
 */

/**
 * The sign-in compositions, each pinned to the surface it is drawn on and the body that hangs
 * inside it.
 *
 * One entry per composition, naming both halves together, because the two facts are one fact:
 * a surface and the thing it wraps are what makes a composition, and splitting them into two
 * chains would let them drift into disagreeing about which arrangement exists.
 */
export type SignInCompositionChain =
    /**
     * The floating sign-in: a real `<dialog>` with a title line, a close control, and the flow
     * beneath it.
     *
     * The surface is `_SignInOverlay` because this composition is the only one that owns a WAY
     * OUT - `SignInOverlayProps` is the only props type here carrying `isOpen` and `onDismiss`,
     * and a surface without them cannot honour Escape, the close control and the open flag
     * ending at one callback. The body is the connected `SignInFlow` rather than its
     * presentational half, because the overlay resolves no copy and runs no request of its own.
     */
    | {
        name: "sign-in-overlay"
        surface: ComponentType<SignInOverlayProps>
        body: ComponentType<SignInFlowConnectedProps>
    }
    /**
     * The routed sign-in: the same flow with no dialog around it, for a reader who arrived
     * without an application shell to summon one from.
     *
     * The surface is `_AuthenticationPage` because a page that is already the whole screen has
     * nothing to float above and no way out to own - `AuthenticationPageProps` takes a title and
     * a body slot and deliberately nothing else. The body is the same connected `SignInFlow`,
     * which is the fact this entry exists to hold: the routed surface must never grow a second,
     * separately maintained copy of the flow.
     */
    | {
        name: "sign-in-page"
        surface: ComponentType<AuthenticationPageProps>
        body: ComponentType<SignInFlowConnectedProps>
    }

/**
 * Exhaustive over {@link SignInCompositionChain}: a member added to the union without a key
 * here stops compiling, so the runtime list below can never fall behind the type.
 */
const SIGN_IN_COMPOSITION_CHAIN_PRESENT: Record<SignInCompositionChain["name"], true> = {
    "sign-in-overlay": true,
    "sign-in-page": true,
}

/**
 * Every sign-in chain name, for gates and tests that walk the chains rather than restating
 * them. Deliberately NOT held to the shape ceiling - a chain layer counts compositions, and
 * there are as many as there are.
 */
export const SIGN_IN_COMPOSITION_CHAIN_NAMES = Object.keys(
    SIGN_IN_COMPOSITION_CHAIN_PRESENT,
) as ReadonlyArray<SignInCompositionChain["name"]>
