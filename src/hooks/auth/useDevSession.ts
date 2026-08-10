import { useCallback, useState } from "react"
import { setSessionToken } from "./useSessionToken"

/**
 * The client half of the test-account door.
 *
 * WHY THE FLAG IS SEPARATE FROM THE CREDENTIALS, and why only the flag is public. Whether the
 * control is drawn is a fact the browser must know; what the account is, is not. So a single
 * `NEXT_PUBLIC_DEV_TEST_ACCOUNT` boolean crosses into the bundle and the address and password stay
 * in the server process behind `/api/dev-session`. Reading the flag tells an attacker the route
 * might answer; it tells them nothing they could sign in with, and the route refuses in production
 * whatever the flag says.
 *
 * WHY IT ENDS IN THE SAME STORE AS A REAL SIGN-IN. The token goes to {@link setSessionToken}, the
 * one place the bearer link reads. That is what makes this worth having: every screen it opens is
 * driven by the real transport, the real guard and the real data, so a bug it finds is a bug a
 * signed-in reader would have hit. A second, parallel notion of "signed in" would prove nothing
 * about the first.
 */

/** Why the last attempt did not produce a token. */
export type DevSessionFailure =
    /** The route answered, and refused - it is off, or the identity provider would not grant. */
    | "refused"
    /** The request never reached a verdict: the dev server is down, or the fetch was aborted. */
    | "transport"

/** What a surface needs to offer the door and report on it. */
export interface DevSessionState {
    /** Whether to draw the control at all. False in production and whenever it is unconfigured. */
    isAvailable: boolean
    /** True while a token is being fetched. */
    isPending: boolean
    /** Why the last attempt failed, absent when nothing has failed since. */
    failure?: DevSessionFailure
    /** Sign in as the seeded test account. */
    onPress: () => void
}

/** What a caller may vary. */
export interface UseDevSessionParams {
    /** Called once, after the token has been stored, so a surface can close itself. */
    onSignedIn?: () => void
}

/** The one public fact: whether the door is configured at all. Written out in full - Next inlines it. */
const IS_AVAILABLE = process.env.NEXT_PUBLIC_DEV_TEST_ACCOUNT === "true"

/** The shape the route hands back. Declared here so a wrong answer is a type error, not a crash. */
interface DevSessionPayload {
    /** The bearer token. */
    accessToken?: string
}

/**
 * Offer the test-account door.
 *
 * @param params - {@link UseDevSessionParams}
 */
export const useDevSession = ({ onSignedIn }: UseDevSessionParams = {}): DevSessionState => {
    const [isPending, setIsPending] = useState(false)
    const [failure, setFailure] = useState<DevSessionFailure | undefined>(undefined)

    const onPress = useCallback(() => {
        setIsPending(true)
        setFailure(undefined)
        void fetch("/api/dev-session", { method: "POST" })
            .then(async (response) => {
                if (!response.ok) {
                    setFailure("refused")
                    setIsPending(false)
                    return
                }
                const payload = (await response.json()) as DevSessionPayload
                if (!payload.accessToken) {
                    setFailure("refused")
                    setIsPending(false)
                    return
                }
                // Stored BEFORE anything re-renders, so nothing on the way reads as a guest.
                setSessionToken(payload.accessToken)
                setIsPending(false)
                onSignedIn?.()
            })
            .catch(() => {
                setFailure("transport")
                setIsPending(false)
            })
    }, [onSignedIn])

    return { isAvailable: IS_AVAILABLE, isPending, failure, onPress }
}
