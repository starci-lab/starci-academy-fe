/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { _AuthenticationPanel, type AuthenticationPanelProps } from "./component"

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

describe("_AuthenticationPanel", () => {
    it("ports the legacy sign-up anatomy: two password fields and a real checkbox", () => {
        const openLegal = vi.fn()
        const { container } = render(<_AuthenticationPanel {...signUpProps} on={{ openLegal }} />)

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
        render(<_AuthenticationPanel {...signUpProps} on={{ submitDetails }} />)

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
        const { container } = render(<_AuthenticationPanel {...pending} />)

        const submit = screen.getByRole("button", { name: "Create account" })
        expect(submit.getAttribute("data-action-pending")).toBe("true")
        expect(container.querySelector("[data-slot='spinner']")).toBeTruthy()
    })

    it("separates independent credential blocks with the local gap", () => {
        const { container } = render(<_AuthenticationPanel {...signUpProps} />)
        const credentials = container.querySelector("[data-node='stacked-peer-controls']")

        expect(credentials?.className).toContain("gap-3")
        expect(credentials?.className).not.toContain("gap-2")
        expect(container.querySelector("[data-node='label-field-hint']")?.className).toContain("gap-3")
    })
})
