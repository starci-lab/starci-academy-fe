/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { useAuthPanel } from "@/hooks/auth/useAuthPanel"
import { AuthenticationPanel } from "./index"

const push = vi.fn()

vi.mock("next-intl", () => ({
    useLocale: () => "vi",
    useTranslations: () => (key: string, values?: Record<string, string | number>) => {
        if (key === "shared.codeHint") return `sent to ${values?.email}`
        if (key === "expiry.minutes") return `, good for ${values?.count} minutes`
        if (key === "expiry.seconds") return `, good for ${values?.count} seconds`
        return key
    },
}))

vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
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

        expect(useAuthPanel).toHaveBeenCalledExactlyOnceWith({ initialMode: "signIn", onSignedIn: undefined })
        expect(screen.getByRole("heading", { name: "signIn.title" })).toBeInTheDocument()
        expect(screen.getByText("signIn.subtitle")).toBeInTheDocument()
        expect(screen.queryByRole("status")).toBeNull()
        expect(screen.queryByRole("alert")).toBeNull()
    })

    it("mounts with no argument at all and still opens on the sign-in journey", () => {
        stub({})

        render(<BareAuthenticationPanel />)

        expect(useAuthPanel).toHaveBeenCalledExactlyOnceWith({ initialMode: "signIn", onSignedIn: undefined })
        expect(screen.getByRole("heading", { name: "signIn.title" })).toBeInTheDocument()
    })

    it("carries the journey the opening control chose, and who to tell once it ends", () => {
        const onSignedIn = vi.fn()
        stub({ mode: "signUp" })

        render(<AuthenticationPanel initialMode="signUp" onSignedIn={onSignedIn} />)

        expect(useAuthPanel).toHaveBeenCalledExactlyOnceWith({ initialMode: "signUp", onSignedIn })
        expect(screen.getByRole("heading", { name: "signUp.title" })).toBeInTheDocument()
        expect(screen.getByLabelText("signUp.confirmPasswordLabel")).toBeInTheDocument()
        expect(screen.getByRole("checkbox", { name: "shared.agreeToTerms" })).toBeInTheDocument()
    })

    it("says a request is on its way while the details are in flight", () => {
        stub({ isPending: true })

        render(<AuthenticationPanel />)

        expect(screen.getByRole("status")).toHaveTextContent("status.sending")
        expect(screen.getByRole("button", { name: "signIn.submitDetails" })).toBeDisabled()
    })

    it("says the code is being checked rather than sent once there is one to check", () => {
        stub({ step: "code", isPending: true, sentCount: 1, email: "reader@example.com" })

        render(<AuthenticationPanel />)

        expect(screen.getByRole("status")).toHaveTextContent("status.verifying")
    })

    it("speaks for the resend itself rather than for the code already sent", () => {
        stub({ step: "code", isResending: true, sentCount: 1, email: "reader@example.com" })

        render(<AuthenticationPanel />)

        expect(screen.getByRole("status")).toHaveTextContent("status.resending")
    })

    it("tells a reader their code is waiting, and where it went", () => {
        stub({ step: "code", sentCount: 1, email: "reader@example.com" })

        render(<AuthenticationPanel />)

        expect(screen.getByRole("status")).toHaveTextContent("status.sent")
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

        fireEvent.click(screen.getByRole("link", { name: "shared.resend" }))
        expect(code.onResend).toHaveBeenCalledOnce()
    })

    it("switches journeys through the machine rather than locally", () => {
        const on = stub({})

        render(<AuthenticationPanel />)

        fireEvent.click(screen.getByRole("link", { name: "signIn.promptAction" }))
        expect(on.onChangeMode).toHaveBeenCalledExactlyOnceWith("signUp")

        fireEvent.click(screen.getByRole("link", { name: "shared.forgotPassword" }))
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

    it("sends a reader to the legal documents in the language they are reading in", () => {
        stub({ mode: "signUp" })

        render(<AuthenticationPanel />)

        fireEvent.click(screen.getByRole("link", { name: "shared.termsLabel" }))
        expect(push).toHaveBeenCalledExactlyOnceWith("https://academy.starci.org/vi/terms")

        fireEvent.click(screen.getByRole("link", { name: "shared.privacyLabel" }))
        expect(push).toHaveBeenLastCalledWith("https://academy.starci.org/vi/privacy")
    })
})
