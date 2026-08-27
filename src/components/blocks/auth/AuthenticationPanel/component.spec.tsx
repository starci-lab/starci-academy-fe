/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { AuthenticationPanelBase, type AuthenticationPanelProps } from "./component"

afterEach(cleanup)

const signUpProps: Extract<AuthenticationPanelProps, { state: "details" }> = {
    state: "details",
    props: {
        mode: "signUp",
        title: "Sign Up",
        subtitle: "Create an account to continue",
        statusMessage: "",
        isError: false,
        isPending: false,
        hasAgreedToTerms: true,
        rememberMe: false,
        emailLabel: "Email",
        emailPlaceholder: "Enter your email",
        passwordLabel: "Choose a password",
        passwordPlaceholder: "Enter your password",
        passwordHint: "Password hint",
        revealLabel: "Show password",
        hideLabel: "Hide password",
        confirmPasswordLabel: "Confirm password",
        confirmPasswordPlaceholder: "Confirm your password",
        confirmPasswordMismatch: "Passwords must match",
        submitLabel: "Create account",
        orLabel: "OR",
        oauthGoogle: "Sign In With Google",
        oauthGithub: "Sign In With GitHub",
        rememberMeLabel: "Remember me",
        forgotPassword: "Forgot Password?",
        agreeToTerms: "I agree to the terms",
        agreeToTermsPrefix: "I have read and agree to the",
        termsLabel: "Terms of Service",
        andLabel: "and",
        privacyLabel: "Privacy Policy",
        promptQuestion: "Already have an account?",
        promptAction: "Sign In",
    },
}

/** The sign-in journey: one password, a remember-me tick and a way out to the reset. */
const signInProps: Extract<AuthenticationPanelProps, { state: "details" }> = {
    state: "details",
    props: {
        ...signUpProps.props,
        mode: "signIn",
        title: "Sign In",
        subtitle: "Welcome back",
        passwordLabel: "Password",
        passwordHint: "",
        submitLabel: "Sign in",
        promptQuestion: "New here?",
        promptAction: "Create an account",
    },
}

/** The reset journey: a new password, no confirmation box and no way back to itself. */
const forgotProps: Extract<AuthenticationPanelProps, { state: "details" }> = {
    state: "details",
    props: {
        ...signInProps.props,
        mode: "forgotPassword",
        title: "Reset password",
        passwordLabel: "New password",
        submitLabel: "Send code",
    },
}

/** The second step, whichever journey opened it. */
const codeProps: Extract<AuthenticationPanelProps, { state: "code" }> = {
    state: "code",
    props: {
        title: "Check your inbox",
        subtitle: "We sent a code to reader@example.com",
        statusMessage: "",
        isError: false,
        isPending: false,
        codeLabel: "One-time code",
        codePlaceholder: "123456",
        codeHint: "Six digits",
        submitLabel: "Verify",
        resendLabel: "Send another code",
        useAnotherEmailLabel: "Use another email",
    },
}

/**
 * The one slot of the checkbox leaf this panel's guard depends on: which phrase in the
 * compound label was followed, reported as a bare id the panel has to recognise or ignore.
 */
type StandInCheckboxProps = {
    /** What following a phrase does. */
    readonly on?: {
        /** Reports which navigable phrase was followed. */
        readonly follow?: (id: string) => void
    }
}

/** The confirmation. */
const doneProps: Extract<AuthenticationPanelProps, { state: "done" }> = {
    state: "done",
    props: {
        title: "Sign In",
        subtitle: "Welcome back",
        statusMessage: "",
        isError: false,
        isPending: false,
        doneTitle: "You are signed in",
        doneHint: "Taking you back to where you were",
    },
}

describe("AuthenticationPanelBase", () => {
    it("ports the legacy sign-up anatomy: two password fields and a real checkbox", () => {
        const openLegal = vi.fn()
        const { container } = render(<AuthenticationPanelBase {...signUpProps} on={{ openLegal }} />)

        expect(screen.getByLabelText("Choose a password").getAttribute("autocomplete")).toBe("new-password")
        expect(screen.getByLabelText("Confirm password").getAttribute("autocomplete")).toBe("new-password")
        expect(screen.getByRole("checkbox", { name: "I agree to the terms" })).toBeTruthy()
        expect(container.querySelector("[data-slot='checkbox-control']")).toBeTruthy()
        expect(screen.getByRole("link", { name: "Terms of Service" }).getAttribute("href")).toBeNull()
        expect(screen.getByRole("link", { name: "Privacy Policy" }).getAttribute("href")).toBeNull()
        fireEvent.click(screen.getByRole("link", { name: "Terms of Service" }))
        expect(openLegal).toHaveBeenCalledWith("terms")
    })

    it("does not submit sign-up until the confirmation matches", () => {
        const submitDetails = vi.fn()
        render(<AuthenticationPanelBase {...signUpProps} on={{ submitDetails }} />)

        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "reader@example.com" } })
        fireEvent.change(screen.getByLabelText("Choose a password"), { target: { value: "correct-secret" } })
        fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "wrong-secret" } })
        fireEvent.click(screen.getByRole("button", { name: "Create account" }))

        expect(submitDetails).not.toHaveBeenCalled()
        expect(screen.getByText("Passwords must match")).toBeTruthy()

        fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "correct-secret" } })
        fireEvent.click(screen.getByRole("button", { name: "Create account" }))
        expect(submitDetails).toHaveBeenCalledWith({ email: "reader@example.com", password: "correct-secret" })
    })

    it("puts pending feedback on the submit action itself", () => {
        const pending = {
            ...signUpProps,
            props: { ...signUpProps.props, isPending: true },
        } satisfies typeof signUpProps
        render(<AuthenticationPanelBase {...pending} />)

        const submit = screen.getByRole("button", { name: "Create account" })
        expect(submit).toBeDisabled()
    })

    it("separates independent credential blocks with the local gap", () => {
        render(<AuthenticationPanelBase {...signUpProps} />)
        expect(screen.getByLabelText("Choose a password")).toBeInTheDocument()
        expect(screen.getByLabelText("Confirm password")).toBeInTheDocument()
    })

    it("keeps OAuth shortcuts outlined instead of styling them as secondary actions", () => {
        render(<AuthenticationPanelBase {...signUpProps} />)

        expect(screen.getByRole("button", { name: "Sign In With Google" })).toHaveAttribute("data-variant", "outline")
        expect(screen.getByRole("button", { name: "Sign In With GitHub" })).toHaveAttribute("data-variant", "outline")
    })

    it("names the provider each shortcut hands off to", () => {
        const oauthPress = vi.fn()
        render(<AuthenticationPanelBase {...signUpProps} on={{ oauthPress }} />)

        fireEvent.click(screen.getByRole("button", { name: "Sign In With Google" }))
        expect(oauthPress).toHaveBeenLastCalledWith("google")

        fireEvent.click(screen.getByRole("button", { name: "Sign In With GitHub" }))
        expect(oauthPress).toHaveBeenLastCalledWith("github")
    })

    it("reports the privacy link separately from the terms one", () => {
        const openLegal = vi.fn()
        render(<AuthenticationPanelBase {...signUpProps} on={{ openLegal }} />)

        fireEvent.click(screen.getByRole("link", { name: "Privacy Policy" }))
        expect(openLegal).toHaveBeenCalledWith("privacy")
    })

    it("records the agreement rather than holding it locally", () => {
        const changeAgreedToTerms = vi.fn()
        const unagreed = {
            ...signUpProps,
            props: { ...signUpProps.props, hasAgreedToTerms: false },
        } satisfies typeof signUpProps
        render(<AuthenticationPanelBase {...unagreed} on={{ changeAgreedToTerms }} />)

        fireEvent.click(screen.getByRole("checkbox", { name: "I agree to the terms" }))
        expect(changeAgreedToTerms).toHaveBeenCalledWith(true)
    })

    it("holds sign-up back until the terms are agreed, and only sign-up", () => {
        const unagreed = {
            ...signUpProps,
            props: { ...signUpProps.props, hasAgreedToTerms: false },
        } satisfies typeof signUpProps
        const { unmount } = render(<AuthenticationPanelBase {...unagreed} />)
        expect(screen.getByRole("button", { name: "Create account" })).toBeDisabled()
        unmount()

        // Signing in and resetting a password agree to nothing new, so nothing gates them.
        render(<AuthenticationPanelBase {...signInProps} />)
        expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled()
    })

    it("clears the mismatch the moment the confirmation is edited again", () => {
        const submitDetails = vi.fn()
        render(<AuthenticationPanelBase {...signUpProps} on={{ submitDetails }} />)

        fireEvent.change(screen.getByLabelText("Choose a password"), { target: { value: "correct-secret" } })
        fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "wrong" } })
        fireEvent.click(screen.getByRole("button", { name: "Create account" }))
        expect(screen.getByText("Passwords must match")).toBeTruthy()

        fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "wrong-again" } })
        // The refusal describes the last submission, not the box: as soon as the reader answers it
        // the sentence goes, rather than sitting under a field they are already fixing.
        expect(screen.queryByText("Passwords must match")).toBeNull()
    })

    it("draws the sign-in journey as one password, a remembered session and a way to the reset", () => {
        const changeMode = vi.fn()
        const changeRememberMe = vi.fn()
        render(<AuthenticationPanelBase {...signInProps} on={{ changeMode, changeRememberMe }} />)

        expect(screen.getByLabelText("Password").getAttribute("autocomplete")).toBe("current-password")
        expect(screen.queryByLabelText("Confirm password")).toBeNull()
        expect(screen.queryByRole("checkbox", { name: "I agree to the terms" })).toBeNull()

        fireEvent.click(screen.getByRole("checkbox", { name: "Remember me" }))
        expect(changeRememberMe).toHaveBeenCalledWith(true)

        fireEvent.click(screen.getByRole("link", { name: "Forgot Password?" }))
        expect(changeMode).toHaveBeenLastCalledWith("forgotPassword")

        fireEvent.click(screen.getByRole("link", { name: "Create an account" }))
        expect(changeMode).toHaveBeenLastCalledWith("signUp")
    })

    it("omits the hint entirely when the journey has nothing to say about the password", () => {
        render(<AuthenticationPanelBase {...signInProps} />)
        expect(screen.getByLabelText("Password").getAttribute("aria-describedby")).toBeNull()
    })

    it("submits the sign-in details without asking for a confirmation", () => {
        const submitDetails = vi.fn()
        render(<AuthenticationPanelBase {...signInProps} on={{ submitDetails }} />)

        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "reader@example.com" } })
        fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret" } })
        fireEvent.click(screen.getByRole("button", { name: "Sign in" }))
        expect(submitDetails).toHaveBeenCalledWith({ email: "reader@example.com", password: "secret" })
    })

    it("draws the reset journey with a new password, no confirmation and no exit to itself", () => {
        const changeMode = vi.fn()
        render(<AuthenticationPanelBase {...forgotProps} on={{ changeMode }} />)

        expect(screen.getByLabelText("New password").getAttribute("autocomplete")).toBe("new-password")
        expect(screen.queryByLabelText("Confirm password")).toBeNull()
        expect(screen.queryByRole("link", { name: "Forgot Password?" })).toBeNull()

        // From anywhere that is not the sign-in journey, the last line goes back to signing in.
        fireEvent.click(screen.getByRole("link", { name: "Create an account" }))
        expect(changeMode).toHaveBeenCalledWith("signIn")
    })

    it("announces a refusal and merely shows anything else", () => {
        const refused = {
            ...signInProps,
            props: { ...signInProps.props, statusMessage: "Those details do not match.", isError: true },
        } satisfies typeof signInProps
        const { unmount } = render(<AuthenticationPanelBase {...refused} />)
        expect(screen.getByRole("alert")).toHaveTextContent("Those details do not match.")
        unmount()

        const informing = {
            ...signInProps,
            props: { ...signInProps.props, statusMessage: "Sending your code…", isError: false },
        } satisfies typeof signInProps
        render(<AuthenticationPanelBase {...informing} />)
        expect(screen.queryByRole("alert")).toBeNull()
        expect(screen.getByRole("status")).toHaveTextContent("Sending your code…")
    })

    it("does nothing but refuse a second press while a request is on its way", () => {
        const pending = {
            ...signInProps,
            props: { ...signInProps.props, isPending: true },
        } satisfies typeof signInProps
        render(<AuthenticationPanelBase {...pending} />)

        expect(screen.getByLabelText("Email")).toBeDisabled()
        expect(screen.getByLabelText("Password")).toBeDisabled()
        expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled()
        expect(screen.getByRole("button", { name: "Sign In With Google" })).toBeDisabled()
    })

    it("submits nothing and throws nothing when the panel is wired to no one", () => {
        render(<AuthenticationPanelBase {...signInProps} />)
        fireEvent.click(screen.getByRole("button", { name: "Sign in" }))
        fireEvent.click(screen.getByRole("checkbox", { name: "Remember me" }))
        fireEvent.click(screen.getByRole("link", { name: "Forgot Password?" }))
        fireEvent.click(screen.getByRole("link", { name: "Create an account" }))
        fireEvent.click(screen.getByRole("button", { name: "Sign In With Google" }))
        expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled()
    })

    it("draws the code step as one box, and sends what was typed in it", () => {
        const submitCode = vi.fn()
        render(<AuthenticationPanelBase {...codeProps} on={{ submitCode }} />)

        const box = screen.getByLabelText("One-time code")
        expect(box.getAttribute("autocomplete")).toBe("one-time-code")
        expect(screen.queryByLabelText("Email")).toBeNull()

        fireEvent.change(box, { target: { value: "123456" } })
        fireEvent.click(screen.getByRole("button", { name: "Verify" }))
        expect(submitCode).toHaveBeenCalledWith({ otp: "123456" })
    })

    it("offers a fresh code and a way back to the address, as two separate choices", () => {
        const resend = vi.fn()
        const changeMode = vi.fn()
        render(<AuthenticationPanelBase {...codeProps} on={{ resend, changeMode }} />)

        fireEvent.click(screen.getByRole("link", { name: "Send another code" }))
        expect(resend).toHaveBeenCalledTimes(1)

        fireEvent.click(screen.getByRole("link", { name: "Use another email" }))
        expect(changeMode).toHaveBeenCalledWith("signIn")
    })

    it("announces a refused code beside the box it belongs to", () => {
        const refused = {
            ...codeProps,
            props: { ...codeProps.props, statusMessage: "That code is wrong.", isError: true },
        } satisfies typeof codeProps
        render(<AuthenticationPanelBase {...refused} />)
        expect(screen.getByRole("alert")).toHaveTextContent("That code is wrong.")
    })

    it("puts pending feedback on the verify action and blocks the box behind it", () => {
        const pending = {
            ...codeProps,
            props: { ...codeProps.props, isPending: true },
        } satisfies typeof codeProps
        const { container } = render(<AuthenticationPanelBase {...pending} />)

        expect(screen.getByLabelText("One-time code")).toBeDisabled()
        const submit = screen.getByRole("button", { name: "Verify" })
        expect(submit).toBeDisabled()
        expect(submit.getAttribute("data-action-pending")).toBe("true")
        expect(container.querySelector("[data-slot='spinner']")).toBeTruthy()
    })

    it("submits nothing and throws nothing on the code step with no one wired up", () => {
        render(<AuthenticationPanelBase {...codeProps} />)
        fireEvent.click(screen.getByRole("button", { name: "Verify" }))
        fireEvent.click(screen.getByRole("link", { name: "Send another code" }))
        fireEvent.click(screen.getByRole("link", { name: "Use another email" }))
        expect(screen.getByRole("button", { name: "Verify" })).toBeEnabled()
    })

    it("draws the confirmation as a statement, with no form left to fill in", () => {
        render(<AuthenticationPanelBase {...doneProps} />)

        expect(screen.getByText("You are signed in")).toBeTruthy()
        expect(screen.getByText("Taking you back to where you were")).toBeTruthy()
        expect(screen.queryByRole("button")).toBeNull()
        expect(screen.queryByRole("status")).toBeNull()
    })

    it("ignores a followed phrase that names nothing this panel owns", async () => {
        // The checkbox leaf types `follow` as `(id: string) => void`, so the panel has to decide
        // what an id it did not put in the label means. It means nothing: the reader is not sent
        // to a legal document chosen by whatever the leaf happened to report. The leaf is stood in
        // for here because its own label parts cannot produce a third id, and the guard is exactly
        // the code that would let one through if it were dropped.
        const openLegal = vi.fn()
        vi.resetModules()
        vi.doMock("@/components/leaves/Checkbox", () => ({
            Checkbox: ({ on }: StandInCheckboxProps) => (
                <button type="button" onClick={() => on?.follow?.("newsletter")}>Third phrase</button>
            ),
        }))
        const { AuthenticationPanelBase: Panel } = await import("./component")

        render(<Panel {...signUpProps} on={{ openLegal }} />)
        fireEvent.click(screen.getByRole("button", { name: "Third phrase" }))
        expect(openLegal).not.toHaveBeenCalled()

        vi.doUnmock("@/components/leaves/Checkbox")
        vi.resetModules()
    })

    it("still carries a closing sentence on the confirmation when there is one", () => {
        const withStatus = {
            ...doneProps,
            props: { ...doneProps.props, statusMessage: "Your password has been changed.", isError: false },
        } satisfies typeof doneProps
        render(<AuthenticationPanelBase {...withStatus} />)
        expect(screen.getByRole("status")).toHaveTextContent("Your password has been changed.")
    })
})
