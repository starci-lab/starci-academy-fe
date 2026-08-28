"use client"

import { useLocale, useTranslations } from "next-intl"
import { useAuthPanel } from "@/hooks/auth/useAuthPanel"
import type { AuthFailure } from "@/hooks/auth/useAuthPanel"
import { AuthenticationPanelBase, type AuthMode } from "./component"

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
 * THE SERVER'S OWN MESSAGE OUTRANKS OURS whenever it is already reader-facing. Stable domain
 * refusals still resolve through the locale catalogue: a Vietnamese journey must not leak an
 * English Keycloak boundary sentence just because the server classified it correctly.
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
/** What the authentication machine reports about the attempt in flight. */
type AuthPanelStatusView = {
    readonly isResending: boolean
    readonly isPending: boolean
    readonly step: string
    readonly sentCount: number
    readonly failure?: AuthFailure
}

/** One sentence about the attempt, and whether that sentence is a refusal. */
type AuthPanelStatus = { readonly message: string, readonly isError: boolean }

const toStatus = (t: Translate, panel: AuthPanelStatusView): AuthPanelStatus => {
    if (panel.failure) {
        // The transport case deliberately does NOT say the details or the code were wrong, because
        // nobody knows that - the request never got an answer.
        if (panel.failure.isTransport) return { message: t("status.transport"), isError: true }
        if (
            panel.failure.code === "KEYCLOAK_LOGIN_FAILED_EXCEPTION" ||
            panel.failure.message === "Invalid email or password."
        ) return { message: t("status.credentialsRefused"), isError: true }
        if (panel.failure.code === "USER_EMAIL_ALREADY_VERIFIED_EXCEPTION") {
            return { message: t("status.accountExists"), isError: true }
        }
        if (
            panel.failure.code === "CHALLENGE_OTP_MISMATCH_EXCEPTION" ||
            panel.failure.code === "SIGN_IN_OTP_MISMATCH_EXCEPTION" ||
            panel.failure.message === "Challenge OTP mismatch" ||
            panel.failure.message === "Sign in OTP mismatch"
        ) return { message: t("status.otpRefused"), isError: true }
        if (
            panel.failure.code === "CHALLENGE_OTP_NOT_FOUND_EXCEPTION" ||
            panel.failure.message === "Challenge not found"
        ) return { message: t("status.otpExpired"), isError: true }
        if (panel.failure.code === "RATE_LIMITED") {
            return {
                message: panel.failure.retryAfterSeconds
                    ? t("status.rateLimitedWithWait", { count: panel.failure.retryAfterSeconds })
                    : t("status.rateLimited"),
                isError: true,
            }
        }
        return { message: panel.failure.message ?? t("status.refused"), isError: true }
    }
    if (panel.isPending) {
        return { message: panel.step === "code" ? t("status.verifying") : t("status.sending"), isError: false }
    }
    if (panel.step === "done") return { message: t("status.signedIn"), isError: false }
    if (panel.step === "code") {
        return { message: panel.sentCount > 1 ? t("status.resent") : "", isError: false }
    }
    return { message: "", isError: false }
}

/** Props for {@link AuthenticationPanel}. */
export type AuthenticationPanelProps = {
    /** Journey selected by the control that opened this panel. */
    readonly initialMode?: AuthMode
    /** Step selected by the URL before client hydration. */
    readonly initialStep?: "details" | "code"
    /** Called once the access token is stored, so a surface can close or route away. */
    readonly onSignedIn?: () => void
}

/**
 * Run the panel and render it.
 *
 * @param props - {@link AuthenticationPanelProps}
 */
export const AuthenticationPanel = (props: AuthenticationPanelProps) => {
    const { initialMode = "signIn", initialStep = "details", onSignedIn } = props
    const t = useTranslations("auth")
    const locale = useLocale()
    const panel = useAuthPanel({ initialMode, initialStep, onSignedIn })
    const status = toStatus(t, panel)
    const mode = panel.mode

    /**
     * Copy every step carries. THE MODE IS THE MESSAGE PATH: the three journeys were three literal
     * objects once, so a sentence added to one and forgotten in the others was a diff nobody had to
     * reconcile. Now a missing key is a missing message.
     */
    const frame = {
        title: t(`${mode}.title`),
        statusMessage: status.message,
        isError: status.isError,
        isPending: panel.isPending,
        isResending: panel.isResending,
        subtitle: t(`${mode}.subtitle`),
    }

    const on = {
        submitDetails: panel.onSubmitDetails,
        submitCode: panel.onSubmitCode,
        resend: panel.onResend,
        changeMode: (next: AuthMode) => panel.onChangeMode(next),
        changeAgreedToTerms: panel.onChangeAgreedToTerms,
        changeRememberMe: panel.onChangeRememberMe,
        oauthPress: panel.onOauthPress,
    }

    if (panel.step === "done") {
        return (
            <AuthenticationPanelBase
                state="done"
                props={{ ...frame, doneTitle: t(`${mode}.doneTitle`), doneHint: t(`${mode}.doneHint`) }}
                on={on}
            />
        )
    }

    if (panel.step === "code") {
        return (
            <AuthenticationPanelBase
                state="code"
                props={{
                    ...frame,
                    title: t("shared.codeTitle"),
                    subtitle: t("shared.codeDescription"),
                    codeLabel: t("shared.codeLabel"),
                    // The hint names the address the code actually went to, because the commonest
                    // reason a code never arrives is that it went somewhere else.
                    codeHint: `${t("shared.codeHint", { email: panel.email ?? t("shared.yourEmail") })}${toExpiry(t, panel.expiresInSeconds)}`,
                    submitLabel: t(`${mode}.submitCode`),
                    resendLabel: t("shared.resend"),
                    useAnotherEmailLabel: t("shared.useAnotherEmail"),
                }}
                on={on}
            />
        )
    }

    return (
        <AuthenticationPanelBase
            state="details"
            props={{
                ...frame,
                mode,
                hasAgreedToTerms: panel.hasAgreedToTerms,
                rememberMe: panel.rememberMe,
                emailLabel: t("shared.emailLabel"),
                emailPlaceholder: t("shared.emailPlaceholder"),
                passwordPlaceholder: t("shared.passwordPlaceholder"),
                revealLabel: t("shared.revealPassword"),
                hideLabel: t("shared.hidePassword"),
                confirmPasswordLabel: t("signUp.confirmPasswordLabel"),
                confirmPasswordPlaceholder: t("signUp.confirmPasswordPlaceholder"),
                confirmPasswordMismatch: t("signUp.confirmPasswordMismatch"),
                orLabel: t("shared.or"),
                rememberMeLabel: t("shared.rememberMe"),
                forgotPassword: t("shared.forgotPassword"),
                promptQuestion: t(`${mode}.promptQuestion`),
                promptAction: t(`${mode}.promptAction`),
                passwordLabel: t(`${mode}.passwordLabel`),
                passwordHint: t(`${mode}.passwordHint`),
                submitLabel: t(`${mode}.submitDetails`),
                agreeToTerms: t("shared.agreeToTerms"),
                agreeToTermsPrefix: t("shared.agreeToTermsPrefix"),
                termsLabel: t("shared.termsLabel"),
                termsHref: `https://academy.starci.org/${locale}/terms`,
                andLabel: t("shared.andLabel"),
                privacyLabel: t("shared.privacyLabel"),
                privacyHref: `https://academy.starci.org/${locale}/privacy`,
                oauthGoogle: t("shared.oauthGoogle"),
                oauthGithub: t("shared.oauthGithub"),
            }}
            on={on}
        />
    )
}
