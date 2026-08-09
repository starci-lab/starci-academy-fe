"use client"

import { useSignInFlow } from "@/hooks/auth/useSignInFlow"
import type { SignInFailure } from "@/hooks/auth/useSignInFlow"
import {
    _SignInFlow,
    type SignInFlowLabels,
    type SignInFlowStatus,
    type SignInFlowStep,
} from "./component"

/**
 * OVERLAY - `SignInFlow`, connected half.
 *
 * It runs the flow and turns what came back into two resolved things: a STATUS token and the
 * one sentence that goes with it. Both distinctions it makes are ones nothing downstream can:
 *
 *   1. a refusal the server described versus a request that never reached a verdict. A
 *      timeout rendered as "that code was wrong" is a lie the reader cannot argue with, so a
 *      transport failure gets its own sentence and never borrows the server's;
 *   2. a code that has just been sent versus one that has just been RESENT. The two look
 *      identical in the payload - only the send count tells them apart - and a reader who
 *      pressed resend and saw the original message has no way to know it worked.
 *
 * The server's own `message` is preferred over any copy here whenever there is one, because
 * it is the only text that knows which of several refusals actually happened.
 *
 * This is also where the copy lives, in one object, so the translation tier has one file to
 * take it from when it lands.
 */

/** Copy that does not depend on anything the server said. */
const STATIC_LABELS = {
    emailLabel: "Email",
    emailHint: "",
    passwordLabel: "Password",
    passwordHint: "",
    codeLabel: "One-time code",
    submitCredentials: "Continue",
    submitCode: "Sign in",
    resend: "Send a new code",
    credentialsHint: "We will email you a one-time code before you are signed in.",
    signedInTitle: "You are signed in",
    signedInHint: "You can close this and carry on where you were.",
}

/** The sentences this surface owns, used only where the server has none of its own. */
const MESSAGES = {
    /** Read while the credentials are on their way. */
    sending: "Checking your details",
    /** Read once a code is on its way to the reader's inbox. */
    sent: "We sent a code to your email. Enter it below.",
    /** Read while the code is being checked. */
    verifying: "Checking your code",
    /** Read while a fresh code is being asked for. */
    resending: "Sending a new code",
    /** Read once a fresh code has gone out. */
    resent: "A new code is on its way. The one before it no longer works.",
    /** Read once the token is in hand. */
    signedIn: "Signed in",
    /**
     * Read when the request never reached a verdict. It deliberately does NOT say the
     * credentials or the code were wrong, because nobody knows that - the request never
     * got an answer.
     */
    transport: "We could not reach the server. Check your connection and try again.",
    /** Read when the server refused without saying why - rare, and still not silence. */
    refused: "That did not work. Please try again.",
}

/** How long the code lives, as a sentence, when the server told us. */
const toExpiry = (expiresInSeconds?: number): string => {
    if (!expiresInSeconds || expiresInSeconds <= 0) return ""
    const minutes = Math.round(expiresInSeconds / 60)
    if (minutes < 1) return ` It expires in ${expiresInSeconds} seconds.`
    return minutes === 1 ? " It expires in 1 minute." : ` It expires in ${minutes} minutes.`
}

/** Everything needed to say which status the flow is in. */
interface StatusInput {
    /** Where the reader is. */
    step: SignInFlowStep
    /** True while the credentials or the code are in flight. */
    isPending: boolean
    /** True while a resend is in flight. */
    isResending: boolean
    /** How many codes have gone out for the current challenge. */
    sentCount: number
    /** Why the last attempt failed, when it did. */
    failure?: SignInFailure
}

/**
 * Resolve the one status token the presentational half renders from.
 *
 * The order of these tests is the design: a failure outranks everything, because a reader
 * looking at a refusal must not be told instead that a code was sent a moment ago.
 *
 * @param input - {@link StatusInput}
 */
const toStatus = ({ step, isPending, isResending, sentCount, failure }: StatusInput): SignInFlowStatus => {
    if (isResending) return "resending"
    if (isPending) return step === "code" ? "verifying" : "sending"
    if (failure) return "error"
    if (step === "done") return "signedIn"
    if (step === "code") return sentCount > 1 ? "resent" : "sent"
    return "idle"
}

/**
 * Resolve the sentence that goes with a status.
 *
 * @param status - The status the flow is in.
 * @param failure - Why the last attempt failed, when it did.
 */
const toStatusMessage = (status: SignInFlowStatus, failure?: SignInFailure): string => {
    if (status !== "error") {
        return status === "idle" ? "" : MESSAGES[status]
    }
    if (failure?.isTransport) return MESSAGES.transport
    return failure?.message ?? MESSAGES.refused
}

/**
 * Props for {@link SignInFlow}. Named apart from the presentational half's props on purpose:
 * the two halves take different things, and one name for both is how a caller ends up passing
 * resolved copy to the file whose whole job is to resolve it.
 */
export interface SignInFlowConnectedProps {
    /** Called once the access token is stored, so a surface can close or route away. */
    onSignedIn?: () => void
}

/**
 * Run the sign-in flow and render it.
 *
 * @param props - {@link SignInFlowConnectedProps}
 */
export const SignInFlow = ({ onSignedIn }: SignInFlowConnectedProps = {}) => {
    const flow = useSignInFlow({ onSignedIn })

    const status = toStatus({
        step: flow.step,
        isPending: flow.isPending,
        isResending: flow.isResending,
        sentCount: flow.sentCount,
        failure: flow.failure,
    })

    const labels: SignInFlowLabels = {
        ...STATIC_LABELS,
        // The hint names the address the code actually went to, because the commonest reason
        // a code never arrives is that it went somewhere else.
        codeHint: `Sent to ${flow.email ?? "your email"}.${toExpiry(flow.expiresInSeconds)}`,
    }

    return (
        <_SignInFlow
            step={flow.step}
            status={status}
            statusMessage={toStatusMessage(status, flow.failure)}
            labels={labels}
            onSubmitCredentials={flow.onSubmitCredentials}
            onSubmitCode={flow.onSubmitCode}
            onResend={flow.onResend}
        />
    )
}
