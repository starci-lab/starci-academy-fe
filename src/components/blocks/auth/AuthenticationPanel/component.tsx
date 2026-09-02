import { useEffect, useRef, useState, type FormEvent } from "react"
import { Input, OtpInput, Button } from "@starci/grammar/common"
import { Checkbox } from "@/components/leaves/Checkbox"
import { Divider } from "@starci/grammar/common"
import { ErrorMessage } from "@/components/leaves/ErrorMessage"
import { Heading } from "@starci/grammar/common"
import { Icon } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Text } from "@starci/grammar/common"
import { KeycloakIdentityProvider } from "@/modules/api/graphql/mutations/types/auth"
import { authenticationCodeFieldClassName, authenticationCodeLabelClassName, authenticationDoneClassName, authenticationFormClassName, authenticationHeaderClassName, authenticationOauthClassName, authenticationOptionsClassName, authenticationPanelClassName, authenticationSecondaryClassName } from "./classNames"
import { TextAction } from "@starci/grammar/common"


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
const RevealPasswordIcon = () => <Icon source={iconSourceFor("revealPassword", "chip")} role={"chip"} />
const HidePasswordIcon = () => <Icon source={iconSourceFor("hidePassword", "chip")} role={"chip"} />
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
                <Text size={"sm"} tone={"muted"} live={"polite"}>{props.props.statusMessage}</Text>
            )
    const header = (
        <>
            <span id={AUTHENTICATION_PANEL_TITLE_ID}>
                <Heading level={2}>{props.props.title}</Heading>
            </span>
            <Text size={"sm"} tone={"muted"}>{props.props.subtitle}</Text>
        </>
    )
    if (props.state === "done")
        return (
            <div className={authenticationPanelClassName}>
                <header className={authenticationHeaderClassName}>{header}</header>
                <div className={authenticationDoneClassName}>
                    <Heading level={3}>{props.props.doneTitle}</Heading>
                    <Text size={"sm"} tone={"muted"}>{props.props.doneHint}</Text>
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
                    <div className={authenticationCodeFieldClassName}>
                        <label htmlFor="authentication-code" className={authenticationCodeLabelClassName}>{props.props.codeLabel}</label>
                        <OtpInput
                            id="authentication-code"
                            name="otp"
                            disabled={isBusy}
                            describedBy="authentication-code-hint"
                            onChange={(value: string) => {
                                values.current.otp = value
                            }}
                        />
                        <Text id={"authentication-code-hint"} size={"xs"}>{props.props.codeHint}</Text>
                    </div>
                    {status}
                    <Button variant="primary" type="submit" isDisabled={isBusy} isPending={props.props.isPending}>{props.props.submitLabel}</Button>
                </form>
                <div className={authenticationSecondaryClassName}>
                    <TextAction size={"sm"} appearance="inline" isPending={props.props.isResending} isDisabled={isBusy} onPress={props.on?.resend}>{props.props.resendLabel}</TextAction>
                    <TextAction size={"sm"} appearance="inline" isDisabled={isBusy} onPress={() => props.on?.changeMode?.("signIn")}>{props.props.useAnotherEmailLabel}</TextAction>
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
                <Button variant="outline" isDisabled={isBusy} onPress={() =>
                    props.on?.oauthPress?.(KeycloakIdentityProvider.Google)}>{props.props.oauthGoogle}</Button>
                <Button variant="outline" isDisabled={isBusy} onPress={() =>
                    props.on?.oauthPress?.(KeycloakIdentityProvider.Github)}>{props.props.oauthGithub}</Button>
                <Divider label={props.props.orLabel} />
            </div>
            <form className={authenticationFormClassName} onSubmit={submit}>
                <Input
                    id="authentication-email"
                    name="email"
                    kind="email"
                    label={props.props.emailLabel}
                    placeholder={props.props.emailPlaceholder}
                    variant="secondary"
                    isDisabled={isBusy}
                    onValueChange={(value: string) => {
                        values.current.email = value
                    }}
                />
                <Input
                    id="authentication-password"
                    name="password"
                    kind={signUp || props.props.mode === "forgotPassword" ? "newPassword" : "password"}
                    label={props.props.passwordLabel}
                    placeholder={props.props.passwordPlaceholder}
                    hint={props.props.passwordHint || undefined}
                    revealLabel={props.props.revealLabel}
                    hideLabel={props.props.hideLabel}
                    revealIcon={RevealPasswordIcon}
                    hideIcon={HidePasswordIcon}
                    variant="secondary"
                    isDisabled={isBusy}
                    onValueChange={(value: string) => {
                        values.current.password = value
                    }}
                />
                {signUp ? (
                    <Input
                        id="authentication-confirm-password"
                        name="confirmPassword"
                        kind="newPassword"
                        label={props.props.confirmPasswordLabel}
                        placeholder={props.props.confirmPasswordPlaceholder}
                        errorMessage={mismatch ? props.props.confirmPasswordMismatch : undefined}
                        isError={mismatch}
                        revealLabel={props.props.revealLabel}
                        hideLabel={props.props.hideLabel}
                        revealIcon={RevealPasswordIcon}
                        hideIcon={HidePasswordIcon}
                        variant="secondary"
                        isDisabled={isBusy}
                        onValueChange={(value: string) => {
                            values.current.confirmPassword = value
                            if (mismatch) setMismatch(false)
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
                        <TextAction size={"sm"} appearance="inline" onPress={() => props.on?.changeMode?.("forgotPassword")}>{props.props.forgotPassword}</TextAction>
                    ) : null}
                </div>
                {status}
                <Button variant="primary" type="submit" isDisabled={isBusy || blocked} isPending={props.props.isPending}>{props.props.submitLabel}</Button>
            </form>
            <div className={authenticationSecondaryClassName}>
                <Text size={"sm"} tone={"muted"}>{props.props.promptQuestion}</Text>
                <TextAction size={"sm"} appearance="inline" onPress={() =>
                            props.on?.changeMode?.(
                                props.props.mode === "signIn" ? "signUp" : "signIn",
                            )}>{props.props.promptAction}</TextAction>
            </div>
        </div>
    )
}
