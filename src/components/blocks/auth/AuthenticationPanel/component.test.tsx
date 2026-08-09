/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import { contractSpec } from "@/components/contracts"
import { KeycloakIdentityProvider } from "@/modules/api/graphql/mutations/types/auth"
import {
    AUTHENTICATION_PANEL_TITLE_ID,
    _AuthenticationPanel,
    type AuthenticationPanelLabels,
    type AuthenticationPanelMode,
    type AuthenticationPanelProps,
    type AuthenticationPanelStatus,
    type AuthenticationPanelStep,
} from "./component"

/**
 * What these tests guard: that ONE panel really does draw three journeys, and that each state of
 * each journey offers exactly the controls it should - no more, and no fewer.
 *
 * The "no fewer" half is the owner's complaint written as assertions: a sign-in with no way to
 * reach the identity providers, no way to reach a password reset and no way to open an account is
 * a dead end for every reader who is not already a customer. The "no more" half is the density: a
 * reset journey does not show provider buttons, a code step does not show a password box, and a
 * journey that is over does not show a disabled copy of the form it has finished with.
 *
 * The terms row is here for a different reason again. It is the only thing on this surface that
 * can refuse a submission before it is attempted, and a gate that lets the form through anyway is
 * worse than no gate at all - so it is checked on the button AND on the submit event.
 */

/** Copy every test renders with; the panel resolves none of it itself. */
const labels: AuthenticationPanelLabels = {
    title: "Sign in",
    emailLabel: "Email",
    emailHint: "",
    passwordLabel: "Password",
    passwordHint: "",
    codeLabel: "One-time code",
    codeHint: "Sent to learner@example.com.",
    submit: "Continue",
    resend: "Send a new code",
    useAnotherEmail: "Use a different email",
    oauthGoogle: "Continue with Google",
    oauthGithub: "Continue with GitHub",
    agreeToTerms: "I agree to the terms",
    switchToSignIn: "Sign in instead",
    switchToSignUp: "Create an account",
    switchToForgotPassword: "Forgot your password?",
    doneTitle: "You are signed in",
    doneHint: "You can carry on where you were.",
}

/** What one rendering varies. Everything absent takes the resting default below. */
interface DrawParams {
    /** Which journey. */
    mode?: AuthenticationPanelMode
    /** Which step of it. */
    step?: AuthenticationPanelStep
    /** What just happened. */
    status?: AuthenticationPanelStatus
    /** The resolved sentence for the status. */
    statusMessage?: string
    /** Whether the reader has accepted the terms. */
    hasAgreedToTerms?: boolean
    /** The title-line slot a floating host would hand in. */
    slots?: AuthenticationPanelProps["slots"]
    /** Renders every slot in its resting state. */
    isLoading?: boolean
}

/** Handlers shared by one rendering, so a test can read what the panel called. */
const spies = () => ({
    onSubmitDetails: vi.fn(),
    onSubmitCode: vi.fn(),
    onResend: vi.fn(),
    onChangeMode: vi.fn(),
    onChangeAgreedToTerms: vi.fn(),
    onOauthPress: vi.fn(),
})

/** Render the panel with the shared copy and a fresh set of spies. */
const draw = ({
    mode = "signIn",
    step = "details",
    status = "idle",
    statusMessage = "",
    hasAgreedToTerms = false,
    slots = {},
    isLoading = false,
}: DrawParams = {}) => {
    const handlers = spies()
    const view = render(
        <_AuthenticationPanel
            mode={mode}
            step={step}
            status={status}
            statusMessage={statusMessage}
            hasAgreedToTerms={hasAgreedToTerms}
            labels={labels}
            slots={slots}
            isLoading={isLoading}
            {...handlers}
        />,
    )
    return { ...view, handlers }
}

/** Every button label currently on screen, in document order. */
const buttonLabels = (container: HTMLElement): Array<string> =>
    [...container.querySelectorAll("button")].map((button) => button.textContent ?? "")

/** The button whose label is exactly this. */
const buttonNamed = (container: HTMLElement, label: string): HTMLButtonElement =>
    [...container.querySelectorAll("button")]
        .find((button) => button.textContent === label) as HTMLButtonElement

/** The live region the panel is currently reporting through. */
const statusLine = (container: HTMLElement): HTMLElement | null =>
    container.querySelector("[role='alert'], [role='status']")

afterEach(() => {
    cleanup()
})

describe("_AuthenticationPanel - the shape it draws", () => {
    it("puts the title and the host's way out on one registry node", () => {
        const Dismiss = () => <button type="button">Close</button>
        const { container } = draw({ slots: { action: Dismiss } })
        const header = container.querySelector("[data-node='page-header']")
        expect(header?.getAttribute("data-roles")).toBe("heading action")
        expect(header?.getAttribute("class")).toBe(contractSpec("page-header").classes)
        expect(header?.querySelector("button")?.textContent).toBe("Close")
    })

    it("names itself through an id a floating host can point a dialog at", () => {
        const { container } = draw()
        expect(container.querySelector(`#${AUTHENTICATION_PANEL_TITLE_ID}`)?.textContent).toBe("Sign in")
    })

    it("draws no way out when the host hands none in", () => {
        const { container } = draw()
        expect(buttonLabels(container)).not.toContain("Close")
    })

    it("carries the whole submission on the `form` key, outcome line between controls and button", () => {
        const { container } = draw()
        const form = container.querySelector("[data-node='form']")
        expect(form?.getAttribute("data-roles")).toBe("body meta action footer")
        expect(form?.getAttribute("class")).toBe(contractSpec("form").classes)
    })
})

describe("_AuthenticationPanel - signing in", () => {
    it("offers both identity providers, the credentials, and both ways out of a dead end", () => {
        const { container } = draw()
        const found = buttonLabels(container)
        expect(found).toContain(labels.oauthGoogle)
        expect(found).toContain(labels.oauthGithub)
        expect(found).toContain(labels.switchToForgotPassword)
        expect(found).toContain(labels.switchToSignUp)
        expect(container.querySelector("#authentication-email")).not.toBeNull()
        expect(container.querySelector("#authentication-password")).not.toBeNull()
    })

    it("says nothing before anything has been attempted", () => {
        const { container } = draw()
        expect(statusLine(container)).toBeNull()
    })

    it("hands the typed details up on submit", () => {
        const { container, handlers } = draw()
        fireEvent.change(container.querySelector("#authentication-email") as HTMLInputElement, {
            target: { value: "learner@example.com" },
        })
        fireEvent.change(container.querySelector("#authentication-password") as HTMLInputElement, {
            target: { value: "secret" },
        })
        fireEvent.submit(container.querySelector("form") as HTMLFormElement)
        expect(handlers.onSubmitDetails).toHaveBeenCalledWith({
            email: "learner@example.com",
            password: "secret",
        })
    })

    it("refuses a second submission while the first is in flight", () => {
        const { container, handlers } = draw({ status: "sending", statusMessage: "Checking your details" })
        expect(buttonNamed(container, labels.submit).disabled).toBe(true)
        fireEvent.submit(container.querySelector("form") as HTMLFormElement)
        expect(handlers.onSubmitDetails).not.toHaveBeenCalled()
        expect(statusLine(container)?.getAttribute("role")).toBe("status")
    })

    it("leaves for the provider the reader pressed", () => {
        const { container, handlers } = draw()
        fireEvent.click(buttonNamed(container, labels.oauthGoogle))
        expect(handlers.onOauthPress).toHaveBeenCalledWith(KeycloakIdentityProvider.Google)
        fireEvent.click(buttonNamed(container, labels.oauthGithub))
        expect(handlers.onOauthPress).toHaveBeenCalledWith(KeycloakIdentityProvider.Github)
    })

    it("switches journeys rather than routing away", () => {
        const { container, handlers } = draw()
        fireEvent.click(buttonNamed(container, labels.switchToSignUp))
        expect(handlers.onChangeMode).toHaveBeenCalledWith("signUp")
        fireEvent.click(buttonNamed(container, labels.switchToForgotPassword))
        expect(handlers.onChangeMode).toHaveBeenCalledWith("forgotPassword")
    })
})

describe("_AuthenticationPanel - opening an account", () => {
    it("asks for the agreement, and refuses the submission until it is given", () => {
        const { container, handlers } = draw({ mode: "signUp" })
        expect(buttonLabels(container)).toContain(labels.agreeToTerms)
        expect(buttonNamed(container, labels.submit).disabled).toBe(true)
        fireEvent.submit(container.querySelector("form") as HTMLFormElement)
        expect(handlers.onSubmitDetails).not.toHaveBeenCalled()
    })

    it("lets the submission through once it has been", () => {
        const { container, handlers } = draw({ mode: "signUp", hasAgreedToTerms: true })
        expect(buttonNamed(container, labels.submit).disabled).toBe(false)
        fireEvent.submit(container.querySelector("form") as HTMLFormElement)
        expect(handlers.onSubmitDetails).toHaveBeenCalledTimes(1)
    })

    it("toggles the agreement rather than only ever setting it", () => {
        const { container, handlers } = draw({ mode: "signUp", hasAgreedToTerms: true })
        fireEvent.click(buttonNamed(container, labels.agreeToTerms))
        expect(handlers.onChangeAgreedToTerms).toHaveBeenCalledWith(false)
    })

    it("offers the way back to signing in, and only that one", () => {
        const { container } = draw({ mode: "signUp" })
        const found = buttonLabels(container)
        expect(found).toContain(labels.switchToSignIn)
        expect(found).not.toContain(labels.switchToSignUp)
    })
})

describe("_AuthenticationPanel - resetting a password", () => {
    it("does not offer the providers, because a reset is not a way in", () => {
        const { container } = draw({ mode: "forgotPassword" })
        const found = buttonLabels(container)
        expect(found).not.toContain(labels.oauthGoogle)
        expect(found).not.toContain(labels.oauthGithub)
    })

    it("asks for the new password in the same position, and for no agreement", () => {
        const { container } = draw({ mode: "forgotPassword" })
        expect(container.querySelector("#authentication-password")).not.toBeNull()
        expect(buttonLabels(container)).not.toContain(labels.agreeToTerms)
    })
})

describe("_AuthenticationPanel - the code step", () => {
    it("replaces the credentials with the code, and says where it went", () => {
        const { container } = draw({ step: "code", status: "sent", statusMessage: "We sent a code" })
        expect(container.querySelector("#authentication-email")).toBeNull()
        expect(container.querySelector("#authentication-password")).toBeNull()
        const code = container.querySelector("#authentication-code")
        expect(code).not.toBeNull()
        expect(code?.getAttribute("autocomplete")).toBe("one-time-code")
        expect(container.textContent).toContain(labels.codeHint)
    })

    it("hands the typed code up on submit", () => {
        const { container, handlers } = draw({ step: "code", status: "sent", statusMessage: "We sent a code" })
        fireEvent.change(container.querySelector("#authentication-code") as HTMLInputElement, {
            target: { value: "123456" },
        })
        fireEvent.submit(container.querySelector("form") as HTMLFormElement)
        expect(handlers.onSubmitCode).toHaveBeenCalledWith({ otp: "123456" })
        expect(handlers.onSubmitDetails).not.toHaveBeenCalled()
    })

    it("interrupts a reader with a refusal rather than mentioning it in passing", () => {
        const { container } = draw({ step: "code", status: "error", statusMessage: "That code was not right." })
        expect(statusLine(container)?.getAttribute("role")).toBe("alert")
        expect(statusLine(container)?.textContent).toBe("That code was not right.")
        expect(container.querySelector("#authentication-code")?.getAttribute("aria-invalid")).toBe("true")
    })

    it("keeps the typed code on screen after a refusal, instead of emptying the box", () => {
        const { container, rerender } = draw({ step: "code", status: "sent", statusMessage: "We sent a code" })
        fireEvent.change(container.querySelector("#authentication-code") as HTMLInputElement, {
            target: { value: "123456" },
        })
        rerender(
            <_AuthenticationPanel
                mode="signIn"
                step="code"
                status="error"
                statusMessage="That code was not right."
                hasAgreedToTerms={false}
                labels={labels}
                slots={{}}
                onSubmitDetails={vi.fn()}
                onSubmitCode={vi.fn()}
                onResend={vi.fn()}
                onChangeMode={vi.fn()}
                onChangeAgreedToTerms={vi.fn()}
                onOauthPress={vi.fn()}
            />,
        )
        expect((container.querySelector("#authentication-code") as HTMLInputElement).value).toBe("123456")
    })

    it("offers a fresh code, and a way back to the address it went to", () => {
        const { container, handlers } = draw({ step: "code", status: "sent", statusMessage: "We sent a code" })
        fireEvent.click(buttonNamed(container, labels.resend))
        expect(handlers.onResend).toHaveBeenCalledTimes(1)
        fireEvent.click(buttonNamed(container, labels.useAnotherEmail))
        expect(handlers.onChangeMode).toHaveBeenCalledWith("signIn")
    })

    it("locks the resend while one is already on its way", () => {
        const { container } = draw({ step: "code", status: "resending", statusMessage: "Sending a new code" })
        expect(buttonNamed(container, labels.resend).disabled).toBe(true)
    })
})

describe("_AuthenticationPanel - once the journey is over", () => {
    it("draws the confirmation instead of a dead copy of the form", () => {
        const { container } = draw({ step: "done", status: "signedIn", statusMessage: "Signed in" })
        expect(container.querySelector("form")).toBeNull()
        expect(container.textContent).toContain(labels.doneTitle)
        expect(container.textContent).toContain(labels.doneHint)
    })

    it("still names itself, so a dialog around it does not lose its name", () => {
        const { container } = draw({ step: "done", status: "signedIn", statusMessage: "Signed in" })
        expect(container.querySelector(`#${AUTHENTICATION_PANEL_TITLE_ID}`)?.textContent).toBe(labels.doneTitle)
    })
})

describe("_AuthenticationPanel - at rest", () => {
    it("rests as the same tree rather than as a second one", () => {
        const { container } = draw({ isLoading: true })
        expect(container.querySelector("[data-node='form']")).not.toBeNull()
        expect(container.querySelector("[data-node='form-field']")).not.toBeNull()
        expect(container.querySelector("button")?.getAttribute("data-loading")).toBe("true")
    })
})
