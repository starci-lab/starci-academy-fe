import { useSessionToken } from "./useSessionToken"

/**
 * WHO A CACHED ANSWER BELONGS TO - the missing half of every viewer-scoped key.
 *
 * THE BUG THIS EXISTS TO KILL, in two directions. A hook keyed on a constant string caches an
 * answer that is ONLY true for one viewer, under a key that does not mention them:
 *
 *   1. signing in changes nothing, because the key did not change - so a reader who has just
 *      signed in keeps reading the refusal fetched a second before they did, until they reload
 *      the page. This was reproduced on the dashboard: the standing rail said "sign in to see
 *      this" while the same query answered fine over the wire.
 *   2. signing OUT changes nothing either, which is the worse half - the next viewer on that tab
 *      reads the previous viewer's figures out of the cache, and they look entirely plausible.
 *
 * Both stop being possible once the viewer is IN the key: a change of token is a change of key,
 * and SWR treats a new key as an unfetched one.
 *
 * WHY A FINGERPRINT AND NOT THE TOKEN. The key is not secret storage - it is handed to devtools,
 * to any cache inspector, and to whatever logs a key on a failure. A bearer token there is the
 * same mistake as one in web storage. The fingerprint is not a security boundary and is not
 * claimed to be one; it is only a stable, non-reversible way to say "a different viewer".
 *
 * A TOKEN REFRESH ALSO CHANGES IT, and that is left alone deliberately. Refetching once when a
 * token is renewed costs one request; the alternative is decoding the token here to find a subject
 * claim, which puts this file in the business of parsing credentials to save a round trip.
 */

/** What a viewer-scoped hook puts in its key. `undefined` means nobody is signed in. */
export type ViewerKey = string | undefined

/**
 * Fold a token down to a short stable string.
 *
 * djb2, chosen because it is four lines and has no dependency - NOT because it is strong. Nothing
 * here relies on it being hard to invert; it only has to differ when the token differs.
 *
 * @param token - The bearer token to fingerprint.
 */
const fingerprint = (token: string): string => {
    let hash = 5381
    for (let index = 0; index < token.length; index += 1) {
        hash = ((hash << 5) + hash + token.charCodeAt(index)) | 0
    }
    return (hash >>> 0).toString(36)
}

/**
 * Read who is asking, as a cache key fragment.
 *
 * Returns `undefined` when nobody is signed in, which is what lets a caller pass `null` as its SWR
 * key and NOT FETCH AT ALL. That matters more than it looks: an auth-gated query fired without a
 * token does not fail once, it fails forever - SWR retries a rejected key on a backoff and reports
 * `isLoading` again each time, which is how a signed-out dashboard ends up shimmering at somebody
 * who is not waiting for anything.
 */
export const useViewerKey = (): ViewerKey => {
    const token = useSessionToken()
    return token === undefined ? undefined : fingerprint(token)
}
