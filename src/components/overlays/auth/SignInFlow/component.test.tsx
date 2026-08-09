/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import {
    _SignInFlow,
    type SignInFlowLabels,
    type SignInFlowStatus,
    type SignInFlowStep,
} from "@/components/overlays/auth/SignInFlow/component"
import { treeSpec } from "@/components/classNames"

/**
 * What these tests guard, in order of how much a reader loses when it breaks:
 *
 *   1. that what the reader typed SURVIVES a settled request. The registry frame mounts each
 *      slot as a component, so a slot may be remounted whenever this file re-renders - and a
 *      form that empties itself the moment an attempt fails is the worst bug this file can have;
 *   2. that a refusal is an `alert` and everything else is a `status`, because a wrong code
 *      announced as calmly as a code being sent is not announced at all;
 *   3. that the step decides which controls exist, so a code cannot be typed into a form that
 *      has not asked for one yet.
 */

const labels: SignInFlowLabels = {
    emailLabel: "Email",
    emailHint: "",
    passwordLabel: "Password",
    passwordHint: "",
    codeLabel: "One-time code",
    codeHint: "Sent to learner@example.com. It expires in 5 minutes.",
    submitCredentials: "Continue",
    submitCode: "Sign in",
    resend: "Send a new code",
    credentialsHint: "We will email you a one-time code before you are signed in.",
    signedInTitle: "You are signed in",
    signedInHint: "You can close this and carry on where you were.",
}

/** Every handler, stubbed - a test asserts what was called, never what it did. */
const handlers = () => ({
    onSubmitCredentials: vi.fn(),
    onSubmitCode: vi.fn(),
    onResend: vi.fn(),
})

/** Draw the flow at one step and status. */
interface DrawParams {
    /** Which step. */
    step: SignInFlowStep
    /** Which status. */
    status: SignInFlowStatus
    /** The sentence beside the status. */
    statusMessage?: string
    /** The stubbed handlers. */
    stubs: ReturnType<typeof handlers>
}

/** Render the flow with the shared labels. */
const draw = ({ step, status, statusMessage = "", stubs }: DrawParams) =>
    render(
        <_SignInFlow
            step={step}
            status={status}
            statusMessage={statusMessage}
            labels={labels}
            onSubmitCredentials={stubs.onSubmitCredentials}
            onSubmitCode={stubs.onSubmitCode}
            onResend={stubs.onResend}
        />,
    )

/** The status line the surface is currently reporting. */
const status = (container: HTMLElement): HTMLElement | null =>
    container.querySelector("[data-part='status']")

afterEach(() => {
    cleanup()
})

describe("_SignInFlow", () => {
    it("draws the whole submission as one registry key, in its declared order", () => {
        const { container } = draw({ step: "credentials", status: "idle", stubs: handlers() })
        const node = container.querySelector("[data-node='form']")
        expect(node?.getAttribute("data-roles")).toBe("body meta action footer")
        expect(node?.getAttribute("class")).toBe(treeSpec("form").classes)
    })

    it("puts the outcome line between the last control and the button", () => {
        const { container } = draw({ step: "credentials", status: "idle", stubs: handlers() })
        const children = [...(container.querySelector("[data-node='form']")?.children ?? [])]
        const statusIndex = children.findIndex((child) => child.getAttribute("data-part") === "status")
        const buttonIndex = children.findIndex((child) => child.tagName === "BUTTON")
        expect(statusIndex).toBeGreaterThan(-1)
        expect(buttonIndex).toBeGreaterThan(statusIndex)
    })

    it("asks for an email and a password before it asks for anything else", () => {
        const { container } = draw({ step: "credentials", status: "idle", stubs: handlers() })
        expect(container.querySelectorAll("[data-node='form-field']").length).toBe(2)
        expect(container.querySelector("[data-part='email']")).not.toBeNull()
        expect(container.querySelector("[data-part='password']")).not.toBeNull()
        expect(container.querySelector("[data-part='code']")).toBeNull()
    })

    it("labels every control it draws", () => {
        const { container } = draw({ step: "credentials", status: "idle", stubs: handlers() })
        const email = container.querySelector("[data-part='email']")
        const label = container.querySelector(`label[for='${email?.getAttribute("id")}']`)
        expect(label?.textContent).toBe(labels.emailLabel)
    })

    it("hands the typed credentials back on submit", () => {
        const stubs = handlers()
        const { container } = draw({ step: "credentials", status: "idle", stubs })
        fireEvent.change(container.querySelector("[data-part='email']") as HTMLInputElement, {
            target: { value: "learner@example.com" },
        })
        fireEvent.change(container.querySelector("[data-part='password']") as HTMLInputElement, {
            target: { value: "secret" },
        })
        fireEvent.submit(container.querySelector("form") as HTMLFormElement)
        expect(stubs.onSubmitCredentials).toHaveBeenCalledWith({
            email: "learner@example.com",
            password: "secret",
        })
        expect(stubs.onSubmitCode).not.toHaveBeenCalled()
    })

    it("keeps what the reader typed when an attempt comes back refused", () => {
        const stubs = handlers()
        const { container, rerender } = draw({ step: "credentials", status: "idle", stubs })
        fireEvent.change(container.querySelector("[data-part='email']") as HTMLInputElement, {
            target: { value: "learner@example.com" },
        })

        rerender(
            <_SignInFlow
                step="credentials"
                status="error"
                statusMessage="Wrong password"
                labels={labels}
                onSubmitCredentials={stubs.onSubmitCredentials}
                onSubmitCode={stubs.onSubmitCode}
                onResend={stubs.onResend}
            />,
        )

        const email = container.querySelector("[data-part='email']") as HTMLInputElement
        expect(email.value).toBe("learner@example.com")
    })

    it("swaps the credentials for a single code control once a code is out", () => {
        const { container } = draw({ step: "code", status: "sent", stubs: handlers() })
        expect(container.querySelectorAll("[data-node='form-field']").length).toBe(1)
        expect(container.querySelector("[data-part='code']")).not.toBeNull()
        expect(container.querySelector("[data-part='email']")).toBeNull()
        expect(container.querySelector("[data-part='code-hint']")?.textContent).toBe(labels.codeHint)
    })

    it("offers the code to a phone and the digit keypad to a thumb", () => {
        const { container } = draw({ step: "code", status: "sent", stubs: handlers() })
        const code = container.querySelector("[data-part='code']")
        expect(code?.getAttribute("autocomplete")).toBe("one-time-code")
        expect(code?.getAttribute("inputmode")).toBe("numeric")
    })

    it("hands the typed code back on submit, and never the credentials", () => {
        const stubs = handlers()
        const { container } = draw({ step: "code", status: "sent", stubs })
        fireEvent.change(container.querySelector("[data-part='code']") as HTMLInputElement, {
            target: { value: "123456" },
        })
        fireEvent.submit(container.querySelector("form") as HTMLFormElement)
        expect(stubs.onSubmitCode).toHaveBeenCalledWith({ otp: "123456" })
        expect(stubs.onSubmitCredentials).not.toHaveBeenCalled()
    })

    it("says what happens next while nothing has happened yet", () => {
        const { container } = draw({ step: "credentials", status: "idle", stubs: handlers() })
        expect(status(container)?.getAttribute("data-state")).toBe("idle")
        expect(status(container)?.textContent).toBe("")
        expect(container.querySelector("[data-part='hint']")?.textContent).toBe(labels.credentialsHint)
    })

    it("reports a code in flight without letting it be sent twice", () => {
        const { container } = draw({ step: "code", status: "verifying", statusMessage: "Checking your code", stubs: handlers() })
        expect(status(container)?.getAttribute("data-state")).toBe("verifying")
        expect(container.querySelector("button[type='submit']")).toHaveProperty("disabled", true)
    })

    it("interrupts the reader for a refusal and tells them in passing for everything else", () => {
        const failed = draw({ step: "code", status: "error", statusMessage: "That code is not right", stubs: handlers() })
        expect(status(failed.container)?.getAttribute("role")).toBe("alert")
        expect(status(failed.container)?.textContent).toBe("That code is not right")
        cleanup()

        const sent = draw({ step: "code", status: "sent", statusMessage: "We sent a code", stubs: handlers() })
        expect(status(sent.container)?.getAttribute("role")).toBe("status")
    })

    it("offers a resend only once there is a challenge to resend against", () => {
        const stubs = handlers()
        const withCode = draw({ step: "code", status: "sent", stubs })
        const resend = [...withCode.container.querySelectorAll("button")]
            .find((button) => button.textContent === labels.resend)
        expect(resend).toBeDefined()
        fireEvent.click(resend as HTMLButtonElement)
        expect(stubs.onResend).toHaveBeenCalledTimes(1)
        cleanup()

        const withoutCode = draw({ step: "credentials", status: "idle", stubs })
        expect([...withoutCode.container.querySelectorAll("button")]
            .some((button) => button.textContent === labels.resend)).toBe(false)
    })

    it("stops the resend being pressed twice while one is already going out", () => {
        const { container } = draw({ step: "code", status: "resending", statusMessage: "Sending a new code", stubs: handlers() })
        const resend = [...container.querySelectorAll("button")]
            .find((button) => button.textContent === labels.resend)
        expect(resend).toHaveProperty("disabled", true)
        // The primary stays pressable: a reader who has just typed the code they already have
        // should not be locked out because a new one is on its way.
        expect(container.querySelector("button[type='submit']")).toHaveProperty("disabled", false)
    })

    it("refuses a submit that arrives while one is already in flight", () => {
        const stubs = handlers()
        const { container } = draw({ step: "code", status: "verifying", stubs })
        fireEvent.submit(container.querySelector("form") as HTMLFormElement)
        expect(stubs.onSubmitCode).not.toHaveBeenCalled()
    })

    it("replaces the form with a confirmation once the token is in hand", () => {
        const { container } = draw({ step: "done", status: "signedIn", statusMessage: "Signed in", stubs: handlers() })
        expect(container.querySelector("form")).toBeNull()
        expect(container.firstElementChild?.getAttribute("data-node")).toBe("section")
        expect(container.querySelector("h3")?.textContent).toBe(labels.signedInTitle)
        expect(container.querySelector("[data-part='done']")?.textContent).toBe(labels.signedInHint)
    })

    it("rests as the same tree rather than as a second one", () => {
        const stubs = handlers()
        const { container } = render(
            <_SignInFlow
                step="credentials"
                status="idle"
                statusMessage=""
                labels={labels}
                onSubmitCredentials={stubs.onSubmitCredentials}
                onSubmitCode={stubs.onSubmitCode}
                onResend={stubs.onResend}
                isLoading
            />,
        )
        expect(container.querySelector("[data-node='form']")).not.toBeNull()
        expect(container.querySelector("[data-part='email']")).toHaveProperty("disabled", true)
        expect(container.querySelector("button[type='submit']")?.getAttribute("data-loading")).toBe("true")
    })
})
