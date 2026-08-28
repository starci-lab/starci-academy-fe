import { useEffect, useRef, useState, type FormEvent } from "react"
import { Button } from "@/components/leaves/Button"
import { Checkbox } from "@/components/leaves/Checkbox"
import { Divider } from "@/components/leaves/Divider"
import { ErrorMessage } from "@/components/leaves/ErrorMessage"
import { Field } from "@/components/composites/Field"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { TextLink } from "@/components/leaves/TextLink"
import { KeycloakIdentityProvider } from "@/modules/api/graphql/mutations/types/auth"
import { authenticationDoneClassName, authenticationFormClassName, authenticationHeaderClassName, authenticationOauthClassName, authenticationOptionsClassName, authenticationPanelClassName, authenticationSecondaryClassName } from "./classNames"

/** Auth journey selected by the reader. */
export type AuthMode = "signIn" | "signUp" | "forgotPassword";
/** Credentials submitted at the first authentication step. */
export type AuthDetails = { readonly email: string; readonly password: string };
/** One-time code submitted from the reader's inbox. */
export type AuthCode = { readonly otp: string };
/** Shared title, status, and request state for the panel. */
export type AuthPanelFrame = {
  readonly title: string;
  readonly subtitle: string;
  readonly statusMessage: string;
  readonly isError: boolean;
  readonly isPending: boolean;
  /** Whether the code resend action is in flight. */
  readonly isResending?: boolean;
};
/** Localized labels for credential and account-creation controls. */
export type AuthDetailsCopy = {
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly passwordLabel: string;
  readonly passwordPlaceholder: string;
  readonly passwordHint: string;
  readonly revealLabel: string;
  readonly hideLabel: string;
  readonly confirmPasswordLabel: string;
  readonly confirmPasswordPlaceholder: string;
  readonly confirmPasswordMismatch: string;
  readonly submitLabel: string;
  readonly orLabel: string;
  readonly oauthGoogle: string;
  readonly oauthGithub: string;
  readonly rememberMeLabel: string;
  readonly forgotPassword: string;
  readonly agreeToTerms: string;
  readonly agreeToTermsPrefix: string;
  readonly termsLabel: string;
  readonly termsHref: string;
  readonly andLabel: string;
  readonly privacyLabel: string;
  readonly privacyHref: string;
  readonly promptQuestion: string;
  readonly promptAction: string;
};
/** Localized labels for code verification controls. */
export type AuthCodeCopy = {
  readonly codeLabel: string;
  readonly codeHint: string;
  readonly submitLabel: string;
  readonly resendLabel: string;
  readonly useAnotherEmailLabel: string;
};
/** Localized labels for the completion state. */
export type AuthDoneCopy = {
  readonly doneTitle: string;
  readonly doneHint: string;
};
/** Discriminated presentational state for the authentication panel. */
export type AuthenticationPanelProps = (
  | {
      readonly state: "details";
      readonly props: AuthPanelFrame &
        AuthDetailsCopy & {
          readonly mode: AuthMode;
          readonly hasAgreedToTerms: boolean;
          readonly rememberMe: boolean;
        };
    }
  | { readonly state: "code"; readonly props: AuthPanelFrame & AuthCodeCopy }
  | { readonly state: "done"; readonly props: AuthPanelFrame & AuthDoneCopy }
) & { readonly on?: AuthenticationPanelActions };
/** User actions emitted by authentication controls. */
export type AuthenticationPanelActions = {
  readonly submitDetails?: (details: AuthDetails) => void;
  readonly submitCode?: (code: AuthCode) => void;
  readonly resend?: () => void;
  readonly changeMode?: (mode: AuthMode) => void;
  readonly changeAgreedToTerms?: (agreed: boolean) => void;
  readonly changeRememberMe?: (remember: boolean) => void;
  readonly oauthPress?: (provider: KeycloakIdentityProvider) => void;
};
/** Stable heading id used to name the authentication surface. */
export const AUTHENTICATION_PANEL_TITLE_ID = "authentication-panel-title"
const EMPTY_VALUES = { email: "", password: "", confirmPassword: "", otp: "" }
/** Render the authentication journey from resolved state and callbacks. */
export const AuthenticationPanelBase = (props: AuthenticationPanelProps) => {
    const values = useRef({ ...EMPTY_VALUES })
    const [mismatch, setMismatch] = useState(false)
    // A server-rendered form has no React submit handler yet. Keeping its secret-bearing controls
    // disabled until hydration prevents the browser's native GET fallback from placing an email,
    // password or OTP in the URL when a reader acts before JavaScript attaches.
    const [isHydrated, setIsHydrated] = useState(false)
    useEffect(() => setIsHydrated(true), [])
    const status = props.props.statusMessage === ""
        || ((props.props.isPending || props.props.isResending === true) && !props.props.isError)
        ? null
        : props.props.isError
            ? <ErrorMessage props={{ content: props.props.statusMessage }} />
            : (
                <Text
                    props={{
                        content: props.props.statusMessage,
                        tone: "muted",
                        size: "sm",
                        live: "polite",
                    }}
                />
            )
    const header = (
        <>
            <span id={AUTHENTICATION_PANEL_TITLE_ID}>
                <Heading props={{ content: props.props.title, level: 2 }} />
            </span>
            <Text
                props={{ content: props.props.subtitle, size: "sm", tone: "muted" }}
            />
        </>
    )
    if (props.state === "done")
        return (
            <div className={authenticationPanelClassName}>
                <header className={authenticationHeaderClassName}>{header}</header>
                <div className={authenticationDoneClassName}>
                    <Heading props={{ content: props.props.doneTitle, level: 3 }} />
                    <Text
                        props={{ content: props.props.doneHint, tone: "muted", size: "sm" }}
                    />
                    {status}
                </div>
            </div>
        )
    if (props.state === "code") {
        const isBusy = !isHydrated || props.props.isPending || props.props.isResending === true
        const submit = (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            props.on?.submitCode?.({ otp: values.current.otp })
        }
        return (
            <div className={authenticationPanelClassName}>
                <header className={authenticationHeaderClassName}>{header}</header>
                <form className={authenticationFormClassName} onSubmit={submit}>
                    <Field
                        props={{
                            id: "authentication-code",
                            name: "otp",
                            kind: "code",
                            label: props.props.codeLabel,
                            labelVisibility: "screenReader",
                            hint: props.props.codeHint,
                            disabled: isBusy,
                        }}
                        on={{
                            change: (value: string) => {
                                values.current.otp = value
                            },
                        }}
                    />
                    {status}
                    <Button
                        props={{
                            label: props.props.submitLabel,
                            variant: "primary",
                            type: "submit",
                            disabled: isBusy,
                            isPending: props.props.isPending,
                        }}
                    />
                </form>
                <div className={authenticationSecondaryClassName}>
                    <TextLink
                        props={{
                            label: props.props.resendLabel,
                            size: "sm",
                            disabled: isBusy,
                            isPending: props.props.isResending,
                        }}
                        on={{ press: props.on?.resend }}
                    />
                    <TextLink
                        props={{ label: props.props.useAnotherEmailLabel, size: "sm", disabled: isBusy }}
                        on={{ press: () => props.on?.changeMode?.("signIn") }}
                    />
                </div>
            </div>
        )
    }
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (
            props.props.mode === "signUp" &&
      values.current.password !== values.current.confirmPassword
        ) {
            setMismatch(true)
            return
        }
        setMismatch(false)
        props.on?.submitDetails?.({
            email: values.current.email,
            password: values.current.password,
        })
    }
    const signUp = props.props.mode === "signUp"
    const signIn = props.props.mode === "signIn"
    const blocked = signUp && !props.props.hasAgreedToTerms
    const isBusy = !isHydrated || props.props.isPending
    return (
        <div className={authenticationPanelClassName}>
            <header className={authenticationHeaderClassName}>{header}</header>
            <div className={authenticationOauthClassName}>
                <Button
                    props={{
                        label: props.props.oauthGoogle,
                        variant: "outline",
                        icon: "google",
                        disabled: isBusy,
                    }}
                    on={{
                        press: () =>
                            props.on?.oauthPress?.(KeycloakIdentityProvider.Google),
                    }}
                />
                <Button
                    props={{
                        label: props.props.oauthGithub,
                        variant: "outline",
                        icon: "github",
                        disabled: isBusy,
                    }}
                    on={{
                        press: () =>
                            props.on?.oauthPress?.(KeycloakIdentityProvider.Github),
                    }}
                />
                <Divider props={{ label: props.props.orLabel }} />
            </div>
            <form className={authenticationFormClassName} onSubmit={submit}>
                <Field
                    props={{
                        id: "authentication-email",
                        name: "email",
                        kind: "email",
                        label: props.props.emailLabel,
                        placeholder: props.props.emailPlaceholder,
                        disabled: isBusy,
                    }}
                    on={{
                        change: (value: string) => {
                            values.current.email = value
                        },
                    }}
                />
                <Field
                    props={{
                        id: "authentication-password",
                        name: "password",
                        kind: signUp || props.props.mode === "forgotPassword" ? "newPassword" : "password",
                        label: props.props.passwordLabel,
                        placeholder: props.props.passwordPlaceholder,
                        hint: props.props.passwordHint || undefined,
                        revealLabel: props.props.revealLabel,
                        hideLabel: props.props.hideLabel,
                        disabled: isBusy,
                    }}
                    on={{
                        change: (value: string) => {
                            values.current.password = value
                        },
                    }}
                />
                {signUp ? (
                    <Field
                        props={{
                            id: "authentication-confirm-password",
                            name: "confirmPassword",
                            kind: "newPassword",
                            label: props.props.confirmPasswordLabel,
                            placeholder: props.props.confirmPasswordPlaceholder,
                            hint: mismatch ? props.props.confirmPasswordMismatch : undefined,
                            isInvalid: mismatch,
                            revealLabel: props.props.revealLabel,
                            hideLabel: props.props.hideLabel,
                            disabled: isBusy,
                        }}
                        on={{
                            change: (value: string) => {
                                values.current.confirmPassword = value
                                if (mismatch) setMismatch(false)
                            },
                        }}
                    />
                ) : null}
                <div className={authenticationOptionsClassName}>
                    {signUp ? (
                        <Checkbox
                            props={{
                                label: props.props.agreeToTerms,
                                labelParts: [
                                    {
                                        kind: "text",
                                        content: `${props.props.agreeToTermsPrefix} `,
                                    },
                                    {
                                        kind: "link",
                                        id: "terms",
                                        label: props.props.termsLabel,
                                        href: props.props.termsHref,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                    },
                                    { kind: "text", content: ` ${props.props.andLabel} ` },
                                    {
                                        kind: "link",
                                        id: "privacy",
                                        label: props.props.privacyLabel,
                                        href: props.props.privacyHref,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                    },
                                ],
                                isSelected: props.props.hasAgreedToTerms,
                            }}
                            on={{
                                change: props.on?.changeAgreedToTerms,
                            }}
                        />
                    ) : (
                        <Checkbox
                            props={{
                                label: props.props.rememberMeLabel,
                                isSelected: props.props.rememberMe,
                            }}
                            on={{ change: props.on?.changeRememberMe }}
                        />
                    )}
                    {signIn ? (
                        <TextLink
                            props={{ label: props.props.forgotPassword, size: "sm" }}
                            on={{ press: () => props.on?.changeMode?.("forgotPassword") }}
                        />
                    ) : null}
                </div>
                {status}
                <Button
                    props={{
                        label: props.props.submitLabel,
                        variant: "primary",
                        type: "submit",
                        disabled: isBusy || blocked,
                        isPending: props.props.isPending,
                    }}
                />
            </form>
            <div className={authenticationSecondaryClassName}>
                <Text
                    props={{
                        content: props.props.promptQuestion,
                        size: "sm",
                        tone: "muted",
                    }}
                />
                <TextLink
                    props={{ label: props.props.promptAction, size: "sm" }}
                    on={{
                        press: () =>
                            props.on?.changeMode?.(
                                props.props.mode === "signIn" ? "signUp" : "signIn",
                            ),
                    }}
                />
            </div>
        </div>
    )
}
