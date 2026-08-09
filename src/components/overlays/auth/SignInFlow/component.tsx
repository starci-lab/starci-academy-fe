import { useRef, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/atoms/Button"
import { Heading } from "@/components/atoms/Heading"
import { Tree } from "@/components/frames/Tree"
import type { TreeSlotProps } from "@/components/classNames"

/**
 * OVERLAY - `SignInFlow`, presentational half.
 *
 * The interaction topology of an OTP sign-in: credentials, then a code, then a signed-in
 * confirmation. It is filed under overlays rather than blocks because what it owns is not a
 * shape but an ORDER - which control exists, when, and what pressing it is allowed to mean.
 *
 * ONE REGISTRY KEY DOES THE WHOLE FORM. `form` declares `body`, `meta`, `action`, `footer`
 * in that order, which is the entire layout decision made here: the controls, then the line
 * that says what just happened, then the one button that submits, then the secondary way out.
 * The outcome line sits ABOVE the button rather than below it because a rejected code has to
 * be read before the button is pressed again - and it holds a row of its own so the button
 * does not jump under a pointer already resting on it.
 *
 * THE CONTROLS ARE UNCONTROLLED, ON PURPOSE. The registry frame mounts each slot as a
 * COMPONENT, so a slot is free to be remounted whenever this file re-renders - which is
 * exactly what happens the moment a request settles. React state in an input would survive
 * that; a DOM value would not. So the typed values are mirrored into a ref as they are typed
 * and read back as `defaultValue`, and a remount restores what the reader wrote instead of
 * silently emptying the form under them after a failed attempt.
 *
 * WHY THE STATUS LINE IS A BARE `<p>` AND NOT THE TEXT ATOM. It is a live region: a refusal
 * that is only visible has not been delivered to a reader who is not looking at it. The atom
 * has no way to say `role="alert"`, and inventing one for a single caller is how an atom's
 * closed surface starts leaking - so this one element speaks for itself, and the finding is
 * recorded rather than papered over.
 */

/** Where the reader is in the flow, as the surface sees it. */
export type SignInFlowStep = "credentials" | "code" | "done"

/**
 * What just happened, as one resolved token.
 *
 * The presentational half derives everything it needs from this - whether the submit is
 * pressable, whether the resend is, which live region the outcome line is - so there is no
 * second flag that could disagree with it.
 */
export type SignInFlowStatus =
    | "idle"
    | "sending"
    | "sent"
    | "verifying"
    | "resending"
    | "resent"
    | "error"
    | "signedIn"

/** What the credentials step hands back. */
export interface SignInFlowCredentials {
    /** The address the reader typed. */
    email: string
    /** The password the reader typed. */
    password: string
}

/** What the code step hands back. */
export interface SignInFlowCode {
    /** The one-time code the reader typed. */
    otp: string
}

/** Every string this overlay renders, already resolved by the connected half. */
export interface SignInFlowLabels {
    /** Label of the email control. */
    emailLabel: string
    /** What the reader needs to know about the email control; empty when there is nothing to add. */
    emailHint: string
    /** Label of the password control. */
    passwordLabel: string
    /** What the reader needs to know about the password control; empty when there is nothing to add. */
    passwordHint: string
    /** Label of the one-time code control. */
    codeLabel: string
    /** Where the code was sent and how long it lives - the one hint that always has something to say. */
    codeHint: string
    /** Label of the button that submits the credentials. */
    submitCredentials: string
    /** Label of the button that submits the code. */
    submitCode: string
    /** Label of the control that asks for a fresh code. */
    resend: string
    /** What happens next, read under the credentials step. */
    credentialsHint: string
    /** Title of the confirmation that replaces the form once the token is in hand. */
    signedInTitle: string
    /** What the reader may do now that they are signed in. */
    signedInHint: string
}

/** Props for {@link _SignInFlow} - presentational; no fetch, no store, no i18n. */
export interface SignInFlowProps {
    /** Which step is on screen. */
    step: SignInFlowStep
    /** What just happened. */
    status: SignInFlowStatus
    /** The already-resolved sentence for {@link SignInFlowProps.status}; empty when idle. */
    statusMessage: string
    /** Resolved copy. */
    labels: SignInFlowLabels
    /** Called with the credentials when the first step is submitted. */
    onSubmitCredentials: (credentials: SignInFlowCredentials) => void
    /** Called with the code when the second step is submitted. */
    onSubmitCode: (code: SignInFlowCode) => void
    /** Called when the reader asks for a fresh code. */
    onResend: () => void
    /** Renders every slot in its resting state. */
    isSkeleton?: boolean
}

/** What the ref carries between renders: everything the reader has typed so far. */
interface SignInFlowValues {
    /** The email as last typed. */
    email: string
    /** The password as last typed. */
    password: string
    /** The one-time code as last typed. */
    otp: string
}

/**
 * Control ids. They are module constants rather than generated per instance because the
 * label-to-control link has to survive a remount of the slot, and a fresh id on every mount
 * is a link that only usually holds.
 */
const EMAIL_ID = "sign-in-email"

/** Id of the password control. */
const PASSWORD_ID = "sign-in-password"

/** Id of the one-time code control. */
const CODE_ID = "sign-in-code"

/** The statuses during which a request is in flight and the primary action is not pressable. */
const PENDING_STATUSES: readonly SignInFlowStatus[] = ["sending", "verifying"]

/** Nothing typed yet. */
const EMPTY_VALUES: SignInFlowValues = { email: "", password: "", otp: "" }

/**
 * Render the sign-in flow. See the file header for why one registry key covers the whole form.
 *
 * @param props - {@link SignInFlowProps}
 */
export const _SignInFlow = ({
    step,
    status,
    statusMessage,
    labels,
    onSubmitCredentials,
    onSubmitCode,
    onResend,
    isSkeleton = false,
}: SignInFlowProps) => {
    const values = useRef<SignInFlowValues>({ ...EMPTY_VALUES })

    const isPending = PENDING_STATUSES.includes(status)
    const isResending = status === "resending"

    /** Mirror a control's value into the ref so a remount can restore it. */
    const onChangeEmail = (event: ChangeEvent<HTMLInputElement>) => {
        values.current.email = event.target.value
    }

    /** Mirror the password the same way; it is never read anywhere else. */
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
        if (isPending) return
        if (step === "code") {
            onSubmitCode({ otp: values.current.otp })
            return
        }
        onSubmitCredentials({ email: values.current.email, password: values.current.password })
    }

    /** The `heading` role of the email `form-field`. */
    const EmailLabel = () => <label htmlFor={EMAIL_ID}>{labels.emailLabel}</label>

    /** The `field` role of the email `form-field`. */
    const EmailInput = ({ isSkeleton: resting }: TreeSlotProps) => (
        <input
            id={EMAIL_ID}
            data-part="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={values.current.email}
            disabled={resting === true}
            onChange={onChangeEmail}
        />
    )

    /** The `meta` role of the email `form-field`. */
    const EmailHint = () => <p data-part="email-hint">{labels.emailHint}</p>

    /** The `heading` role of the password `form-field`. */
    const PasswordLabel = () => <label htmlFor={PASSWORD_ID}>{labels.passwordLabel}</label>

    /** The `field` role of the password `form-field`. */
    const PasswordInput = ({ isSkeleton: resting }: TreeSlotProps) => (
        <input
            id={PASSWORD_ID}
            data-part="password"
            name="password"
            type="password"
            autoComplete="current-password"
            defaultValue={values.current.password}
            disabled={resting === true}
            onChange={onChangePassword}
        />
    )

    /** The `meta` role of the password `form-field`. */
    const PasswordHint = () => <p data-part="password-hint">{labels.passwordHint}</p>

    /** The `heading` role of the code `form-field`. */
    const CodeLabel = () => <label htmlFor={CODE_ID}>{labels.codeLabel}</label>

    /**
     * The `field` role of the code `form-field`. `one-time-code` is what lets a phone offer
     * the code from the message it just received, and `numeric` is what gets a reader the
     * digit keypad rather than a full keyboard.
     */
    const CodeInput = ({ isSkeleton: resting }: TreeSlotProps) => (
        <input
            id={CODE_ID}
            data-part="code"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            defaultValue={values.current.otp}
            disabled={resting === true}
            onChange={onChangeCode}
        />
    )

    /** The `meta` role of the code `form-field`. */
    const CodeHint = () => <p data-part="code-hint">{labels.codeHint}</p>

    /** The email control, labelled and hinted. */
    const EmailField = ({ isSkeleton: resting }: TreeSlotProps) => (
        <Tree
            name="form-field"
            isSkeleton={resting}
            slots={{ heading: EmailLabel, field: EmailInput, meta: EmailHint }}
        />
    )

    /** The password control, labelled and hinted. */
    const PasswordField = ({ isSkeleton: resting }: TreeSlotProps) => (
        <Tree
            name="form-field"
            isSkeleton={resting}
            slots={{ heading: PasswordLabel, field: PasswordInput, meta: PasswordHint }}
        />
    )

    /** The code control, labelled and hinted. */
    const CodeField = ({ isSkeleton: resting }: TreeSlotProps) => (
        <Tree
            name="form-field"
            isSkeleton={resting}
            slots={{ heading: CodeLabel, field: CodeInput, meta: CodeHint }}
        />
    )

    /**
     * The `body` role of the `form` key: whichever controls this step actually has.
     *
     * The two credential controls are siblings of the same node rather than a group of their
     * own, because the seam between two controls of one submission is the same seam as the one
     * between the last control and the button - and a node that only existed to restate that
     * would be a shape with no reason.
     */
    const Fields = ({ isSkeleton: resting }: TreeSlotProps) => {
        if (step === "code") return <CodeField isSkeleton={resting} />
        return (
            <>
                <EmailField isSkeleton={resting} />
                <PasswordField isSkeleton={resting} />
            </>
        )
    }

    /**
     * The `meta` role of the `form` key: what just happened.
     *
     * A refusal is `alert` and everything else is `status`, which is the difference between
     * interrupting a reader and telling them in passing - and getting it the wrong way round
     * means a wrong code is announced as calmly as a code being sent.
     *
     * It carries no `aria-label`: a live region is announced by its CONTENT, and a name here
     * would replace the sentence the reader is meant to hear with the word for it.
     */
    const Status = () => (
        <p data-part="status" data-state={status} role={status === "error" ? "alert" : "status"}>
            {statusMessage}
        </p>
    )

    /** The `action` role of the `form` key: the one honest primary action of the surface. */
    const Submit = ({ isSkeleton: resting }: TreeSlotProps) => (
        <Button variant="primary" type="submit" disabled={isPending} isSkeleton={resting}>
            {step === "code" ? labels.submitCode : labels.submitCredentials}
        </Button>
    )

    /**
     * The `footer` role of the `form` key: the secondary way forward.
     *
     * At the code step that is a resend, which is a real action; at the credentials step there
     * is nothing to press yet, so the footer says what pressing the button will DO - the one
     * thing a reader about to hand over a password wants to know.
     */
    const Secondary = ({ isSkeleton: resting }: TreeSlotProps) => {
        if (step !== "code") return <p data-part="hint">{labels.credentialsHint}</p>
        return (
            <Button variant="ghost" disabled={isResending} isSkeleton={resting} onClick={onResend}>
                {labels.resend}
            </Button>
        )
    }

    /** The `heading` role of the confirmation that replaces the form. */
    const DoneTitle = ({ isSkeleton: resting }: TreeSlotProps) => (
        <Heading level={3} isSkeleton={resting}>{labels.signedInTitle}</Heading>
    )

    /** The `body` role of the confirmation. */
    const DoneBody = () => <p data-part="done">{labels.signedInHint}</p>

    // Once the token is in hand there is no form left to draw: a disabled copy of one would be
    // a second description of a step that is over.
    if (step === "done") {
        return (
            <Tree
                name="section"
                isSkeleton={isSkeleton}
                slots={{ heading: DoneTitle, body: DoneBody }}
            />
        )
    }

    return (
        <form data-component="SignInFlow" data-step={step} noValidate onSubmit={onSubmit}>
            <Tree
                name="form"
                isSkeleton={isSkeleton}
                slots={{ body: Fields, meta: Status, action: Submit, footer: Secondary }}
            />
        </form>
    )
}
