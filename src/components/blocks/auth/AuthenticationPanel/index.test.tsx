/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { AUTHENTICATION_PANEL_MODES, AuthenticationPanel } from "./index"

/**
 * What these tests guard: the three distinctions the connected half makes that nothing downstream
 * can.
 *
 * A refusal the server DESCRIBED is not the same thing as a request that never reached a verdict -
 * telling a reader their code was wrong when the request timed out is a lie they cannot argue with.
 * A code that has just been SENT is not the same as one that has just been RESENT: the payloads are
 * identical, only the count differs, and a reader who pressed resend and saw the original sentence
 * has no way to know it worked. And the JOURNEY decides the copy - the same second box is
 * "Password", "Choose a password" and "New password", and a panel that called it one thing in all
 * three modes would be lying in two of them.
 *
 * The hook is replaced wholesale, so nothing here touches the network.
 */

const leaves = vi.hoisted(() => ({
    panel: {} as Record<string, unknown>,
    onSignedIn: undefined as (() => void) | undefined,
}))

/** The parameters the stand-in hook records rather than acting on. */
interface PanelHookParams {
    /** Called by the panel once a token is in hand. */
    onSignedIn?: () => void
}

vi.mock("@/hooks/auth/useAuthPanel", () => ({
    useAuthPanel: (params?: PanelHookParams) => {
        leaves.onSignedIn = params?.onSignedIn
        return leaves.panel
    },
}))

/** A panel that has done nothing yet. */
const idle = () => ({
    mode: "signIn",
    step: "details",
    sentCount: 0,
    hasAgreedToTerms: false,
    isPending: false,
    isResending: false,
    onSubmitDetails: vi.fn(),
    onSubmitCode: vi.fn(),
    onResend: vi.fn(),
    onChangeMode: vi.fn(),
    onChangeAgreedToTerms: vi.fn(),
    onOauthPress: vi.fn(),
})

/** A panel holding an open challenge. */
const challenged = () => ({
    ...idle(),
    step: "code",
    email: "learner@example.com",
    challengeId: "challenge-1",
    expiresInSeconds: 300,
    sentCount: 1,
})

/** The live region the panel is currently reporting through. */
const statusLine = (container: HTMLElement): HTMLElement | null =>
    container.querySelector("[role='alert'], [role='status']")

/** The visible title of the panel. */
const titleOf = (container: HTMLElement): string =>
    container.querySelector("#authentication-panel-title")?.textContent ?? ""

beforeEach(() => {
    leaves.panel = idle()
    leaves.onSignedIn = undefined
})

afterEach(() => {
    cleanup()
})

describe("AuthenticationPanel - what it says about a request", () => {
    it("says nothing before anything has been attempted", () => {
        const { container } = render(<AuthenticationPanel />)
        // A live region that existed while empty would clear a screen reader queue to say nothing.
        expect(statusLine(container)).toBeNull()
    })

    it("reports the details as in flight, not the code", () => {
        leaves.panel = { ...idle(), isPending: true }
        const { container } = render(<AuthenticationPanel />)
        expect(statusLine(container)?.getAttribute("role")).toBe("status")
        expect(statusLine(container)?.textContent).toBe("Checking your details")
    })

    it("reports the code as in flight once a challenge is open", () => {
        leaves.panel = { ...challenged(), isPending: true }
        const { container } = render(<AuthenticationPanel />)
        expect(statusLine(container)?.textContent).toBe("Checking your code")
    })

    it("tells a sent code apart from a resent one", () => {
        leaves.panel = challenged()
        const first = render(<AuthenticationPanel />)
        expect(statusLine(first.container)?.textContent).toBe("We sent a code to your email. Enter it below.")
        cleanup()

        leaves.panel = { ...challenged(), sentCount: 2 }
        const again = render(<AuthenticationPanel />)
        expect(statusLine(again.container)?.textContent)
            .toBe("A new code is on its way. The one before it no longer works.")
    })

    it("prefers the server's own sentence, because only it knows which refusal happened", () => {
        leaves.panel = {
            ...challenged(),
            failure: { message: "That code has expired.", code: "OTP_EXPIRED", isTransport: false },
        }
        const { container } = render(<AuthenticationPanel />)
        expect(statusLine(container)?.getAttribute("role")).toBe("alert")
        expect(statusLine(container)?.textContent).toBe("That code has expired.")
    })

    it("never blames the reader for a request that never reached a verdict", () => {
        leaves.panel = { ...challenged(), failure: { isTransport: true } }
        const { container } = render(<AuthenticationPanel />)
        const said = statusLine(container)?.textContent ?? ""
        expect(said).toBe("We could not reach the server. Check your connection and try again.")
        expect(said).not.toContain("code")
    })

    it("still says something when the server refused without saying why", () => {
        leaves.panel = { ...challenged(), failure: { isTransport: false } }
        const { container } = render(<AuthenticationPanel />)
        expect(statusLine(container)?.textContent).toBe("That did not work. Please try again.")
    })

    it("puts the address the code went to in the hint, and how long it lives", () => {
        leaves.panel = challenged()
        const { container } = render(<AuthenticationPanel />)
        expect(container.textContent).toContain("Sent to learner@example.com. It expires in 5 minutes.")
    })

    it("says nothing about an expiry the server did not report", () => {
        leaves.panel = { ...challenged(), expiresInSeconds: undefined }
        const { container } = render(<AuthenticationPanel />)
        expect(container.textContent).toContain("Sent to learner@example.com.")
        expect(container.textContent).not.toContain("expires")
    })
})

describe("AuthenticationPanel - what the journey is called", () => {
    it("names the sign-in journey and its primary action", () => {
        const { container } = render(<AuthenticationPanel />)
        expect(titleOf(container)).toBe("Sign in")
        expect(container.textContent).toContain("Continue")
        expect(container.textContent).toContain("Password")
    })

    it("names the registration journey, and calls the secret what it is there", () => {
        leaves.panel = { ...idle(), mode: "signUp" }
        const { container } = render(<AuthenticationPanel />)
        expect(titleOf(container)).toBe("Create an account")
        expect(container.textContent).toContain("Choose a password")
        expect(container.textContent).toContain("Create account")
    })

    it("names the reset journey, and says what the code in the next step is for", () => {
        leaves.panel = { ...idle(), mode: "forgotPassword" }
        const { container } = render(<AuthenticationPanel />)
        expect(titleOf(container)).toBe("Reset your password")
        expect(container.textContent).toContain("New password")
        expect(container.textContent).toContain("The code in the next step is what authorises the change.")
    })

    it("changes the primary action at the code step, per journey", () => {
        leaves.panel = { ...challenged(), mode: "signUp" }
        const { container } = render(<AuthenticationPanel />)
        expect(container.textContent).toContain("Finish signing up")
    })

    it("confirms the ending each journey actually has", () => {
        leaves.panel = { ...idle(), mode: "forgotPassword", step: "done" }
        const { container } = render(<AuthenticationPanel />)
        expect(titleOf(container)).toBe("Your password has changed")
        expect(container.textContent).toContain("You are signed in with the new password.")
    })
})

describe("AuthenticationPanel - what it hands the host", () => {
    it("passes the completion callback through to the machine", () => {
        const onSignedIn = vi.fn()
        render(<AuthenticationPanel onSignedIn={onSignedIn} />)
        leaves.onSignedIn?.()
        expect(onSignedIn).toHaveBeenCalledTimes(1)
    })

    it("draws whatever the host hung on the title line", () => {
        const Action = () => <button type="button">Close</button>
        const { container } = render(<AuthenticationPanel slots={{ action: Action }} />)
        const header = container.querySelector("[data-node='page-header']")
        expect(header?.querySelector("button")?.textContent).toBe("Close")
    })

    it("draws nothing there when the host hands nothing in", () => {
        const { container } = render(<AuthenticationPanel />)
        const header = container.querySelector("[data-node='page-header']")
        expect(header?.querySelector("button")).toBeNull()
    })
})

describe("AUTHENTICATION_PANEL_MODES", () => {
    it("holds the hook's vocabulary and the panel's to the same three names", () => {
        expect(AUTHENTICATION_PANEL_MODES).toEqual({
            signIn: "signIn",
            signUp: "signUp",
            forgotPassword: "forgotPassword",
        })
    })
})
