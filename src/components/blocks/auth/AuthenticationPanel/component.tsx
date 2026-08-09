import { useRef, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/atoms/Button"
import { Heading } from "@/components/atoms/Heading"
import { Input } from "@/components/atoms/Input"
import { Label } from "@/components/atoms/Label"
import { Text } from "@/components/atoms/Text"
import { Tree } from "@/components/frames/Tree"
import type { ContractSlot, ContractSlotProps } from "@/components/contracts"
import { KeycloakIdentityProvider } from "@/modules/api/graphql/mutations/types/auth"

/**
 * BLOCK - `AuthenticationPanel`, presentational half.
 *
 * ONE PANEL, THREE JOURNEYS, TWO SURFACES. This is the whole of authentication as a single
 * component: signing in, opening an account and resetting a password, each of them two steps -
 * details, then the code that arrived by email - plus the two identity-provider shortcuts that
 * skip both. It is mounted twice, by the floating `SignInOverlay` and by the routed
 * `AuthenticationPage`, and neither of them draws a second copy of any of it. That is the point:
 * the surface a reader signs in ON is a detail; what signing in IS must be written once.
 *
 * WHY THE MODE ONLY RENAMES THE SECOND FIELD. The three first-step operations were read off the
 * running schema and all take an address and exactly one secret - `signInInit(email, password)`,
 * `signUpInit(email, password)`, `forgotPasswordInit(email, newPassword)`. So the form has two
 * boxes in every mode and the mode changes what the second one is CALLED, rather than growing a
 * third control for a value the server takes in the same position. That is also why the reset
 * journey asks for the new password BEFORE the code: the code authorises a change that has
 * already been described, which is the server's design and not a choice made here.
 *
 * THE KEYS, AND WHY EACH ONE. `section` holds the title above the form, because the seam under
 * the title is what says the controls belong to it. `page-header` puts the surface's own way out
 * on the title line - the overlay hands its close control in as a slot, and the page hands in
 * nothing, which is exactly the difference between the two surfaces. `form` carries the whole
 * submission: controls, then the line that says what just happened, then the one button, then the
 * secondary ways forward - and the outcome line sits ABOVE the button because a refusal has to be
 * read before the button is pressed again. `form-field` is each labelled control, and `grid` holds
 * the pairs of peer controls: the two providers, and the two secondary ways out.
 *
 * THE CONTROLS ARE UNCONTROLLED, ON PURPOSE. The registry frame mounts each slot as a COMPONENT,
 * so a slot is free to be remounted whenever this file re-renders - which is exactly what happens
 * the moment a request settles. React state in an input would survive that; a DOM value would not.
 * The typed values are mirrored into a ref as they are typed and read back as `defaultValue`, so a
 * remount restores what the reader wrote instead of emptying the form under them after a refusal.
 *
 * WHAT IS NOT DRAWN HERE, AND WHY. There is no "confirm password" box, because no operation in the
 * schema takes one; there is no captcha, because this back end exposes none. The agreement control
 * is a press target rather than a checkbox and the provider buttons carry no provider glyph -
 * both because the atom tier has neither yet, and inventing one here is how two vocabularies for
 * one control get started.
 */

/** Which of the three journeys the panel is drawing. */
export type AuthenticationPanelMode = "signIn" | "signUp" | "forgotPassword"

/** Where the reader is within the journey. */
export type AuthenticationPanelStep = "details" | "code" | "done"

/**
 * What just happened, as one resolved token.
 *
 * The presentational half derives everything it needs from this - whether the submit is pressable,
 * whether the resend is, how urgently the outcome line is announced - so there is no second flag
 * that could disagree with it.
 */
export type AuthenticationPanelStatus =
    | "idle"
    | "sending"
    | "sent"
    | "verifying"
    | "resending"
    | "resent"
    | "error"
    | "signedIn"

/** What the details step hands back. */
export interface AuthenticationPanelDetails {
    /** The address the reader typed. */
    email: string
    /** The secret the reader typed; the mode decides what it means. */
    password: string
}

/** What the code step hands back. */
export interface AuthenticationPanelCode {
    /** The one-time code the reader typed. */
    otp: string
}

/** Every string this panel renders, already resolved by the connected half. */
export interface AuthenticationPanelLabels {
    /** The name of the surface - it changes with the mode, and names the dialog when floating. */
    title: string
    /** Label of the email control. */
    emailLabel: string
    /** What the reader needs to know about the email control; empty when there is nothing to add. */
    emailHint: string
    /** Label of the secret control - the mode decides whether it is a current or a new password. */
    passwordLabel: string
    /** What the reader needs to know about the secret control. */
    passwordHint: string
    /** Label of the one-time code control. */
    codeLabel: string
    /** Where the code went and how long it lives - the one hint that always has something to say. */
    codeHint: string
    /** Label of the one primary action, whichever step it submits. */
    submit: string
    /** Label of the control that asks for a fresh code. */
    resend: string
    /** Label of the control that abandons the challenge and returns to the details step. */
    useAnotherEmail: string
    /** Label of the Google shortcut. */
    oauthGoogle: string
    /** Label of the GitHub shortcut. */
    oauthGithub: string
    /** The agreement a new account is opened under. */
    agreeToTerms: string
    /** Label of the control that switches to signing in. */
    switchToSignIn: string
    /** Label of the control that switches to opening an account. */
    switchToSignUp: string
    /** Label of the control that switches to resetting a password. */
    switchToForgotPassword: string
    /** Title of the confirmation that replaces the form once a token is in hand. */
    doneTitle: string
    /** What the reader may do now that the journey is over. */
    doneHint: string
}

/** What a host surface hangs on the panel's title line. */
export interface AuthenticationPanelSlots {
    /**
     * The surface's own way out, drawn on the title line.
     *
     * The FLOATING surface has one - Escape, the close control and the open flag all mean the same
     * thing - and the routed surface does not, because a page that is already the whole screen has
     * nothing to close. That difference is the whole reason this is a slot rather than a prop.
     */
    action?: ContractSlot
}

/** Props for {@link _AuthenticationPanel} - presentational; no fetch, no store, no i18n. */
export interface AuthenticationPanelProps {
    /** Which journey is on screen. */
    mode: AuthenticationPanelMode
    /** Which step of it. */
    step: AuthenticationPanelStep
    /** What just happened. */
    status: AuthenticationPanelStatus
    /** The already-resolved sentence for {@link AuthenticationPanelProps.status}; empty when idle. */
    statusMessage: string
    /** Whether the reader has accepted the terms. Only ever gates the sign-up mode. */
    hasAgreedToTerms: boolean
    /** Resolved copy. */
    labels: AuthenticationPanelLabels
    /** What the host surface hangs on the title line. */
    slots: AuthenticationPanelSlots
    /** Called with the details when the first step is submitted. */
    onSubmitDetails: (details: AuthenticationPanelDetails) => void
    /** Called with the code when the second step is submitted. */
    onSubmitCode: (code: AuthenticationPanelCode) => void
    /** Called when the reader asks for a fresh code. */
    onResend: () => void
    /** Called when the reader switches journeys. */
    onChangeMode: (mode: AuthenticationPanelMode) => void
    /** Called when the reader accepts or withdraws acceptance of the terms. */
    onChangeAgreedToTerms: (agreed: boolean) => void
    /** Called when the reader leaves for an identity provider. */
    onOauthPress: (provider: KeycloakIdentityProvider) => void
    /** Renders every slot in its resting state. */
    isLoading?: boolean
}

/** What the ref carries between renders: everything the reader has typed so far. */
interface AuthenticationPanelValues {
    /** The email as last typed. */
    email: string
    /** The secret as last typed. */
    password: string
    /** The one-time code as last typed. */
    otp: string
}

/**
 * The id of the title.
 *
 * It is a module constant rather than a generated one because the FLOATING surface names its
 * dialog with it, and a name that changes on every mount is a name that only usually holds. It is
 * exported for exactly that one reader - the dialog is named by the heading a reader actually
 * sees, rather than by a second string that can drift from it.
 */
export const AUTHENTICATION_PANEL_TITLE_ID = "authentication-panel-title"

/** Id of the email control. Stable across remounts, so the label-to-control link always holds. */
const EMAIL_ID = "authentication-email"

/** Id of the secret control. */
const PASSWORD_ID = "authentication-password"

/** Id of the one-time code control. */
const CODE_ID = "authentication-code"

/** The statuses during which a request is in flight and the primary action is not pressable. */
const PENDING_STATUSES: ReadonlyArray<AuthenticationPanelStatus> = ["sending", "verifying"]

/** Nothing typed yet. */
const EMPTY_VALUES: AuthenticationPanelValues = { email: "", password: "", otp: "" }

/**
 * How urgently each status is announced.
 *
 * A refusal INTERRUPTS, because the reader is about to press the button again and needs to know
 * the last attempt failed before they do. Everything else is said in passing. `idle` says nothing
 * at all, so it is not a live region: a region announced while empty would clear the reader's
 * screen reader queue for no reason.
 */
const LIVE_BY_STATUS: Record<AuthenticationPanelStatus, "off" | "polite" | "assertive"> = {
    idle: "off",
    sending: "polite",
    sent: "polite",
    verifying: "polite",
    resending: "polite",
    resent: "polite",
    error: "assertive",
    signedIn: "polite",
}

/** Nothing on the title line but the title - the routed surface has no way out to draw. */
const NoHeaderAction = () => null

/**
 * Render the authentication panel. See the file header for what each registry key is doing.
 *
 * @param props - {@link AuthenticationPanelProps}
 */
export const _AuthenticationPanel = ({
    mode,
    step,
    status,
    statusMessage,
    hasAgreedToTerms,
    labels,
    slots,
    onSubmitDetails,
    onSubmitCode,
    onResend,
    onChangeMode,
    onChangeAgreedToTerms,
    onOauthPress,
    isLoading = false,
}: AuthenticationPanelProps) => {
    const values = useRef<AuthenticationPanelValues>({ ...EMPTY_VALUES })

    const isPending = PENDING_STATUSES.includes(status)
    const isResending = status === "resending"
    // The terms are the ONE thing that can hold a submission back before it is attempted, and only
    // when an account is being opened. Signing in and resetting a password agree to nothing new.
    const isBlockedByTerms = mode === "signUp" && step === "details" && !hasAgreedToTerms

    /** Mirror a control's value into the ref so a remount can restore it. */
    const onChangeEmail = (event: ChangeEvent<HTMLInputElement>) => {
        values.current.email = event.target.value
    }

    /** Mirror the secret the same way; it is never read anywhere else. */
    const onChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
        values.current.password = event.target.value
    }

    /** Mirror the one-time code the same way. */
    const onChangeCode = (event: ChangeEvent<HTMLInputElement>) => {
        values.current.otp = event.target.value
    }

    /** One submit for both steps - which one it is, is the step, not a second handler. */
    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (isPending || isBlockedByTerms) return
        if (step === "code") {
            onSubmitCode({ otp: values.current.otp })
            return
        }
        onSubmitDetails({ email: values.current.email, password: values.current.password })
    }

    /** The `heading` role of the email `form-field`. */
    const EmailLabel = () => (
        <Label htmlFor={EMAIL_ID} icon="email">
            {labels.emailLabel}
        </Label>
    )

    /** The `field` role of the email `form-field`. */
    const EmailInput = ({ isLoading: resting }: ContractSlotProps) => (
        <Input
            id={EMAIL_ID}
            name="email"
            kind="email"
            defaultValue={values.current.email}
            disabled={resting === true}
            isInvalid={status === "error"}
            onChange={onChangeEmail}
        />
    )

    /** The `meta` role of the email `form-field`. */
    const EmailHint = () => (
        <Text tone="muted" size="sm">
            {labels.emailHint}
        </Text>
    )

    /** The `heading` role of the secret `form-field`. */
    const PasswordLabel = () => (
        <Label htmlFor={PASSWORD_ID} icon="password">
            {labels.passwordLabel}
        </Label>
    )

    /** The `field` role of the secret `form-field`. */
    const PasswordInput = ({ isLoading: resting }: ContractSlotProps) => (
        <Input
            id={PASSWORD_ID}
            name="password"
            kind="password"
            defaultValue={values.current.password}
            disabled={resting === true}
            isInvalid={status === "error"}
            onChange={onChangePassword}
        />
    )

    /** The `meta` role of the secret `form-field`. */
    const PasswordHint = () => (
        <Text tone="muted" size="sm">
            {labels.passwordHint}
        </Text>
    )

    /** The `heading` role of the code `form-field`. */
    const CodeLabel = () => (
        <Label htmlFor={CODE_ID} icon="code">
            {labels.codeLabel}
        </Label>
    )

    /**
     * The `field` role of the code `form-field`. The `code` kind is what carries `one-time-code`
     * and the numeric keypad - a phone then offers the code straight from the message that just
     * arrived, and a thumb gets digits rather than a full keyboard.
     */
    const CodeInput = ({ isLoading: resting }: ContractSlotProps) => (
        <Input
            id={CODE_ID}
            name="otp"
            kind="code"
            defaultValue={values.current.otp}
            disabled={resting === true}
            isInvalid={status === "error"}
            onChange={onChangeCode}
        />
    )

    /** The `meta` role of the code `form-field`. */
    const CodeHint = () => (
        <Text tone="muted" size="sm">
            {labels.codeHint}
        </Text>
    )

    /** The email control, labelled and hinted. */
    const EmailField = ({ isLoading: resting }: ContractSlotProps) => (
        <Tree
            contract="form-field"
            isLoading={resting}
            slots={{ heading: EmailLabel, field: EmailInput, meta: EmailHint }}
        />
    )

    /** The secret control, labelled and hinted. */
    const PasswordField = ({ isLoading: resting }: ContractSlotProps) => (
        <Tree
            contract="form-field"
            isLoading={resting}
            slots={{ heading: PasswordLabel, field: PasswordInput, meta: PasswordHint }}
        />
    )

    /** The code control, labelled and hinted. */
    const CodeField = ({ isLoading: resting }: ContractSlotProps) => (
        <Tree
            contract="form-field"
            isLoading={resting}
            slots={{ heading: CodeLabel, field: CodeInput, meta: CodeHint }}
        />
    )

    /**
     * The two identity-provider shortcuts, as peers.
     *
     * They carry no provider glyph: the icon atom's set is closed and holds neither mark, and a
     * stand-in glyph on both would say the same thing twice. The label carries the provider until
     * the atom does.
     */
    const OauthChoices = ({ isLoading: resting }: ContractSlotProps) => (
        <>
            <Button
                variant="secondary"
                isLoading={resting}
                onClick={() => onOauthPress(KeycloakIdentityProvider.Google)}
            >
                {labels.oauthGoogle}
            </Button>
            <Button
                variant="secondary"
                isLoading={resting}
                onClick={() => onOauthPress(KeycloakIdentityProvider.Github)}
            >
                {labels.oauthGithub}
            </Button>
        </>
    )

    /** The provider pair, side by side once there is room for both. */
    const OauthRow = ({ isLoading: resting }: ContractSlotProps) => (
        <Tree contract="grid" isLoading={resting} slots={{ body: OauthChoices }} />
    )

    /**
     * The agreement a new account is opened under.
     *
     * It is a press target rather than a checkbox because the atom tier has no checkbox yet, and a
     * hand-rolled one here would be a second control for something the whole product needs once.
     * The mark appears only once the agreement has been given, so the state is readable without
     * reading the sentence again.
     */
    const TermsRow = ({ isLoading: resting }: ContractSlotProps) => (
        <Button
            variant={hasAgreedToTerms ? "secondary" : "ghost"}
            icon={hasAgreedToTerms ? "signedIn" : undefined}
            isLoading={resting}
            onClick={() => onChangeAgreedToTerms(!hasAgreedToTerms)}
        >
            {labels.agreeToTerms}
        </Button>
    )

    /**
     * The `body` role of the `form` key: whichever controls this step and mode actually have.
     *
     * The controls of one submission are siblings of the same node rather than a group of their
     * own, because the seam between two controls is the same seam as the one between the last
     * control and the button - and a node that only existed to restate that would be a shape with
     * no reason.
     */
    const Fields = ({ isLoading: resting }: ContractSlotProps) => {
        if (step === "code") return <CodeField isLoading={resting} />
        return (
            <>
                {mode === "forgotPassword" ? null : <OauthRow isLoading={resting} />}
                <EmailField isLoading={resting} />
                <PasswordField isLoading={resting} />
                {mode === "signUp" ? <TermsRow isLoading={resting} /> : null}
            </>
        )
    }

    /**
     * The `meta` role of the `form` key: what just happened.
     *
     * A refusal is `alert` and everything else is `status`, which is the difference between
     * interrupting a reader and telling them in passing. It carries no `aria-label`: a live region
     * is announced by its CONTENT, and a name here would replace the sentence the reader is meant
     * to hear with the word for it.
     */
    const Status = () => (
        <Text tone={status === "error" ? "default" : "muted"} size="sm" live={LIVE_BY_STATUS[status]}>
            {statusMessage}
        </Text>
    )

    /** The `action` role of the `form` key: the one honest primary action of the surface. */
    const Submit = ({ isLoading: resting }: ContractSlotProps) => (
        <Button
            variant="primary"
            type="submit"
            icon={step === "code" ? "signIn" : "next"}
            disabled={isPending || isBlockedByTerms}
            isLoading={resting}
        >
            {labels.submit}
        </Button>
    )

    /**
     * The secondary ways forward, as peers of each other.
     *
     * At the code step they are a resend and a way back to the address, which are the only two
     * things a reader stuck on a code can do. At the details step they are the other journeys -
     * and this is where the panel stops being a sign-in form: the reader who has no account, and
     * the one who has forgotten the password, both have somewhere to go from here.
     */
    const SecondaryControls = ({ isLoading: resting }: ContractSlotProps) => {
        if (step === "code") {
            return (
                <>
                    <Button
                        variant="ghost"
                        icon="send"
                        disabled={isResending}
                        isLoading={resting}
                        onClick={onResend}
                    >
                        {labels.resend}
                    </Button>
                    <Button
                        variant="ghost"
                        icon="retry"
                        isLoading={resting}
                        onClick={() => onChangeMode(mode)}
                    >
                        {labels.useAnotherEmail}
                    </Button>
                </>
            )
        }
        if (mode === "signIn") {
            return (
                <>
                    <Button
                        variant="ghost"
                        icon="retry"
                        isLoading={resting}
                        onClick={() => onChangeMode("forgotPassword")}
                    >
                        {labels.switchToForgotPassword}
                    </Button>
                    <Button
                        variant="ghost"
                        icon="next"
                        isLoading={resting}
                        onClick={() => onChangeMode("signUp")}
                    >
                        {labels.switchToSignUp}
                    </Button>
                </>
            )
        }
        return (
            <Button
                variant="ghost"
                icon="signIn"
                isLoading={resting}
                onClick={() => onChangeMode("signIn")}
            >
                {labels.switchToSignIn}
            </Button>
        )
    }

    /** The `footer` role of the `form` key: the secondary controls, side by side when there are two. */
    const Secondary = ({ isLoading: resting }: ContractSlotProps) => (
        <Tree contract="grid" isLoading={resting} slots={{ body: SecondaryControls }} />
    )

    /** The `heading` role of the `page-header` key: the name of the surface. */
    const Title = ({ isLoading: resting }: ContractSlotProps) => (
        <Heading level={1} isLoading={resting}>
            <span id={AUTHENTICATION_PANEL_TITLE_ID}>{labels.title}</span>
        </Heading>
    )

    /** The `action` role of the `page-header` key: the host surface's own way out, if it has one. */
    const HeaderAction = slots.action ?? NoHeaderAction

    /** The `heading` role of the `section` key: the title line. */
    const Header = ({ isLoading: resting }: ContractSlotProps) => (
        <Tree contract="page-header" isLoading={resting} slots={{ heading: Title, action: HeaderAction }} />
    )

    /** The `body` role of the `section` key: the submission itself. */
    const Body = ({ isLoading: resting }: ContractSlotProps) => (
        <form
            data-tier="block"
            data-component="AuthenticationPanel"
            data-mode={mode}
            data-step={step}
            noValidate
            onSubmit={onSubmit}
        >
            <Tree
                contract="form"
                isLoading={resting}
                slots={{ body: Fields, meta: Status, action: Submit, footer: Secondary }}
            />
        </form>
    )

    /** The `body` role of the `section` key once the journey is over: what the reader may do now. */
    const DoneBody = () => (
        <Text tone="muted" icon="signedIn">
            {labels.doneHint}
        </Text>
    )

    /** The `heading` role of the `section` key once the journey is over. */
    const DoneTitle = ({ isLoading: resting }: ContractSlotProps) => (
        <Heading level={1} isLoading={resting}>
            <span id={AUTHENTICATION_PANEL_TITLE_ID}>{labels.doneTitle}</span>
        </Heading>
    )

    // Once the token is in hand there is no form left to draw: a disabled copy of one would be a
    // second description of a step that is over.
    if (step === "done") {
        return (
            <Tree contract="section" isLoading={isLoading} slots={{ heading: DoneTitle, body: DoneBody }} />
        )
    }

    return <Tree contract="section" isLoading={isLoading} slots={{ heading: Header, body: Body }} />
}
