/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { useAuthPanel } from "@/hooks/auth/useAuthPanel"
import { AuthenticationPanel } from "./index"

vi.mock("next-intl", () => ({
    useLocale: () => "vi",
    useTranslations: () => (key: string, values?: Record<string, string | number>) => {
        if (key === "shared.codeHint") return `sent to ${values?.email}`
        if (key === "expiry.minutes") return `, good for ${values?.count} minutes`
        if (key === "expiry.seconds") return `, good for ${values?.count} seconds`
        return key
    },
}))

vi.mock("@/hooks/auth/useAuthPanel", () => ({ useAuthPanel: vi.fn() }))

/** Put the machine in one situation and hand back the callbacks it exposes. */
const stub = (over: Record<string, unknown>) => {
    const on = {
        onSubmitDetails: vi.fn(),
        onSubmitCode: vi.fn(),
        onResend: vi.fn(),
        onChangeMode: vi.fn(),
        onChangeAgreedToTerms: vi.fn(),
        onChangeRememberMe: vi.fn(),
        onOauthPress: vi.fn(),
    }
    vi.mocked(useAuthPanel).mockReturnValue({
        mode: "signIn",
        step: "details",
        sentCount: 0,
        hasAgreedToTerms: false,
        rememberMe: false,
        isPending: false,
        isResending: false,
        ...on,
        ...over,
    } as never)
    return on
}

/** The panel mounted by a surface that hands it an empty props object. */
const BareAuthenticationPanel = () => AuthenticationPanel({})

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
})

describe("AuthenticationPanel", () => {
    it("opens on the sign-in journey when the surface names none", () => {
        stub({})

        render(<AuthenticationPanel />)

        expect(useAuthPanel).toHaveBeenCalledExactlyOnceWith({ initialMode: "signIn", initialStep: "details", onSignedIn: undefined })
        expect(screen.getByRole("heading", { name: "signIn.title" })).toBeInTheDocument()
        expect(screen.getByText("signIn.subtitle")).toBeInTheDocument()
        expect(screen.queryByRole("status")).toBeNull()
        expect(screen.queryByRole("alert")).toBeNull()
    })

    it("mounts with no argument at all and still opens on the sign-in journey", () => {
        stub({})

        render(<BareAuthenticationPanel />)

        expect(useAuthPanel).toHaveBeenCalledExactlyOnceWith({ initialMode: "signIn", initialStep: "details", onSignedIn: undefined })
        expect(screen.getByRole("heading", { name: "signIn.title" })).toBeInTheDocument()
    })

    it("carries the journey the opening control chose, and who to tell once it ends", () => {
        const onSignedIn = vi.fn()
        stub({ mode: "signUp" })

        render(<AuthenticationPanel initialMode="signUp" onSignedIn={onSignedIn} />)

        expect(useAuthPanel).toHaveBeenCalledExactlyOnceWith({ initialMode: "signUp", initialStep: "details", onSignedIn })
        expect(screen.getByRole("heading", { name: "signUp.title" })).toBeInTheDocument()
        expect(screen.getByLabelText("signUp.confirmPasswordLabel")).toBeInTheDocument()
        expect(screen.getByRole("checkbox", { name: "shared.agreeToTerms" })).toBeInTheDocument()
    })

    it("keeps details pending feedback inside the action instead of repeating a status line", () => {
        stub({ isPending: true })

        render(<AuthenticationPanel />)

        expect(screen.queryByText("status.sending")).toBeNull()
        expect(screen.getByRole("button", { name: /signIn\.submitDetails$/ })).toHaveAttribute("data-pending", "true")
    })

    it("keeps verification pending feedback inside the action instead of repeating a status line", () => {
        stub({ step: "code", isPending: true, sentCount: 1, email: "reader@example.com" })

        render(<AuthenticationPanel />)

        expect(screen.queryByText("status.verifying")).toBeNull()
        expect(screen.getByRole("button", { name: /signIn\.submitCode$/ })).toHaveAttribute("data-pending", "true")
    })

    it("keeps resend pending feedback inside the action instead of a second status line", () => {
        stub({ step: "code", isResending: true, sentCount: 1, email: "reader@example.com" })

        render(<AuthenticationPanel />)

        expect(screen.queryByText("status.resending")).toBeNull()
        expect(screen.getByRole("button", { name: /shared\.resend$/ })).toHaveAttribute(
            "data-action-pending",
            "true",
        )
    })

    it("makes the current OTP task the heading and its stable guidance the description", () => {
        stub({ step: "code", sentCount: 1, email: "reader@example.com" })

        render(<AuthenticationPanel />)

        const title = screen.getByRole("heading", { name: "shared.codeTitle" })
        const description = screen.getByText("shared.codeDescription")
        expect(title.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(screen.queryByRole("status")).toBeNull()
        expect(screen.queryByText("signIn.title")).toBeNull()
        expect(screen.queryByText("signIn.subtitle")).toBeNull()
        expect(screen.getByText("sent to reader@example.com")).toBeInTheDocument()
    })

    it("distinguishes a code just resent from the first one", () => {
        stub({ step: "code", sentCount: 2, email: "reader@example.com" })

        render(<AuthenticationPanel />)

        expect(screen.getByRole("status")).toHaveTextContent("status.resent")
    })

    it("names the reader's own address rather than an empty one when it does not know it", () => {
        stub({ step: "code", sentCount: 1 })

        render(<AuthenticationPanel />)

        expect(screen.getByText("sent to shared.yourEmail")).toBeInTheDocument()
    })

    it("says how long a code lives in minutes when the server sent a figure", () => {
        stub({ step: "code", sentCount: 1, email: "reader@example.com", expiresInSeconds: 600 })

        render(<AuthenticationPanel />)

        expect(screen.getByText("sent to reader@example.com, good for 10 minutes")).toBeInTheDocument()
    })

    it("keeps a short-lived code in seconds rather than rounding it away to zero minutes", () => {
        stub({ step: "code", sentCount: 1, email: "reader@example.com", expiresInSeconds: 20 })

        render(<AuthenticationPanel />)

        expect(screen.getByText("sent to reader@example.com, good for 20 seconds")).toBeInTheDocument()
    })

    it("promises nothing about a lifetime the server never sent", () => {
        stub({ step: "code", sentCount: 1, email: "reader@example.com" })

        render(<AuthenticationPanel />)

        expect(screen.getByText("sent to reader@example.com")).toBeInTheDocument()
    })

    it("promises nothing about a lifetime that has already run out", () => {
        stub({ step: "code", sentCount: 1, email: "reader@example.com", expiresInSeconds: -30 })

        render(<AuthenticationPanel />)

        expect(screen.getByText("sent to reader@example.com")).toBeInTheDocument()
    })

    it("refuses to blame the code when the request never reached a verdict", () => {
        stub({ step: "code", sentCount: 1, failure: { isTransport: true, message: "Invalid code." } })

        render(<AuthenticationPanel />)

        expect(screen.getByRole("alert")).toHaveTextContent("status.transport")
        expect(screen.queryByText("Invalid code.")).toBeNull()
    })

    it("prefers the server's own sentence to any of ours", () => {
        stub({ failure: { isTransport: false, message: "That password is not right." } })

        render(<AuthenticationPanel />)

        expect(screen.getByRole("alert")).toHaveTextContent("That password is not right.")
    })

    it("localizes the stable credential refusal instead of leaking the Keycloak boundary copy", () => {
        stub({
            failure: {
                isTransport: false,
                code: "KEYCLOAK_LOGIN_FAILED_EXCEPTION",
                message: "Invalid email or password.",
            },
        })

        render(<AuthenticationPanel />)

        expect(screen.getByRole("alert")).toHaveTextContent("status.credentialsRefused")
        expect(screen.queryByText("Invalid email or password.")).toBeNull()
    })

    it("localizes an existing verified email and points to the visible sign-in recovery", () => {
        stub({
            mode: "signUp",
            failure: {
                isTransport: false,
                code: "USER_EMAIL_ALREADY_VERIFIED_EXCEPTION",
                message: "User email is already verified",
            },
        })

        render(<AuthenticationPanel />)

        expect(screen.getByRole("alert")).toHaveTextContent("status.accountExists")
        expect(screen.getByRole("button", { name: "signUp.promptAction" })).toBeInTheDocument()
        expect(screen.queryByText("User email is already verified")).toBeNull()
    })

    it("localizes a stable OTP refusal instead of leaking the domain boundary copy", () => {
        stub({
            step: "code",
            sentCount: 1,
            failure: {
                isTransport: false,
                code: "CHALLENGE_OTP_MISMATCH_EXCEPTION",
                message: "Challenge OTP mismatch",
            },
        })

        render(<AuthenticationPanel />)

        expect(screen.getByRole("alert")).toHaveTextContent("status.otpRefused")
        expect(screen.queryByText("Challenge OTP mismatch")).toBeNull()
    })

    it("localizes a missing OTP challenge as an expired-code restart", () => {
        stub({
            step: "details",
            sentCount: 0,
            failure: {
                isTransport: false,
                code: "CHALLENGE_OTP_NOT_FOUND_EXCEPTION",
                message: "Challenge not found",
            },
        })

        render(<AuthenticationPanel />)

        expect(screen.getByRole("alert")).toHaveTextContent("status.otpExpired")
        expect(screen.queryByText("Challenge not found")).toBeNull()
    })

    it("renders a rate-limit cooldown instead of a transport outage", () => {
        stub({
            failure: {
                isTransport: false,
                code: "RATE_LIMITED",
                retryAfterSeconds: 17,
            },
        })

        render(<AuthenticationPanel />)

        expect(screen.getByRole("alert")).toHaveTextContent("status.rateLimitedWithWait")
        expect(screen.queryByText("status.transport")).toBeNull()
    })

    it("still says the attempt was refused when the server refused without saying why", () => {
        stub({ failure: { isTransport: false, code: "AUTH_REFUSED" } })

        render(<AuthenticationPanel />)

        expect(screen.getByRole("alert")).toHaveTextContent("status.refused")
    })

    it("closes on a confirmation that says the reader is in", () => {
        stub({ step: "done" })

        render(<AuthenticationPanel />)

        expect(screen.getByText("signIn.doneTitle")).toBeInTheDocument()
        expect(screen.getByText("signIn.doneHint")).toBeInTheDocument()
        expect(screen.getByRole("status")).toHaveTextContent("status.signedIn")
    })

    it("hands the details, the code and the resend straight to the machine", () => {
        const details = stub({})
        const { unmount } = render(<AuthenticationPanel />)

        fireEvent.change(screen.getByLabelText("shared.emailLabel"), { target: { value: "reader@example.com" } })
        fireEvent.change(screen.getByLabelText("signIn.passwordLabel"), { target: { value: "secret" } })
        fireEvent.click(screen.getByRole("button", { name: "signIn.submitDetails" }))
        expect(details.onSubmitDetails).toHaveBeenCalledExactlyOnceWith({
            email: "reader@example.com",
            password: "secret",
        })
        unmount()

        const code = stub({ step: "code", sentCount: 1, email: "reader@example.com" })
        render(<AuthenticationPanel />)

        fireEvent.change(screen.getByLabelText("shared.codeLabel"), { target: { value: "123456" } })
        fireEvent.click(screen.getByRole("button", { name: "signIn.submitCode" }))
        expect(code.onSubmitCode).toHaveBeenCalledExactlyOnceWith({ otp: "123456" })

        fireEvent.click(screen.getByRole("button", { name: "shared.resend" }))
        expect(code.onResend).toHaveBeenCalledOnce()
    })

    it("switches journeys through the machine rather than locally", () => {
        const on = stub({})

        render(<AuthenticationPanel />)

        fireEvent.click(screen.getByRole("button", { name: "signIn.promptAction" }))
        expect(on.onChangeMode).toHaveBeenCalledExactlyOnceWith("signUp")

        fireEvent.click(screen.getByRole("button", { name: "shared.forgotPassword" }))
        expect(on.onChangeMode).toHaveBeenLastCalledWith("forgotPassword")
    })

    it("records the remembered session and the agreement on the machine", () => {
        const signIn = stub({})
        const { unmount } = render(<AuthenticationPanel />)

        fireEvent.click(screen.getByRole("checkbox", { name: "shared.rememberMe" }))
        expect(signIn.onChangeRememberMe).toHaveBeenCalledExactlyOnceWith(true)
        unmount()

        const signUp = stub({ mode: "signUp" })
        render(<AuthenticationPanel />)

        fireEvent.click(screen.getByRole("checkbox", { name: "shared.agreeToTerms" }))
        expect(signUp.onChangeAgreedToTerms).toHaveBeenCalledExactlyOnceWith(true)
    })

    it("names the identity provider each shortcut leaves for", () => {
        const on = stub({})

        render(<AuthenticationPanel />)

        fireEvent.click(screen.getByRole("button", { name: "shared.oauthGoogle" }))
        expect(on.onOauthPress).toHaveBeenCalledExactlyOnceWith("google")

        fireEvent.click(screen.getByRole("button", { name: "shared.oauthGithub" }))
        expect(on.onOauthPress).toHaveBeenLastCalledWith("github")
    })

    it("gives legal documents real localized destinations that preserve the form", () => {
        stub({ mode: "signUp" })

        render(<AuthenticationPanel />)

        expect(screen.getByRole("link", { name: "shared.termsLabel" })).toHaveAttribute(
            "href",
            "https://academy.starci.org/vi/terms",
        )
        expect(screen.getByRole("link", { name: "shared.termsLabel" })).toHaveAttribute("target", "_blank")
        expect(screen.getByRole("link", { name: "shared.privacyLabel" })).toHaveAttribute(
            "href",
            "https://academy.starci.org/vi/privacy",
        )
    })
})
