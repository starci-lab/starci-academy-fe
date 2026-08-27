import { useRef, useState, type FormEvent } from "react"
import { Button } from "@/components/leaves/Button"
import { Checkbox } from "@/components/leaves/Checkbox"
import { Divider } from "@/components/leaves/Divider"
import { Field } from "@/components/composites/Field"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { TextLink } from "@/components/leaves/TextLink"
import { KeycloakIdentityProvider } from "@/modules/api/graphql/mutations/types/auth"

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
  readonly andLabel: string;
  readonly privacyLabel: string;
  readonly promptQuestion: string;
  readonly promptAction: string;
};
/** Localized labels for code verification controls. */
export type AuthCodeCopy = {
  readonly codeLabel: string;
  readonly codePlaceholder: string;
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
  readonly openLegal?: (kind: "terms" | "privacy") => void;
  readonly oauthPress?: (provider: KeycloakIdentityProvider) => void;
};
/** Stable heading id used to name the authentication surface. */
export const AUTHENTICATION_PANEL_TITLE_ID = "authentication-panel-title"
const EMPTY_VALUES = { email: "", password: "", confirmPassword: "", otp: "" }
/** Render the authentication journey from resolved state and callbacks. */
export const AuthenticationPanelBase = (props: AuthenticationPanelProps) => {
    const values = useRef({ ...EMPTY_VALUES })
    const [mismatch, setMismatch] = useState(false)
    const status =
    props.props.statusMessage === "" ? null : (
        <Text
            props={{
                content: props.props.statusMessage,
                tone: props.props.isError ? "default" : "muted",
                size: "sm",
                live: props.props.isError ? "assertive" : "polite",
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
            <div>
                <header>{header}</header>
                <Heading props={{ content: props.props.doneTitle, level: 3 }} />
                <Text
                    props={{ content: props.props.doneHint, tone: "muted", size: "sm" }}
                />
                {status}
            </div>
        )
    if (props.state === "code") {
        const submit = (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            props.on?.submitCode?.({ otp: values.current.otp })
        }
        return (
            <div>
                <header>{header}</header>
                <form onSubmit={submit}>
                    <Field
                        props={{
                            id: "authentication-code",
                            name: "otp",
                            kind: "code",
                            label: props.props.codeLabel,
                            placeholder: props.props.codePlaceholder,
                            hint: props.props.codeHint,
                            disabled: props.props.isPending,
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
                            disabled: props.props.isPending,
                            isPending: props.props.isPending,
                        }}
                    />
                </form>
                <TextLink
                    props={{ label: props.props.resendLabel, size: "sm" }}
                    on={{ press: props.on?.resend }}
                />
                <TextLink
                    props={{ label: props.props.useAnotherEmailLabel, size: "sm" }}
                    on={{ press: () => props.on?.changeMode?.("signIn") }}
                />
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
    const blocked = signUp && !props.props.hasAgreedToTerms
    return (
        <div>
            <header>{header}</header>
            <div>
                <Button
                    props={{
                        label: props.props.oauthGoogle,
                        variant: "outline",
                        icon: "google",
                        disabled: props.props.isPending,
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
                        disabled: props.props.isPending,
                    }}
                    on={{
                        press: () =>
                            props.on?.oauthPress?.(KeycloakIdentityProvider.Github),
                    }}
                />
                <Divider props={{ label: props.props.orLabel }} />
            </div>
            <form onSubmit={submit}>
                <Field
                    props={{
                        id: "authentication-email",
                        name: "email",
                        kind: "email",
                        label: props.props.emailLabel,
                        placeholder: props.props.emailPlaceholder,
                        disabled: props.props.isPending,
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
                        disabled: props.props.isPending,
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
                            disabled: props.props.isPending,
                        }}
                        on={{
                            change: (value: string) => {
                                values.current.confirmPassword = value
                                if (mismatch) setMismatch(false)
                            },
                        }}
                    />
                ) : null}
                <div>
                    {signUp ? (
                        <Checkbox
                            props={{
                                label: props.props.agreeToTerms,
                                labelParts: [
                                    {
                                        kind: "text",
                                        content: `${props.props.agreeToTermsPrefix} `,
                                    },
                                    { kind: "link", id: "terms", label: props.props.termsLabel },
                                    { kind: "text", content: ` ${props.props.andLabel} ` },
                                    {
                                        kind: "link",
                                        id: "privacy",
                                        label: props.props.privacyLabel,
                                    },
                                ],
                                isSelected: props.props.hasAgreedToTerms,
                            }}
                            on={{
                                change: props.on?.changeAgreedToTerms,
                                follow: (id: string) => {
                                    if (id === "terms" || id === "privacy") props.on?.openLegal?.(id)
                                },
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
                    )}{" "}
                    {!signUp && props.props.mode === "signIn" ? (
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
                        disabled: props.props.isPending || blocked,
                        isPending: props.props.isPending,
                    }}
                />
            </form>
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
    )
}
