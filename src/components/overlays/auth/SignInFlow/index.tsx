"use client"

import { AuthenticationPanel } from "@/components/blocks/auth/AuthenticationPanel"

/**
 * OVERLAY - `SignInFlow`, FOLDED IN. See `./component.tsx` for the whole story; this half is the
 * connected name, and it is an alias for the same reason.
 *
 * The sign-in chain in `src/components/contracts/chains/auth.ts` pins the body of both
 * compositions as `ComponentType<SignInFlowConnectedProps>`, and its twin test asserts that both
 * surfaces hang the SAME component. They do: this name and `AuthenticationPanel` are one function
 * object, so "one flow on both surfaces rather than a copy each" is true in the strongest sense
 * available - there is only one thing to hang.
 */

/**
 * The props the sign-in chain expects of whatever body hangs inside a sign-in surface.
 *
 * `AuthenticationPanelConnectedProps` satisfies it: the panel takes the same completion callback,
 * plus a title-line slot that is optional, so it is assignable wherever this type is asked for.
 */
export interface SignInFlowConnectedProps {
    /** Called once the access token is stored, so a surface can close or route away. */
    onSignedIn?: () => void
}

/**
 * The authentication panel, under the name the sign-in chain still uses for it. Identical by
 * reference - not a wrapper, not a re-render, the same component.
 */
export const SignInFlow = AuthenticationPanel
