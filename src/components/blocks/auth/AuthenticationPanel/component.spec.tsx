/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
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
        termsHref: "https://academy.starci.org/en/terms",
        andLabel: "and",
        privacyLabel: "Privacy Policy",
        privacyHref: "https://academy.starci.org/en/privacy",
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
        codeHint: "Six digits",
        submitLabel: "Verify",
        resendLabel: "Send another code",
        useAnotherEmailLabel: "Use another email",
    },
}

it("keeps secret-bearing server-rendered controls disabled until hydration", () => {
    const host = document.createElement("div")
    host.innerHTML = renderToString(<AuthenticationPanelBase {...signInProps} />)

    expect(host.querySelector("input[name=\"email\"]")).toBeDisabled()
    expect(host.querySelector("input[name=\"password\"]")).toBeDisabled()
    expect(host.querySelector("button[type=\"submit\"]")).toBeDisabled()
})

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
        const { container } = render(<AuthenticationPanelBase {...signUpProps} />)

        expect(screen.getByLabelText("Choose a password").getAttribute("autocomplete")).toBe("new-password")
        expect(screen.getByLabelText("Confirm password").getAttribute("autocomplete")).toBe("new-password")
        expect(screen.getByRole("checkbox", { name: "I agree to the terms" })).toBeTruthy()
        expect(container.querySelector("[data-slot='checkbox-control']")).toBeTruthy()
        expect(screen.getByRole("link", { name: "Terms of Service" })).toHaveAttribute(
            "href",
            "https://academy.starci.org/en/terms",
        )
        expect(screen.getByRole("link", { name: "Terms of Service" })).toHaveAttribute("target", "_blank")
        expect(screen.getByRole("link", { name: "Terms of Service" })).toHaveAttribute(
            "rel",
            "noopener noreferrer",
        )
        expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
            "href",
            "https://academy.starci.org/en/privacy",
        )
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

        const submit = screen.getByRole("button", { name: /Create account$/ })
        expect(submit).toBeDisabled()
    })

    it("separates independent credential blocks with the local gap", () => {
        render(<AuthenticationPanelBase {...signUpProps} />)
        expect(screen.getByLabelText("Choose a password")).toBeInTheDocument()
        expect(screen.getByLabelText("Confirm password")).toBeInTheDocument()
    })

    it("keeps OAuth shortcuts outlined instead of styling them as secondary actions", () => {
        render(<AuthenticationPanelBase {...signUpProps} />)

        expect(screen.getByRole("button", { name: "Sign In With Google" })).toHaveClass("button--outline")
        expect(screen.getByRole("button", { name: "Sign In With GitHub" })).toHaveClass("button--outline")
    })

    it("names the provider each shortcut hands off to", () => {
        const oauthPress = vi.fn()
        render(<AuthenticationPanelBase {...signUpProps} on={{ oauthPress }} />)

        fireEvent.click(screen.getByRole("button", { name: "Sign In With Google" }))
        expect(oauthPress).toHaveBeenLastCalledWith("google")

        fireEvent.click(screen.getByRole("button", { name: "Sign In With GitHub" }))
        expect(oauthPress).toHaveBeenLastCalledWith("github")
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

        fireEvent.click(screen.getByRole("button", { name: "Forgot Password?" }))
        expect(changeMode).toHaveBeenLastCalledWith("forgotPassword")

        fireEvent.click(screen.getByRole("button", { name: "Create an account" }))
        expect(changeMode).toHaveBeenLastCalledWith("signUp")
    })

    it("keeps the sign-in happy states inside the owned flex composition", () => {
        const details = render(<AuthenticationPanelBase {...signInProps} />)
        const detailsRoot = details.container.firstElementChild
        expect(detailsRoot).toHaveClass("mx-auto", "flex", "w-full", "max-w-md", "flex-col", "gap-6")
        expect(detailsRoot?.querySelector("header")).toHaveClass(
            "flex",
            "flex-col",
            "items-center",
            "gap-3",
            "text-center",
        )
        expect(detailsRoot?.querySelector("form")).toHaveClass("flex", "flex-col", "gap-4")
        expect(screen.getByRole("button", { name: "Forgot Password?" }).parentElement).toHaveClass(
            "flex",
            "flex-row",
            "items-center",
            "justify-between",
            "gap-3",
        )
        expect(screen.getByRole("button", { name: "Create an account" }).parentElement).toHaveClass(
            "flex",
            "flex-row",
            "items-center",
            "justify-center",
            "gap-2",
        )
        details.unmount()

        const code = render(<AuthenticationPanelBase {...codeProps} />)
        const codeRoot = code.container.firstElementChild
        expect(codeRoot).toHaveClass("mx-auto", "flex", "w-full", "max-w-md", "flex-col", "gap-6")
        expect(codeRoot?.querySelector("form")).toHaveClass("flex", "flex-col", "gap-4")
        expect(screen.getByRole("button", { name: "Send another code" }).parentElement).toHaveClass(
            "flex",
            "flex-row",
            "items-center",
            "justify-center",
            "gap-2",
        )
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
        expect(screen.queryByRole("button", { name: "Forgot Password?" })).toBeNull()

        // From anywhere that is not the sign-in journey, the last line goes back to signing in.
        fireEvent.click(screen.getByRole("button", { name: "Create an account" }))
        expect(changeMode).toHaveBeenCalledWith("signIn")
    })

    it("announces a refusal and merely shows anything else", () => {
        const refused = {
            ...signInProps,
            props: { ...signInProps.props, statusMessage: "Those details do not match.", isError: true },
        } satisfies typeof signInProps
        const { unmount } = render(<AuthenticationPanelBase {...refused} />)
        expect(screen.getByRole("alert")).toHaveTextContent("Those details do not match.")
        expect(screen.getByRole("alert")).toHaveAttribute("slot", "errorMessage")
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
        expect(screen.getByRole("button", { name: /Sign in$/ })).toBeDisabled()
        expect(screen.getByRole("button", { name: /Sign in$/ })).toHaveTextContent("Sign in")
        expect(screen.getByRole("button", { name: "Sign In With Google" })).toBeDisabled()
    })

    it("submits nothing and throws nothing when the panel is wired to no one", () => {
        render(<AuthenticationPanelBase {...signInProps} />)
        fireEvent.click(screen.getByRole("button", { name: "Sign in" }))
        fireEvent.click(screen.getByRole("checkbox", { name: "Remember me" }))
        fireEvent.click(screen.getByRole("button", { name: "Forgot Password?" }))
        fireEvent.click(screen.getByRole("button", { name: "Create an account" }))
        fireEvent.click(screen.getByRole("button", { name: "Sign In With Google" }))
        expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled()
    })

    it("draws the code step with the standard segmented OTP control, and sends what was typed in it", () => {
        const submitCode = vi.fn()
        const { container } = render(<AuthenticationPanelBase {...codeProps} on={{ submitCode }} />)

        const box = screen.getByLabelText("One-time code")
        expect(box.getAttribute("autocomplete")).toBe("one-time-code")
        expect(box).toHaveAttribute("maxlength", "6")
        expect(box).toHaveAttribute("pattern", "^\\d+$")
        expect(container.querySelectorAll("[data-slot='input-otp-slot']")).toHaveLength(6)
        expect(screen.queryByLabelText("Email")).toBeNull()

        fireEvent.change(box, { target: { value: "123456" } })
        fireEvent.click(screen.getByRole("button", { name: "Verify" }))
        expect(submitCode).toHaveBeenCalledWith({ otp: "123456" })
    })

    it("offers a fresh code and a way back to the address, as two separate choices", () => {
        const resend = vi.fn()
        const changeMode = vi.fn()
        render(<AuthenticationPanelBase {...codeProps} on={{ resend, changeMode }} />)

        fireEvent.click(screen.getByRole("button", { name: "Send another code" }))
        expect(resend).toHaveBeenCalledTimes(1)

        fireEvent.click(screen.getByRole("button", { name: "Use another email" }))
        expect(changeMode).toHaveBeenCalledWith("signIn")
    })

    it("announces a refused code beside the box it belongs to", () => {
        const refused = {
            ...codeProps,
            props: { ...codeProps.props, statusMessage: "That code is wrong.", isError: true },
        } satisfies typeof codeProps
        render(<AuthenticationPanelBase {...refused} />)
        expect(screen.getByRole("alert")).toHaveTextContent("That code is wrong.")
        expect(screen.getByRole("alert")).toHaveAttribute("slot", "errorMessage")
    })

    it("puts pending feedback on the verify action and blocks the box behind it", () => {
        const pending = {
            ...codeProps,
            props: { ...codeProps.props, isPending: true },
        } satisfies typeof codeProps
        const { container } = render(<AuthenticationPanelBase {...pending} />)

        expect(screen.getByLabelText("One-time code")).toBeDisabled()
        const submit = screen.getByRole("button", { name: /Verify$/ })
        expect(submit).toBeDisabled()
        expect(submit.getAttribute("data-action-pending")).toBe("true")
        expect(container.querySelector("[data-slot='spinner']")).toBeTruthy()
    })

    it("puts resend pending feedback on the resend action and disables both secondary choices", () => {
        const resend = vi.fn()
        const pending = {
            ...codeProps,
            props: { ...codeProps.props, isResending: true },
        } satisfies typeof codeProps
        const { container } = render(<AuthenticationPanelBase {...pending} on={{ resend }} />)

        const action = screen.getByRole("button", { name: /Send another code$/ })
        expect(action).toHaveAttribute("data-action-pending", "true")
        expect(action).toBeDisabled()
        expect(screen.getByRole("button", { name: "Use another email" })).toBeDisabled()
        expect(container.querySelector("[data-slot='spinner']")).toBeTruthy()
        fireEvent.click(action)
        expect(resend).not.toHaveBeenCalled()
    })

    it("submits nothing and throws nothing on the code step with no one wired up", () => {
        render(<AuthenticationPanelBase {...codeProps} />)
        fireEvent.click(screen.getByRole("button", { name: "Verify" }))
        fireEvent.click(screen.getByRole("button", { name: "Send another code" }))
        fireEvent.click(screen.getByRole("button", { name: "Use another email" }))
        expect(screen.getByRole("button", { name: "Verify" })).toBeEnabled()
    })

    it("draws the confirmation as a statement, with no form left to fill in", () => {
        render(<AuthenticationPanelBase {...doneProps} />)

        expect(screen.getByText("You are signed in")).toBeTruthy()
        expect(screen.getByText("Taking you back to where you were")).toBeTruthy()
        expect(screen.queryByRole("button")).toBeNull()
        expect(screen.queryByRole("status")).toBeNull()
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
