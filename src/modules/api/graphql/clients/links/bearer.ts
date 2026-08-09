import { ApolloLink } from "@apollo/client"
import { getSessionToken } from "@/hooks/auth/useSessionToken"
import { apiEnv } from "../../../env"

/**
 * BEARER TOKEN ATTACHMENT - the live session first, the environment only as a fallback.
 *
 * The sign-in flow stores the `accessToken` it receives from `signInVerifyOtp` in the session
 * store, so a signed-in viewer's requests carry that token. A token obtained but never attached
 * is the failure this ordering exists to prevent: the reader signs in, sees success, and every
 * subsequent query still goes out anonymous.
 *
 * `NEXT_PUBLIC_API_BEARER_TOKEN` remains as the fallback, which is what makes the authenticated
 * transport provable before anyone signs in. A `NEXT_PUBLIC_*` variable is readable by anyone
 * with the page open, so that value is a developer's own throwaway token, never a real user's.
 *
 * The dependency runs one way: the session store imports nothing from the API layer, so reading
 * it here cannot close a cycle.
 */
export interface CreateAttachBearerTokenLinkParams {
    /**
     * Where the token comes from. Defaults to the live session, falling back to the
     * environment; the seam stays so a test can supply a fixed one.
     */
    getToken?: () => string | undefined
    /** When true, logs whether a token was attached - never the token itself. */
    debug?: boolean
}

/**
 * Attaches `authorization: Bearer <token>` when a token is available, and does nothing at
 * all when one is not, so the same client serves a guest and a signed-in viewer.
 */
export const createAttachBearerTokenLink = ({
    getToken = () => getSessionToken() ?? apiEnv().bearerToken,
    debug = false,
}: CreateAttachBearerTokenLinkParams = {}) => new ApolloLink((operation, forward) => {
    const token = getToken()
    if (token) {
        operation.setContext((previous) => ({
            headers: {
                ...(previous.headers as Record<string, string> | undefined),
                authorization: `Bearer ${token}`,
            },
        }))
    }
    if (debug) {
        // The token is never logged; only whether one was found, which is the fact
        // an unexplained 401 actually needs.
        console.log(`[bearer] op=${operation.operationName ?? "anonymous"} attached=${Boolean(token)}`)
    }
    return forward(operation)
})
