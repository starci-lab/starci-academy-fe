"use client"

import type { ReactNode } from "react"
import { useTranslations } from "next-intl"
import { useAuthPanel } from "@/hooks/auth/useAuthPanel"
import { useDevSession } from "@/hooks/auth/useDevSession"
import type { AuthFailure } from "@/hooks/auth/useAuthPanel"
import { _AuthenticationPanel, type AuthMode } from "./component"

/**
 * BLOCK - `AuthenticationPanel`, connected half.
 *
 * It runs the machine and resolves what came back into two things the other half can render: a
 * SENTENCE, and whether that sentence is a refusal. Two distinctions it owns that nothing
 * downstream can:
 *
 *   1. a refusal the server described versus a request that never reached a verdict. A timeout
 *      rendered as "that code was wrong" is a lie the reader cannot argue with;
 *   2. a code just sent versus one just RESENT. They look identical in the payload - only the send
 *      count tells them apart - and a reader who pressed resend and saw the original message has
 *      no way to know it worked.
 *
 * THE SERVER'S OWN MESSAGE OUTRANKS OURS whenever there is one: it is the only text that knows
 * which of several refusals actually happened.
 */

/** The `auth` message namespace, as this file uses it. */
type Translate = ReturnType<typeof useTranslations>

/**
 * How long the code lives, as a sentence, when the server told us.
 *
 * The minutes/seconds choice is arithmetic and stays here; the plural inside each unit belongs to
 * the catalogue, because how many forms a number takes is a fact about the language.
 *
 * @param t - The `auth` namespace.
 * @param expiresInSeconds - The server's own figure, when it sent one.
 */
const toExpiry = (t: Translate, expiresInSeconds?: number): string => {
    if (!expiresInSeconds || expiresInSeconds <= 0) return ""
    const minutes = Math.round(expiresInSeconds / 60)
    if (minutes < 1) return t("expiry.seconds", { count: expiresInSeconds })
    return t("expiry.minutes", { count: minutes })
}

/**
 * The one sentence that goes with whatever is happening, and whether it is a refusal.
 *
 * @param t - The `auth` namespace.
 * @param panel - What the machine reports.
 */
const toStatus = (
    t: Translate,
    panel: { isResending: boolean, isPending: boolean, step: string, sentCount: number, failure?: AuthFailure },
): { message: string, isError: boolean } => {
    if (panel.failure) {
        // The transport case deliberately does NOT say the details or the code were wrong, because
        // nobody knows that - the request never got an answer.
        if (panel.failure.isTransport) return { message: t("status.transport"), isError: true }
        return { message: panel.failure.message ?? t("status.refused"), isError: true }
    }
    if (panel.isResending) return { message: t("status.resending"), isError: false }
    if (panel.isPending) {
        return { message: panel.step === "code" ? t("status.verifying") : t("status.sending"), isError: false }
    }
    if (panel.step === "done") return { message: t("status.signedIn"), isError: false }
    if (panel.step === "code") {
        return { message: panel.sentCount > 1 ? t("status.resent") : t("status.sent"), isError: false }
    }
    return { message: "", isError: false }
}

/** Props for {@link AuthenticationPanel}. */
export type AuthenticationPanelConnectedProps = {
    /** Called once the access token is stored, so a surface can close or route away. */
    readonly onSignedIn?: () => void
    /** What the host surface hangs on the title line - a close control, or nothing. */
    readonly children?: ReactNode
}

/**
 * Run the panel and render it.
 *
 * @param input - {@link AuthenticationPanelConnectedProps}
 */
export const AuthenticationPanel = ({ onSignedIn, children }: AuthenticationPanelConnectedProps = {}) => {
    const t = useTranslations("auth")
    const panel = useAuthPanel({ onSignedIn })
    const dev = useDevSession({ onSignedIn })
    const status = toStatus(t, panel)
    const mode = panel.mode

    /**
     * Copy every step carries. THE MODE IS THE MESSAGE PATH: the three journeys were three literal
     * objects once, so a sentence added to one and forgotten in the others was a diff nobody had to
     * reconcile. Now a missing key is a missing message.
     */
    const frame = {
        title: t(`${mode}.title`),
        // The test-account door reports through the same one sentence as everything else, and
        // OUTRANKS the machine's while it has something to say: the reader pressed that control,
        // so its answer is the one they are waiting for.
        statusMessage: dev.failure ? t(`status.dev.${dev.failure}`) : status.message,
        isError: dev.failure !== undefined || status.isError,
        isPending: panel.isPending || dev.isPending,
        subtitle: t(`${mode}.subtitle`),
    }

    const on = {
        submitDetails: panel.onSubmitDetails,
        submitCode: panel.onSubmitCode,
        resend: panel.onResend,
        changeMode: (next: AuthMode) => panel.onChangeMode(next),
        changeAgreedToTerms: panel.onChangeAgreedToTerms,
        oauthPress: panel.onOauthPress,
        devSignInPress: dev.onPress,
    }

    if (panel.step === "done") {
        return (
            <_AuthenticationPanel
                state="done"
                props={{ ...frame, doneTitle: t(`${mode}.doneTitle`), doneHint: t(`${mode}.doneHint`) }}
                on={on}
            >
                {children}
            </_AuthenticationPanel>
        )
    }

    if (panel.step === "code") {
        return (
            <_AuthenticationPanel
                state="code"
                props={{
                    ...frame,
                    codeLabel: t("shared.codeLabel"),
                    codePlaceholder: t("shared.codePlaceholder"),
                    // The hint names the address the code actually went to, because the commonest
                    // reason a code never arrives is that it went somewhere else.
                    codeHint: `${t("shared.codeHint", { email: panel.email ?? t("shared.yourEmail") })}${toExpiry(t, panel.expiresInSeconds)}`,
                    submitLabel: t(`${mode}.submitCode`),
                    resendLabel: t("shared.resend"),
                    useAnotherEmailLabel: t("shared.useAnotherEmail"),
                }}
                on={on}
            >
                {children}
            </_AuthenticationPanel>
        )
    }

    return (
        <_AuthenticationPanel
            state="details"
            props={{
                ...frame,
                mode,
                hasAgreedToTerms: panel.hasAgreedToTerms,
                rememberMe: false,
                emailLabel: t("shared.emailLabel"),
                emailPlaceholder: t("shared.emailPlaceholder"),
                passwordPlaceholder: t("shared.passwordPlaceholder"),
                revealLabel: t("shared.revealPassword"),
                hideLabel: t("shared.hidePassword"),
                orLabel: t("shared.or"),
                rememberMeLabel: t("shared.rememberMe"),
                forgotPassword: t("shared.forgotPassword"),
                promptQuestion: t(`${mode}.promptQuestion`),
                promptAction: t(`${mode}.promptAction`),
                passwordLabel: t(`${mode}.passwordLabel`),
                passwordHint: t(`${mode}.passwordHint`),
                submitLabel: t(`${mode}.submitDetails`),
                agreeToTerms: t("shared.agreeToTerms"),
                oauthGoogle: t("shared.oauthGoogle"),
                oauthGithub: t("shared.oauthGithub"),
                // Absent, not false: the other half has no flag to read, so a production build
                // that stops passing this stops HAVING the control rather than hiding one.
                devSignInLabel: dev.isAvailable ? t("shared.devSignIn") : undefined,
            }}
            on={on}
        >
            {children}
        </_AuthenticationPanel>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "auth" } as const
