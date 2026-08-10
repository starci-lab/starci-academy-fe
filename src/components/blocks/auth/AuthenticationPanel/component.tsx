import { useRef, type FormEvent, type ReactNode } from "react"
import { Tree } from "@/components/branches/Tree"
import { Button } from "@/components/leaves/Button"
import { Checkbox } from "@/components/leaves/Checkbox"
import { Divider } from "@/components/leaves/Divider"
import { Field } from "@/components/leaves/Field"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { TextLink } from "@/components/leaves/TextLink"
import { KeycloakIdentityProvider } from "@/modules/api/graphql/mutations/types/auth"

/**
 * BLOCK - `AuthenticationPanel`, presentational half.
 *
 * THE STEP IS THE STATE, and the status is not. `details`, `code` and `done` each draw a different
 * tree - a form of two boxes, a form of one, a confirmation - so they are states. `sending`,
 * `verifying` and `resending` draw the SAME tree with a disabled control and a different sentence,
 * so they are props. If it selects a different tree it is a state; otherwise it is props.
 *
 * THE ORDER IS THE DESIGN, and it is not arbitrary. The shortcuts come FIRST because most readers
 * take one and never reach the form; the divider names the choice between them rather than merely
 * separating them; the form follows for the rest; and the way to the other journey is the last
 * line, phrased as a question and its answer rather than as a row of equal buttons - which is what
 * makes one of them read as the main action and the rest as alternatives.
 *
 * THE VALUES ARE UNCONTROLLED, held in a ref. A form that re-renders on every keystroke drops
 * characters on a slow phone, and nothing here needs to see a half-typed address.
 */

/** Which journey the reader is on. */
export type AuthMode = "signIn" | "signUp" | "forgotPassword"

/** What the reader hands over at the first step. */
export type AuthDetails = {
    /** The address the code is sent to. */
    readonly email: string
    /** The secret, whichever journey names it. */
    readonly password: string
}

/** What the reader hands over at the second step. */
export type AuthCode = {
    /** The one-time code from their inbox. */
    readonly otp: string
}

/** Copy shared by every step of every journey. */
export type AuthPanelFrame = {
    /** What the surface is called while this journey is on screen. */
    readonly title: string
    /** The line under the title, saying what the reader is here to do. */
    readonly subtitle: string
    /** The one sentence that goes with whatever is happening. Empty when nothing is. */
    readonly statusMessage: string
    /** Whether that sentence is a refusal, so it is announced rather than merely shown. */
    readonly isError: boolean
    /** Whether a request is already on its way, so the controls refuse a second press. */
    readonly isPending: boolean
}

/** Copy for the first step. */
export type AuthDetailsCopy = {
    readonly emailLabel: string
    readonly emailPlaceholder: string
    readonly passwordLabel: string
    readonly passwordPlaceholder: string
    readonly passwordHint: string
    readonly revealLabel: string
    readonly hideLabel: string
    readonly submitLabel: string
    readonly orLabel: string
    readonly oauthGoogle: string
    readonly oauthGithub: string
    readonly rememberMeLabel: string
    readonly forgotPassword: string
    readonly agreeToTerms: string
    /** The last line: a question, and the answer that switches journey. */
    readonly promptQuestion: string
    readonly promptAction: string
    /**
     * The already-resolved words of the test-account door, drawn only in a development build.
     *
     * ABSENT IS HOW IT IS TURNED OFF, and that is the whole gate on this side. The panel never
     * asks what environment it is in - it draws what it is given. A build that must not offer the
     * door simply never hands over this string, so there is no flag here to read wrongly and no
     * branch here to get inverted.
     */
    readonly devSignInLabel?: string
}

/** Copy for the second step. */
export type AuthCodeCopy = {
    readonly codeLabel: string
    readonly codePlaceholder: string
    readonly codeHint: string
    readonly submitLabel: string
    readonly resendLabel: string
    readonly useAnotherEmailLabel: string
}

/** Copy for the confirmation. */
export type AuthDoneCopy = {
    readonly doneTitle: string
    readonly doneHint: string
}

/** Props for {@link _AuthenticationPanel}, discriminated by the step. */
export type AuthenticationPanelProps =
    | {
        readonly state: "details"
        readonly props: AuthPanelFrame & AuthDetailsCopy & {
            readonly mode: AuthMode
            readonly hasAgreedToTerms: boolean
            readonly rememberMe: boolean
        }
    }
    | { readonly state: "code"; readonly props: AuthPanelFrame & AuthCodeCopy }
    | { readonly state: "done"; readonly props: AuthPanelFrame & AuthDoneCopy }

/** What the panel reports. */
export type AuthenticationPanelActions = {
    readonly submitDetails?: (details: AuthDetails) => void
    readonly submitCode?: (code: AuthCode) => void
    readonly resend?: () => void
    readonly changeMode?: (mode: AuthMode) => void
    readonly changeAgreedToTerms?: (agreed: boolean) => void
    readonly changeRememberMe?: (remember: boolean) => void
    readonly oauthPress?: (provider: KeycloakIdentityProvider) => void
    /** Called when the reader takes the test-account door. */
    readonly devSignInPress?: () => void
}

/** The id the dialog points its label at, so the surface is named by its own title. */
export const AUTHENTICATION_PANEL_TITLE_ID = "authentication-panel-title"

/** Field ids, so every label reaches the box it names. */
const EMAIL_ID = "authentication-email"
const PASSWORD_ID = "authentication-password"
const CODE_ID = "authentication-code"

/** What the form starts with. */
const EMPTY_VALUES = { email: "", password: "", otp: "" }

/**
 * Render the panel.
 *
 * @param input - {@link AuthenticationPanelProps}
 */
export const _AuthenticationPanel = (
    input: AuthenticationPanelProps & {
        readonly on?: AuthenticationPanelActions
        readonly children?: ReactNode
    },
) => {
    const values = useRef({ ...EMPTY_VALUES })

    /** The name of the surface, over the line that says what it is for. */
    const header = (
        <Tree contract="centred-title-pair">
            <span id={AUTHENTICATION_PANEL_TITLE_ID}>
                <Heading props={{ content: input.props.title, level: 2 }} />
            </span>
            <Text props={{ content: input.props.subtitle, size: "sm", tone: "muted" }} />
        </Tree>
    )

    /** The one sentence, announced when it is a refusal and merely shown when it is not. */
    const status = input.props.statusMessage === "" ? null : (
        <Text
            props={{
                content: input.props.statusMessage,
                tone: input.props.isError ? "default" : "muted",
                size: "sm",
                live: input.props.isError ? "assertive" : "polite",
            }}
        />
    )

    if (input.state === "done") {
        return (
            <Tree contract="centred-page-column">
                {input.children}
                {header}
                <Tree contract="centred-title-pair">
                    <Heading props={{ content: input.props.doneTitle, level: 3 }} />
                    <Text props={{ content: input.props.doneHint, tone: "muted", size: "sm" }} />
                </Tree>
                {status}
            </Tree>
        )
    }

    if (input.state === "code") {
        const submit = (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            input.on?.submitCode?.({ otp: values.current.otp })
        }
        return (
            <Tree contract="centred-page-column">
                {input.children}
                {header}
                <form onSubmit={submit}>
                    <Tree contract="stacked-peer-controls">
                        <Field
                            props={{
                                id: CODE_ID,
                                name: "otp",
                                kind: "code",
                                label: input.props.codeLabel,
                                placeholder: input.props.codePlaceholder,
                                hint: input.props.codeHint,
                                disabled: input.props.isPending,
                            }}
                            on={{ change: (value) => { values.current.otp = value } }}
                        />
                        {status}
                        <Button
                            props={{
                                label: input.props.submitLabel,
                                variant: "primary",
                                type: "submit",
                                disabled: input.props.isPending,
                            }}
                        />
                    </Tree>
                </form>
                <Tree contract="spread-choice-row">
                    <TextLink props={{ label: input.props.resendLabel }} on={{ press: input.on?.resend }} />
                    <TextLink
                        props={{ label: input.props.useAnotherEmailLabel }}
                        on={{ press: () => input.on?.changeMode?.("signIn") }}
                    />
                </Tree>
            </Tree>
        )
    }

    // The terms are the ONE thing that can hold a submission back before it is attempted, and only
    // when an account is being opened. Signing in and resetting a password agree to nothing new.
    const isBlockedByTerms = input.props.mode === "signUp" && !input.props.hasAgreedToTerms
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        input.on?.submitDetails?.({ email: values.current.email, password: values.current.password })
    }

    return (
        <Tree contract="centred-page-column">
            {input.children}
            {header}
            <Tree contract="stacked-peer-controls">
                <Button
                    props={{ label: input.props.oauthGoogle, variant: "outline", icon: "google", disabled: input.props.isPending }}
                    on={{ press: () => input.on?.oauthPress?.(KeycloakIdentityProvider.Google) }}
                />
                <Button
                    props={{ label: input.props.oauthGithub, variant: "outline", icon: "github", disabled: input.props.isPending }}
                    on={{ press: () => input.on?.oauthPress?.(KeycloakIdentityProvider.Github) }}
                />
                {input.props.devSignInLabel === undefined ? null : (
                    <Button
                        props={{
                            label: input.props.devSignInLabel,
                            variant: "ghost",
                            icon: "signedIn",
                            disabled: input.props.isPending,
                        }}
                        on={{ press: input.on?.devSignInPress }}
                    />
                )}
            </Tree>
            <Divider props={{ label: input.props.orLabel }} />
            <form onSubmit={submit}>
                <Tree contract="stacked-peer-controls">
                    <Field
                        props={{
                            id: EMAIL_ID,
                            name: "email",
                            kind: "email",
                            label: input.props.emailLabel,
                            placeholder: input.props.emailPlaceholder,
                            disabled: input.props.isPending,
                        }}
                        on={{ change: (value) => { values.current.email = value } }}
                    />
                    <Field
                        props={{
                            id: PASSWORD_ID,
                            name: "password",
                            kind: "password",
                            label: input.props.passwordLabel,
                            placeholder: input.props.passwordPlaceholder,
                            hint: input.props.passwordHint === "" ? undefined : input.props.passwordHint,
                            revealLabel: input.props.revealLabel,
                            hideLabel: input.props.hideLabel,
                            disabled: input.props.isPending,
                        }}
                        on={{ change: (value) => { values.current.password = value } }}
                    />
                    <Tree contract="spread-choice-row">
                        {input.props.mode === "signUp" ? (
                            <Checkbox
                                props={{ label: input.props.agreeToTerms, isSelected: input.props.hasAgreedToTerms }}
                                on={{ change: (agreed) => input.on?.changeAgreedToTerms?.(agreed) }}
                            />
                        ) : (
                            <Checkbox
                                props={{ label: input.props.rememberMeLabel, isSelected: input.props.rememberMe }}
                                on={{ change: (remember) => input.on?.changeRememberMe?.(remember) }}
                            />
                        )}
                        <TextLink
                            props={{ label: input.props.forgotPassword }}
                            on={{ press: () => input.on?.changeMode?.("forgotPassword") }}
                        />
                    </Tree>
                    {status}
                    <Button
                        props={{
                            label: input.props.submitLabel,
                            variant: "primary",
                            type: "submit",
                            disabled: input.props.isPending || isBlockedByTerms,
                        }}
                    />
                </Tree>
            </form>
            <Tree contract="centred-prompt-row">
                <Text props={{ content: input.props.promptQuestion, size: "sm", tone: "muted" }} />
                <TextLink
                    props={{ label: input.props.promptAction }}
                    on={{ press: () => input.on?.changeMode?.(input.props.mode === "signIn" ? "signUp" : "signIn") }}
                />
            </Tree>
        </Tree>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "pure", domain: "auth" } as const
