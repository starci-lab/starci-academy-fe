"use client"

import { useAuthPanel } from "@/hooks/auth/useAuthPanel"
import type { AuthFailure, AuthMode } from "@/hooks/auth/useAuthPanel"
import {
    _AuthenticationPanel,
    type AuthenticationPanelLabels,
    type AuthenticationPanelMode,
    type AuthenticationPanelSlots,
    type AuthenticationPanelStatus,
    type AuthenticationPanelStep,
} from "./component"

/**
 * BLOCK - `AuthenticationPanel`, connected half.
 *
 * It runs the machine and turns what came back into two resolved things: a STATUS token and the
 * one sentence that goes with it. Both distinctions it makes are ones nothing downstream can:
 *
 *   1. a refusal the server described versus a request that never reached a verdict. A timeout
 *      rendered as "that code was wrong" is a lie the reader cannot argue with, so a transport
 *      failure gets its own sentence and never borrows the server's;
 *   2. a code that has just been sent versus one that has just been RESENT. The two look identical
 *      in the payload - only the send count tells them apart - and a reader who pressed resend and
 *      saw the original message has no way to know it worked.
 *
 * The server's own `message` is preferred over any copy here whenever there is one, because it is
 * the only text that knows which of several refusals actually happened.
 *
 * WHY THE COPY IS A MAP OVER THE MODE. The three journeys differ in what they CALL things far more
 * than in what they do - the same second box is "Password", "Choose a password" and "New password".
 * Holding that as one table per mode is what stops a fourth spelling appearing the next time the
 * sign-up copy is touched, and it is the shape the translation tier will take over unchanged.
 */

/** Everything the copy of one journey decides. */
interface AuthenticationPanelModeCopy {
    /** The name of the surface while this journey is on screen. */
    title: string
    /** Label of the primary action at the details step. */
    submitDetails: string
    /** Label of the primary action at the code step. */
    submitCode: string
    /** What the secret control is called in this journey. */
    passwordLabel: string
    /** What the reader needs to know about the secret in this journey. */
    passwordHint: string
    /** Title of the confirmation once the journey is over. */
    doneTitle: string
    /** What the reader may do now that it is over. */
    doneHint: string
}

/** The three journeys, spelled once each. It moves to the translation tier when that tier exists. */
const COPY_BY_MODE: Record<AuthenticationPanelMode, AuthenticationPanelModeCopy> = {
    signIn: {
        title: "Sign in",
        submitDetails: "Continue",
        submitCode: "Sign in",
        passwordLabel: "Password",
        passwordHint: "",
        doneTitle: "You are signed in",
        doneHint: "You can carry on where you were.",
    },
    signUp: {
        title: "Create an account",
        submitDetails: "Create account",
        submitCode: "Finish signing up",
        passwordLabel: "Choose a password",
        passwordHint: "This is the password you will sign in with from now on.",
        doneTitle: "Your account is ready",
        doneHint: "You are signed in and can start straight away.",
    },
    forgotPassword: {
        title: "Reset your password",
        submitDetails: "Send me a code",
        submitCode: "Change my password",
        passwordLabel: "New password",
        passwordHint: "The code in the next step is what authorises the change.",
        doneTitle: "Your password has changed",
        doneHint: "You are signed in with the new password.",
    },
}

/** Copy that is the same whichever journey the reader is on. */
const SHARED_LABELS = {
    emailLabel: "Email",
    emailHint: "",
    codeLabel: "One-time code",
    resend: "Send a new code",
    useAnotherEmail: "Use a different email",
    oauthGoogle: "Continue with Google",
    oauthGithub: "Continue with GitHub",
    agreeToTerms: "I agree to the terms of service and the privacy policy",
    switchToSignIn: "Sign in instead",
    switchToSignUp: "Create an account",
    switchToForgotPassword: "Forgot your password?",
}

/** The sentences this surface owns, used only where the server has none of its own. */
const MESSAGES = {
    /** Read while the details are on their way. */
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
     * Read when the request never reached a verdict. It deliberately does NOT say the details or
     * the code were wrong, because nobody knows that - the request never got an answer.
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

/** Everything needed to say which status the panel is in. */
interface AuthenticationPanelStatusInput {
    /** Where the reader is. */
    step: AuthenticationPanelStep
    /** True while the details or the code are in flight. */
    isPending: boolean
    /** True while a resend is in flight. */
    isResending: boolean
    /** How many codes have gone out for the current challenge. */
    sentCount: number
    /** Why the last attempt failed, when it did. */
    failure?: AuthFailure
}

/**
 * Resolve the one status token the presentational half renders from.
 *
 * The order of these tests is the design: a failure outranks everything, because a reader looking
 * at a refusal must not be told instead that a code was sent a moment ago.
 *
 * @param input - {@link AuthenticationPanelStatusInput}
 */
const toStatus = ({
    step,
    isPending,
    isResending,
    sentCount,
    failure,
}: AuthenticationPanelStatusInput): AuthenticationPanelStatus => {
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
 * @param status - The status the panel is in.
 * @param failure - Why the last attempt failed, when it did.
 */
const toStatusMessage = (status: AuthenticationPanelStatus, failure?: AuthFailure): string => {
    if (status !== "error") {
        return status === "idle" ? "" : MESSAGES[status]
    }
    if (failure?.isTransport) return MESSAGES.transport
    return failure?.message ?? MESSAGES.refused
}

/**
 * Props for {@link AuthenticationPanel}. Named apart from the presentational half's props on
 * purpose: the two halves take different things, and one name for both is how a caller ends up
 * passing resolved copy to the file whose whole job is to resolve it.
 */
export interface AuthenticationPanelConnectedProps {
    /** Called once the access token is stored, so a surface can close or route away. */
    onSignedIn?: () => void
    /** What the host surface hangs on the title line - a close control, or nothing at all. */
    slots?: AuthenticationPanelSlots
}

/** Nothing on the title line: the default, which is what the routed surface wants. */
const NO_SLOTS: AuthenticationPanelSlots = {}

/**
 * Run the authentication panel and render it.
 *
 * @param props - {@link AuthenticationPanelConnectedProps}
 */
export const AuthenticationPanel = ({
    onSignedIn,
    slots = NO_SLOTS,
}: AuthenticationPanelConnectedProps = {}) => {
    const panel = useAuthPanel({ onSignedIn })

    const status = toStatus({
        step: panel.step,
        isPending: panel.isPending,
        isResending: panel.isResending,
        sentCount: panel.sentCount,
        failure: panel.failure,
    })

    const copy = COPY_BY_MODE[panel.mode]

    const labels: AuthenticationPanelLabels = {
        ...SHARED_LABELS,
        title: copy.title,
        passwordLabel: copy.passwordLabel,
        passwordHint: copy.passwordHint,
        submit: panel.step === "code" ? copy.submitCode : copy.submitDetails,
        doneTitle: copy.doneTitle,
        doneHint: copy.doneHint,
        // The hint names the address the code actually went to, because the commonest reason a
        // code never arrives is that it went somewhere else.
        codeHint: `Sent to ${panel.email ?? "your email"}.${toExpiry(panel.expiresInSeconds)}`,
    }

    return (
        <_AuthenticationPanel
            mode={panel.mode}
            step={panel.step}
            status={status}
            statusMessage={toStatusMessage(status, panel.failure)}
            hasAgreedToTerms={panel.hasAgreedToTerms}
            labels={labels}
            slots={slots}
            onSubmitDetails={panel.onSubmitDetails}
            onSubmitCode={panel.onSubmitCode}
            onResend={panel.onResend}
            onChangeMode={panel.onChangeMode}
            onChangeAgreedToTerms={panel.onChangeAgreedToTerms}
            onOauthPress={panel.onOauthPress}
        />
    )
}

/**
 * The mode vocabulary, re-stated at the block's front door so a host never has to reach into the
 * hook for it. The two spellings are held identical by this assignment: a mode added to one and
 * not the other stops compiling here.
 */
export const AUTHENTICATION_PANEL_MODES: Record<AuthMode, AuthenticationPanelMode> = {
    signIn: "signIn",
    signUp: "signUp",
    forgotPassword: "forgotPassword",
}
