import { useSyncExternalStore } from "react"

/**
 * The one place a signed-in viewer's access token lives.
 *
 * WHY A MODULE STORE AND NOT REACT STATE. The token has two readers that cannot both be
 * components: the overlay, which re-renders when it changes, and the transport, which has to
 * read it from inside a link at send time with no hook available. A store solves both - the
 * link calls {@link getSessionToken}, the overlay subscribes through {@link useSessionToken},
 * and there is still exactly one value.
 *
 * WHY IT IS NOT PERSISTED. Nothing here writes to `localStorage`, on purpose: a bearer token
 * in web storage is readable by any script that ends up on the page, and persistence is a
 * decision about how long a session may outlive a tab - which belongs to whoever owns the
 * refresh path, not to the screen that happens to obtain the token first.
 *
 * THE SEAM THIS EXISTS FOR. `src/modules/api/graphql/clients/links/bearer.ts` currently reads
 * a development token from the environment. Its own JSDoc says the fix is to swap `getToken`
 * for a session getter; {@link getSessionToken} is that getter, and wiring it is a one-line
 * change in a file this module deliberately does not reach into.
 */

/** The token, or `undefined` while nobody is signed in. Module-scoped: one per page. */
let sessionToken: string | undefined

/** Everyone currently re-rendering on a change of token. */
const listeners = new Set<() => void>()

/**
 * Read the current token. Safe to call from anywhere, including outside React - this is the
 * function the bearer link is meant to be handed.
 */
export const getSessionToken = (): string | undefined => sessionToken

/**
 * Replace the current token and wake every subscriber.
 *
 * Passing `undefined` is how a sign-out is spelled; it is the same operation as signing in,
 * because a store with a separate `clear` grows a second code path that forgets to notify.
 *
 * @param token - The new access token, or `undefined` to end the session.
 */
export const setSessionToken = (token?: string): void => {
    if (sessionToken === token) return
    sessionToken = token
    for (const listener of listeners) listener()
}

/**
 * Subscribe to token changes. Returns the unsubscribe function `useSyncExternalStore` wants.
 *
 * @param listener - Called after every change of token.
 */
export const subscribeToSessionToken = (listener: () => void): (() => void) => {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

/**
 * Read the token as React state.
 *
 * The server snapshot is the same getter rather than a fixed `undefined`: this store is only
 * ever written in the browser, so the two snapshots agree by construction and there is no
 * hydration mismatch to paper over.
 */
export const useSessionToken = (): string | undefined =>
    useSyncExternalStore(subscribeToSessionToken, getSessionToken, getSessionToken)
