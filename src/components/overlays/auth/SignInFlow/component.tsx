import { _AuthenticationPanel } from "@/components/blocks/auth/AuthenticationPanel/component"

/**
 * OVERLAY - `SignInFlow`, FOLDED IN. This file holds no implementation any more; it holds a NAME
 * that two files outside this folder still refer to.
 *
 * WHAT HAPPENED. This folder used to hold a second, smaller authentication flow: credentials, a
 * code, a confirmation - no way to open an account, no way to reset a password, no identity
 * providers. The panel ported from the live app does all of that AND the credentials step, so
 * keeping both would have been two implementations of one thing, diverging one screen at a time.
 * The implementation now lives in `src/components/blocks/auth/AuthenticationPanel`.
 *
 * WHY AN ALIAS AND NOT A DELETION. `src/components/contracts/chains/auth.ts` and its twin belong
 * to the registry, not to this folder, and they name both halves of the old flow. An alias is the
 * only fold that leaves NO second implementation behind: `_SignInFlow` and `_AuthenticationPanel`
 * are the same function object, so there is nothing here that can drift from the panel, because
 * there is nothing here at all.
 *
 * WHAT SHOULD HAPPEN NEXT. The chain should be repointed at the panel and this folder deleted.
 * That is the registry's change to make; this is what keeps the tree green until it does.
 */

/**
 * The presentational half of the authentication panel, under the name the sign-in chain still
 * uses for it. Identical by reference - not a wrapper, not a re-render, the same component.
 */
export const _SignInFlow = _AuthenticationPanel
