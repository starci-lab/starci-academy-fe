import { useCallback, useEffect, useRef, useState } from "react"
import { mutationSignInInit } from "@/modules/api/graphql/mutations/mutation-sign-in-init"
import { mutationSignInResendOtp } from "@/modules/api/graphql/mutations/mutation-sign-in-resend-otp"
import { mutationSignInVerifyOtp } from "@/modules/api/graphql/mutations/mutation-sign-in-verify-otp"
import { setSessionToken } from "./useSessionToken"

/**
 * The sign-in flow as one state machine, kept in one place.
 *
 * WHY A MACHINE AND NOT THREE MUTATION HOOKS. The three operations are not independent: the
 * code step is meaningless without the challenge the credentials step produced, and a resend
 * is meaningless without both. Three hooks would put that ordering in whichever component
 * happened to call them, which is exactly where an ordering rule cannot be enforced. Here the
 * step IS the state, so a code cannot be submitted before a challenge exists.
 *
 * WHY NO COPY LIVES HERE. This hook never produces a sentence. It surfaces the server's own
 * message and error code, plus one fact the server cannot know - whether the request reached
 * a verdict at all - and lets the connected component decide what a reader is told. A hook
 * that spelled its own apology would spell it in English and every other locale would lose it.
 *
 * WHY THE HANDLERS ARE STABLE. Each one reads the current state through a ref rather than
 * closing over it, so its identity never changes. That matters because the registry frame
 * mounts slots as components: a handler that changed identity between renders would either
 * remount the control it sits on, or be captured stale by a slot that did not remount.
 */

/** Where the reader is in the flow. */
export type SignInStep = "credentials" | "code" | "done"

/** What the credentials step submits. */
export interface SignInCredentials {
    /** The address the account was registered with. */
    email: string
    /** The account password. */
    password: string
}

/** What the code step submits. */
export interface SignInCode {
    /** The one-time code as the reader typed it. */
    otp: string
}

/**
 * Why the last attempt did not succeed.
 *
 * `isTransport` is the distinction nothing else can make: a refused code is a verdict the
 * server reached and described, while a timeout is no verdict at all. Telling a reader their
 * code was wrong when the request never arrived is the single worst thing this flow can do.
 */
export interface SignInFailure {
    /** The reader-facing sentence the server sent, when there was one. */
    message?: string
    /** The machine-readable code from the envelope, when the server sent one. */
    code?: string
    /** True when the request never reached a verdict - network, timeout or abort. */
    isTransport: boolean
}

/** What a caller may vary about the flow. */
export interface UseSignInFlowParams {
    /** Called once, after the access token has been stored, so a surface can close itself. */
    onSignedIn?: () => void
}

/** Everything a surface needs to draw the flow and move it forward. */
export interface SignInFlowState {
    /** Where the reader is. */
    step: SignInStep
    /** The address the challenge was opened for; absent until the credentials are accepted. */
    email?: string
    /** The open challenge, absent before the credentials step succeeds. */
    challengeId?: string
    /** How long the code sent most recently stays valid, as the server reported it. */
    expiresInSeconds?: number
    /** How many codes have been sent for the current challenge - 1 after init, 2 after one resend. */
    sentCount: number
    /** True while the credentials or the code are in flight. */
    isPending: boolean
    /** True while a resend is in flight. Separate, so the resend control can speak for itself. */
    isResending: boolean
    /** Why the last attempt failed, absent when nothing has failed since. */
    failure?: SignInFailure
    /** Submit the credentials and open a challenge. */
    onSubmitCredentials: (credentials: SignInCredentials) => void
    /** Submit the one-time code against the open challenge. */
    onSubmitCode: (code: SignInCode) => void
    /** Ask for a fresh code on the challenge already open. */
    onResend: () => void
}

/** The part of the machine that is genuinely stored, as opposed to derived or handed back. */
interface SignInFlowRecord {
    /** Where the reader is. */
    step: SignInStep
    /** The address the challenge was opened for. */
    email?: string
    /** The open challenge. */
    challengeId?: string
    /** Validity of the most recently sent code, in seconds. */
    expiresInSeconds?: number
    /** How many codes have been sent for the current challenge. */
    sentCount: number
    /** True while the credentials or the code are in flight. */
    isPending: boolean
    /** True while a resend is in flight. */
    isResending: boolean
    /** Why the last attempt failed. */
    failure?: SignInFailure
}

/** Nothing attempted yet. */
const INITIAL: SignInFlowRecord = {
    step: "credentials",
    sentCount: 0,
    isPending: false,
    isResending: false,
}

/** The failure a request that never reached the server produces. */
const TRANSPORT_FAILURE: SignInFailure = { isTransport: true }

/**
 * Turn a server envelope into a failure. Called only when `success` is false, so the absence
 * of a message here means the server refused without saying why - which the connected half
 * still has to be able to tell apart from a timeout.
 *
 * @param message - The envelope's reader-facing sentence.
 * @param code - The envelope's machine-readable error code.
 */
const toFailure = (message?: string, code?: string): SignInFailure => ({
    message,
    code,
    isTransport: false,
})

/**
 * Drive the two-step sign-in.
 *
 * @param params - {@link UseSignInFlowParams}
 */
export const useSignInFlow = ({ onSignedIn }: UseSignInFlowParams = {}): SignInFlowState => {
    const [record, setRecord] = useState<SignInFlowRecord>(INITIAL)

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
     * Apply a settled result, unless it belongs to a superseded attempt or the surface has
     * gone away.
     *
     * @param runId - The attempt this result belongs to.
     * @param next - The fields to merge into the record.
     */
    const settle = useCallback((runId: number, next: Partial<SignInFlowRecord>) => {
        if (runId !== runRef.current || !mountedRef.current) return
        setRecord((previous) => ({ ...previous, ...next }))
    }, [])

    const onSubmitCredentials = useCallback(({ email, password }: SignInCredentials) => {
        const runId = runRef.current + 1
        runRef.current = runId
        setRecord((previous) => ({ ...previous, isPending: true, failure: undefined }))
        void mutationSignInInit({ request: { email, password } })
            .then((result) => {
                const envelope = result.data?.signInInit
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

    const onSubmitCode = useCallback(({ otp }: SignInCode) => {
        const { challengeId } = recordRef.current
        // No challenge means no question this code could be an answer to. Refusing here is
        // what makes the step ordering a property of the machine rather than of a caller.
        if (!challengeId) return
        const runId = runRef.current + 1
        runRef.current = runId
        setRecord((previous) => ({ ...previous, isPending: true, failure: undefined }))
        void mutationSignInVerifyOtp({ request: { challengeId, otp } })
            .then((result) => {
                const envelope = result.data?.signInVerifyOtp
                if (!envelope?.success || !envelope.data) {
                    settle(runId, { isPending: false, failure: toFailure(envelope?.message, envelope?.error) })
                    return
                }
                // The token is stored BEFORE the step moves, so anything that renders on the
                // way to `done` already reads as signed in rather than briefly as a guest.
                setSessionToken(envelope.data.accessToken)
                settle(runId, { step: "done", isPending: false, failure: undefined })
                signedInRef.current?.()
            })
            .catch(() => {
                settle(runId, { isPending: false, failure: TRANSPORT_FAILURE })
            })
    }, [settle])

    const onResend = useCallback(() => {
        const { challengeId } = recordRef.current
        if (!challengeId) return
        const runId = runRef.current + 1
        runRef.current = runId
        setRecord((previous) => ({ ...previous, isResending: true, failure: undefined }))
        void mutationSignInResendOtp({ request: { challengeId } })
            .then((result) => {
                const envelope = result.data?.signInResendOtp
                if (!envelope?.success || !envelope.data) {
                    settle(runId, { isResending: false, failure: toFailure(envelope?.message, envelope?.error) })
                    return
                }
                settle(runId, {
                    expiresInSeconds: envelope.data.expiresInSeconds,
                    // The challenge id can be reissued by a resend, so it is read back rather
                    // than assumed unchanged - quoting a dead id is a refusal nobody can explain.
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

    return {
        ...record,
        onSubmitCredentials,
        onSubmitCode,
        onResend,
    }
}
