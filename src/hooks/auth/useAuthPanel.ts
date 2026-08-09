import { useCallback, useEffect, useRef, useState } from "react"
import { apiEnv } from "@/modules/api/env"
import { mutationExchangeCodeForToken } from "@/modules/api/graphql/mutations/mutation-exchange-code-for-token"
import { mutationForgotPasswordInit } from "@/modules/api/graphql/mutations/mutation-forgot-password-init"
import { mutationForgotPasswordResendOtp } from "@/modules/api/graphql/mutations/mutation-forgot-password-resend-otp"
import { mutationForgotPasswordVerifyOtp } from "@/modules/api/graphql/mutations/mutation-forgot-password-verify-otp"
import { mutationSignInInit } from "@/modules/api/graphql/mutations/mutation-sign-in-init"
import { mutationSignInResendOtp } from "@/modules/api/graphql/mutations/mutation-sign-in-resend-otp"
import { mutationSignInVerifyOtp } from "@/modules/api/graphql/mutations/mutation-sign-in-verify-otp"
import { mutationSignUpInit } from "@/modules/api/graphql/mutations/mutation-sign-up-init"
import { mutationSignUpResendOtp } from "@/modules/api/graphql/mutations/mutation-sign-up-resend-otp"
import { mutationSignUpVerifyOtp } from "@/modules/api/graphql/mutations/mutation-sign-up-verify-otp"
import { KeycloakIdentityProvider } from "@/modules/api/graphql/mutations/types/auth"
import type { GraphQLResponse } from "@/modules/api/graphql/types"
import type {
    SignInChallengeData,
    SignInSessionData,
} from "@/modules/api/graphql/mutations/types/auth"
import { setSessionToken } from "./useSessionToken"

/**
 * The WHOLE authentication panel as one state machine - three modes, two steps each, and the
 * OAuth hand-off, in one place.
 *
 * WHY ONE MACHINE AND NOT THREE HOOKS. Sign in, sign up and password reset are the same journey
 * with three endings: each opens a CHALLENGE, puts a code in the reader's inbox, and trades that
 * code for an access token. The only thing that differs is which pair of operations the two steps
 * run. Three hooks would repeat the ordering rule three times and let a reader switching from
 * "sign in" to "create an account" carry a half-answered challenge across with them; here the
 * mode is part of the state, so changing it is what resets the flow.
 *
 * WHY THE MODE DECIDES THE SECOND FIELD RATHER THAN A THIRD ONE EXISTING. The three init
 * operations were read off the running schema: `signInInit(email, password)`,
 * `signUpInit(email, password)` - its `username`, `firstName` and `lastName` are optional and this
 * form does not ask for them - and `forgotPasswordInit(email, newPassword)`. All three take an
 * address and one secret, so the form has two boxes in every mode and the mode only changes what
 * the second one is CALLED. A separate "new password" field would be a second control for a value
 * the server takes in the same position.
 *
 * WHY NO COPY LIVES HERE. This hook never produces a sentence. It surfaces the server's own
 * message and error code plus one fact the server cannot know - whether the request reached a
 * verdict at all - and lets the connected component decide what a reader is told.
 *
 * WHY THE HANDLERS ARE STABLE. Each one reads the current state through a ref rather than closing
 * over it, so its identity never changes. That matters because the registry frame mounts slots as
 * COMPONENTS: a handler that changed identity between renders would either remount the control it
 * sits on - throwing away what the reader had typed - or be captured stale by one that did not.
 */

/** Which of the three journeys the reader is on. */
export type AuthMode = "signIn" | "signUp" | "forgotPassword"

/** Where the reader is within the journey. */
export type AuthStep = "details" | "code" | "done"

/** What the first step submits, whatever the mode. */
export interface AuthDetails {
    /** The address the account is known by, and where the code is sent. */
    email: string
    /**
     * The one secret this step carries. Its MEANING is the mode's: the current password when
     * signing in, the password being chosen when signing up, the replacement when resetting.
     */
    password: string
}

/** What the second step submits. */
export interface AuthCode {
    /** The one-time code as the reader typed it. */
    otp: string
}

/**
 * Why the last attempt did not succeed.
 *
 * `isTransport` is the distinction nothing else can make: a refused code is a verdict the server
 * reached and described, while a timeout is no verdict at all. Telling a reader their code was
 * wrong when the request never arrived is the single worst thing this flow can do.
 */
export interface AuthFailure {
    /** The reader-facing sentence the server sent, when there was one. */
    message?: string
    /** The machine-readable code from the envelope, when the server sent one. */
    code?: string
    /** True when the request never reached a verdict - network, timeout or abort. */
    isTransport: boolean
}

/** What a caller may vary about the panel. */
export interface UseAuthPanelParams {
    /** Called once, after the access token has been stored, so a surface can close itself. */
    onSignedIn?: () => void
}

/** Everything a surface needs to draw the panel and move it forward. */
export interface AuthPanelState {
    /** Which journey the reader is on. */
    mode: AuthMode
    /** Where the reader is within it. */
    step: AuthStep
    /** The address the challenge was opened for; absent until the details are accepted. */
    email?: string
    /** The open challenge, absent before the details step succeeds. */
    challengeId?: string
    /** How long the code sent most recently stays valid, as the server reported it. */
    expiresInSeconds?: number
    /** How many codes have been sent for the current challenge - 1 after init, 2 after a resend. */
    sentCount: number
    /** Whether the reader has accepted the terms. Only ever gates the sign-up mode. */
    hasAgreedToTerms: boolean
    /** True while the details or the code are in flight. */
    isPending: boolean
    /** True while a resend is in flight. Separate, so the resend control can speak for itself. */
    isResending: boolean
    /** Why the last attempt failed, absent when nothing has failed since. */
    failure?: AuthFailure
    /** Submit the first step and open a challenge. */
    onSubmitDetails: (details: AuthDetails) => void
    /** Submit the one-time code against the open challenge. */
    onSubmitCode: (code: AuthCode) => void
    /** Ask for a fresh code on the challenge already open. */
    onResend: () => void
    /** Switch journeys. Anything in flight is abandoned and the flow starts again. */
    onChangeMode: (mode: AuthMode) => void
    /** Record whether the reader has accepted the terms. */
    onChangeAgreedToTerms: (agreed: boolean) => void
    /** Leave for the identity provider's own sign-in page. */
    onOauthPress: (provider: KeycloakIdentityProvider) => void
}

/** The part of the machine that is genuinely stored, as opposed to derived or handed back. */
interface AuthPanelRecord {
    /** Which journey the reader is on. */
    mode: AuthMode
    /** Where the reader is within it. */
    step: AuthStep
    /** The address the challenge was opened for. */
    email?: string
    /** The open challenge. */
    challengeId?: string
    /** Validity of the most recently sent code, in seconds. */
    expiresInSeconds?: number
    /** How many codes have been sent for the current challenge. */
    sentCount: number
    /** Whether the reader has accepted the terms. */
    hasAgreedToTerms: boolean
    /** True while the details or the code are in flight. */
    isPending: boolean
    /** True while a resend is in flight. */
    isResending: boolean
    /** Why the last attempt failed. */
    failure?: AuthFailure
}

/** A challenge envelope, whichever of the three init or resend operations produced it. */
type ChallengeEnvelope = GraphQLResponse<SignInChallengeData> | undefined

/** A session envelope, whichever of the three verify operations produced it. */
type SessionEnvelope = GraphQLResponse<SignInSessionData> | undefined

/**
 * Where the browser stores which provider it left for.
 *
 * The provider is not on the callback address - the code and the state are - so without this the
 * exchange would have to guess which identity provider issued the code it is holding, and a guess
 * here is a sign-in that fails with nothing to say.
 */
const OAUTH_PROVIDER_KEY = "starci.auth.oauth-provider"

/** Nothing attempted yet: the reader is signing in, at the first step. */
const INITIAL: AuthPanelRecord = {
    mode: "signIn",
    step: "details",
    sentCount: 0,
    hasAgreedToTerms: false,
    isPending: false,
    isResending: false,
}

/** The failure a request that never reached the server produces. */
const TRANSPORT_FAILURE: AuthFailure = { isTransport: true }

/**
 * Turn a server envelope into a failure. Called only when `success` is false, so the absence of a
 * message here means the server refused without saying why - which the connected half still has to
 * be able to tell apart from a timeout.
 *
 * @param message - The envelope's reader-facing sentence.
 * @param code - The envelope's machine-readable error code.
 */
const toFailure = (message?: string, code?: string): AuthFailure => ({
    message,
    code,
    isTransport: false,
})

/**
 * The first step of each journey, keyed by mode.
 *
 * The reset entry is the one worth reading twice: `forgotPasswordInit` takes the NEW password
 * before any code exists, which is the server's design and the reason this form does not ask for
 * one later. The code then authorises a change that has already been described.
 */
const INIT_BY_MODE: Record<AuthMode, (details: AuthDetails) => Promise<ChallengeEnvelope>> = {
    signIn: async ({ email, password }: AuthDetails) => {
        const result = await mutationSignInInit({ request: { email, password } })
        return result.data?.signInInit
    },
    signUp: async ({ email, password }: AuthDetails) => {
        const result = await mutationSignUpInit({ request: { email, password } })
        return result.data?.signUpInit
    },
    forgotPassword: async ({ email, password }: AuthDetails) => {
        const result = await mutationForgotPasswordInit({ request: { email, newPassword: password } })
        return result.data?.forgotPasswordInit
    },
}

/** The second step of each journey. All three end in an access token and nothing else. */
const VERIFY_BY_MODE: Record<AuthMode, (challengeId: string, otp: string) => Promise<SessionEnvelope>> = {
    signIn: async (challengeId: string, otp: string) => {
        const result = await mutationSignInVerifyOtp({ request: { challengeId, otp } })
        return result.data?.signInVerifyOtp
    },
    signUp: async (challengeId: string, otp: string) => {
        const result = await mutationSignUpVerifyOtp({ request: { challengeId, otp } })
        return result.data?.signUpVerifyOtp
    },
    forgotPassword: async (challengeId: string, otp: string) => {
        const result = await mutationForgotPasswordVerifyOtp({ request: { challengeId, otp } })
        return result.data?.forgotPasswordVerifyOtp
    },
}

/** Asking for a fresh code on a challenge already open. Never reopens one. */
const RESEND_BY_MODE: Record<AuthMode, (challengeId: string) => Promise<ChallengeEnvelope>> = {
    signIn: async (challengeId: string) => {
        const result = await mutationSignInResendOtp({ request: { challengeId } })
        return result.data?.signInResendOtp
    },
    signUp: async (challengeId: string) => {
        const result = await mutationSignUpResendOtp({ request: { challengeId } })
        return result.data?.signUpResendOtp
    },
    forgotPassword: async (challengeId: string) => {
        const result = await mutationForgotPasswordResendOtp({ request: { challengeId } })
        return result.data?.forgotPasswordResendOtp
    },
}

/**
 * Where the Keycloak hand-off for one provider begins.
 *
 * The origin is derived from the GraphQL endpoint rather than configured a second time: the two
 * are the same back end, and a second variable is a second thing that can be wrong. The address
 * the reader is standing on travels as `redirect_uri`, so the provider brings them back to the
 * surface they left rather than to a fixed page that has forgotten why they were there.
 *
 * @param provider - Which identity provider to hand off to.
 */
const toKeycloakRedirect = (provider: KeycloakIdentityProvider): string => {
    const api = new URL(apiEnv().graphql.url)
    const url = new URL(`/keycloak/${provider}/redirect`, api.origin)
    url.searchParams.set("redirect_uri", window.location.href)
    return url.toString()
}

/**
 * The provider stored before the hand-off, when the browser has one and will admit to it.
 *
 * Session storage throws in a few real browsers - private modes, storage disabled by policy - and
 * a sign-in that crashes because it could not remember something optional is worse than one that
 * simply cannot finish the exchange.
 */
const readStoredProvider = (): KeycloakIdentityProvider | undefined => {
    try {
        const stored = window.sessionStorage.getItem(OAUTH_PROVIDER_KEY)
        if (stored === KeycloakIdentityProvider.Google) return KeycloakIdentityProvider.Google
        if (stored === KeycloakIdentityProvider.Github) return KeycloakIdentityProvider.Github
        return undefined
    } catch {
        return undefined
    }
}

/**
 * Remember which provider the reader left for, or forget it once the exchange is over.
 *
 * @param provider - The provider to remember; `undefined` clears the hint.
 */
const writeStoredProvider = (provider?: KeycloakIdentityProvider): void => {
    try {
        if (provider === undefined) {
            window.sessionStorage.removeItem(OAUTH_PROVIDER_KEY)
            return
        }
        window.sessionStorage.setItem(OAUTH_PROVIDER_KEY, provider)
    } catch {
        // A browser that refuses storage still gets a working password sign-in; only the
        // provider hint is lost, and the exchange below says so rather than guessing.
    }
}

/**
 * Drive the whole authentication panel.
 *
 * @param params - {@link UseAuthPanelParams}
 */
export const useAuthPanel = ({ onSignedIn }: UseAuthPanelParams = {}): AuthPanelState => {
    const [record, setRecord] = useState<AuthPanelRecord>(INITIAL)

    // The handlers read the flow through these refs rather than closing over it, so their
    // identity is stable for the whole life of the surface. See the file header.
    const recordRef = useRef(record)
    recordRef.current = record

    const signedInRef = useRef(onSignedIn)
    signedInRef.current = onSignedIn

    // A response that arrives after a newer one was already sent must not overwrite it: the
    // reader has moved on, and the older answer describes a question nobody is asking now.
    const runRef = useRef(0)
    const mountedRef = useRef(true)

    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
        }
    }, [])

    /**
     * Apply a settled result, unless it belongs to a superseded attempt or the surface has gone
     * away.
     *
     * @param runId - The attempt this result belongs to.
     * @param next - The fields to merge into the record.
     */
    const settle = useCallback((runId: number, next: Partial<AuthPanelRecord>) => {
        if (runId !== runRef.current || !mountedRef.current) return
        setRecord((previous) => ({ ...previous, ...next }))
    }, [])

    /**
     * Store the token and move to the last step. The token is stored BEFORE the step moves, so
     * anything that renders on the way already reads as signed in rather than briefly as a guest.
     *
     * @param runId - The attempt this token belongs to.
     * @param accessToken - The bearer token the server issued.
     */
    const onSession = useCallback((runId: number, accessToken: string) => {
        setSessionToken(accessToken)
        settle(runId, { step: "done", isPending: false, failure: undefined })
        signedInRef.current?.()
    }, [settle])

    // The last leg of an OAuth sign-in. The provider brings the reader back to this surface with
    // a code and the state that left with them; both have to be traded for a token of ours, and
    // a hand-off the reader cancelled comes back as `?error=` with no code at all.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const failed = params.get("error")
        const code = params.get("code")
        const state = params.get("state")
        const provider = readStoredProvider()
        if (failed) {
            writeStoredProvider(undefined)
            setRecord((previous) => ({ ...previous, failure: toFailure(undefined, failed) }))
            return
        }
        if (!code || !state || !provider) return
        writeStoredProvider(undefined)
        const runId = runRef.current + 1
        runRef.current = runId
        setRecord((previous) => ({ ...previous, isPending: true, failure: undefined }))
        void mutationExchangeCodeForToken({ request: { code, provider, state } })
            .then((result) => {
                const envelope = result.data?.exchangeCodeForToken
                if (!envelope?.success || !envelope.data) {
                    settle(runId, { isPending: false, failure: toFailure(envelope?.message, envelope?.error) })
                    return
                }
                onSession(runId, envelope.data.accessToken)
            })
            .catch(() => {
                settle(runId, { isPending: false, failure: TRANSPORT_FAILURE })
            })
    }, [settle, onSession])

    const onSubmitDetails = useCallback(({ email, password }: AuthDetails) => {
        const { mode } = recordRef.current
        const runId = runRef.current + 1
        runRef.current = runId
        setRecord((previous) => ({ ...previous, isPending: true, failure: undefined }))
        void INIT_BY_MODE[mode]({ email, password })
            .then((envelope) => {
                if (!envelope?.success || !envelope.data) {
                    settle(runId, { isPending: false, failure: toFailure(envelope?.message, envelope?.error) })
                    return
                }
                settle(runId, {
                    step: "code",
                    email,
                    challengeId: envelope.data.challengeId,
                    expiresInSeconds: envelope.data.expiresInSeconds,
                    sentCount: 1,
                    isPending: false,
                    failure: undefined,
                })
            })
            .catch(() => {
                settle(runId, { isPending: false, failure: TRANSPORT_FAILURE })
            })
    }, [settle])

    const onSubmitCode = useCallback(({ otp }: AuthCode) => {
        const { mode, challengeId } = recordRef.current
        // No challenge means no question this code could be an answer to. Refusing here is what
        // makes the step ordering a property of the machine rather than of a caller.
        if (!challengeId) return
        const runId = runRef.current + 1
        runRef.current = runId
        setRecord((previous) => ({ ...previous, isPending: true, failure: undefined }))
        void VERIFY_BY_MODE[mode](challengeId, otp)
            .then((envelope) => {
                if (!envelope?.success || !envelope.data) {
                    settle(runId, { isPending: false, failure: toFailure(envelope?.message, envelope?.error) })
                    return
                }
                onSession(runId, envelope.data.accessToken)
            })
            .catch(() => {
                settle(runId, { isPending: false, failure: TRANSPORT_FAILURE })
            })
    }, [settle, onSession])

    const onResend = useCallback(() => {
        const { mode, challengeId } = recordRef.current
        if (!challengeId) return
        const runId = runRef.current + 1
        runRef.current = runId
        setRecord((previous) => ({ ...previous, isResending: true, failure: undefined }))
        void RESEND_BY_MODE[mode](challengeId)
            .then((envelope) => {
                if (!envelope?.success || !envelope.data) {
                    settle(runId, { isResending: false, failure: toFailure(envelope?.message, envelope?.error) })
                    return
                }
                settle(runId, {
                    expiresInSeconds: envelope.data.expiresInSeconds,
                    // The challenge id can be reissued by a resend, so it is read back rather than
                    // assumed unchanged - quoting a dead id is a refusal nobody can explain.
                    challengeId: envelope.data.challengeId,
                    sentCount: recordRef.current.sentCount + 1,
                    isResending: false,
                    failure: undefined,
                })
            })
            .catch(() => {
                settle(runId, { isResending: false, failure: TRANSPORT_FAILURE })
            })
    }, [settle])

    const onChangeMode = useCallback((mode: AuthMode) => {
        // Bumping the run id abandons anything in flight: an answer to the journey the reader has
        // just left must not land on the one they have just started.
        runRef.current += 1
        setRecord({ ...INITIAL, mode })
    }, [])

    const onChangeAgreedToTerms = useCallback((agreed: boolean) => {
        setRecord((previous) => ({ ...previous, hasAgreedToTerms: agreed }))
    }, [])

    const onOauthPress = useCallback((provider: KeycloakIdentityProvider) => {
        writeStoredProvider(provider)
        window.location.assign(toKeycloakRedirect(provider))
    }, [])

    return {
        ...record,
        onSubmitDetails,
        onSubmitCode,
        onResend,
        onChangeMode,
        onChangeAgreedToTerms,
        onOauthPress,
    }
}
