/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import { SignInFlow } from "@/components/overlays/auth/SignInFlow"

/**
 * What these tests guard: the two distinctions nothing downstream can make.
 *
 * A refusal the server described is not the same thing as a request that never reached a
 * verdict - telling a reader their code was wrong when the request timed out is a lie they
 * cannot argue with. And a code that has just been SENT is not the same as one that has just
 * been RESENT: the payloads are identical, only the count differs, and a reader who pressed
 * resend and saw the original sentence has no way to know it worked.
 *
 * The hook is replaced wholesale, so nothing here touches the network.
 */

const leaves = vi.hoisted(() => ({
    flow: {} as Record<string, unknown>,
    onSignedIn: undefined as (() => void) | undefined,
}))

vi.mock("@/hooks/auth/useSignInFlow", () => ({
    useSignInFlow: (params?: { onSignedIn?: () => void }) => {
        leaves.onSignedIn = params?.onSignedIn
        return leaves.flow
    },
}))

/** A flow that has done nothing yet. */
const idle = () => ({
    step: "credentials",
    sentCount: 0,
    isPending: false,
    isResending: false,
    onSubmitCredentials: vi.fn(),
    onSubmitCode: vi.fn(),
    onResend: vi.fn(),
})

/** A flow holding an open challenge. */
const challenged = () => ({
    ...idle(),
    step: "code",
    email: "learner@example.com",
    challengeId: "challenge-1",
    expiresInSeconds: 300,
    sentCount: 1,
})

/** The status line the surface is currently reporting. */
const status = (container: HTMLElement): HTMLElement | null =>
    container.querySelector("[data-part='status']")

beforeEach(() => {
    leaves.flow = idle()
    leaves.onSignedIn = undefined
})

afterEach(() => {
    cleanup()
})

describe("SignInFlow", () => {
    it("says nothing before anything has been attempted", () => {
        const { container } = render(<SignInFlow />)
        expect(status(container)?.getAttribute("data-state")).toBe("idle")
        expect(status(container)?.textContent).toBe("")
    })

    it("reports the credentials as in flight, not the code", () => {
        leaves.flow = { ...idle(), isPending: true }
        const { container } = render(<SignInFlow />)
        expect(status(container)?.getAttribute("data-state")).toBe("sending")
    })

    it("reports the code as in flight once a challenge is open", () => {
        leaves.flow = { ...challenged(), isPending: true }
        const { container } = render(<SignInFlow />)
        expect(status(container)?.getAttribute("data-state")).toBe("verifying")
    })

    it("tells the reader a code went out, and to which address", () => {
        leaves.flow = challenged()
        const { container } = render(<SignInFlow />)
        expect(status(container)?.getAttribute("data-state")).toBe("sent")
        expect(container.querySelector("[data-part='code-hint']")?.textContent)
            .toBe("Sent to learner@example.com. It expires in 5 minutes.")
    })

    it("tells a reader who pressed resend that the new code is a different one", () => {
        leaves.flow = { ...challenged(), sentCount: 2, expiresInSeconds: 120 }
        const { container } = render(<SignInFlow />)
        expect(status(container)?.getAttribute("data-state")).toBe("resent")
        expect(status(container)?.textContent).toContain("no longer works")
    })

    it("prefers the server's own sentence for a refusal", () => {
        leaves.flow = {
            ...challenged(),
            failure: { message: "That code is not right", code: "INVALID_OTP", isTransport: false },
        }
        const { container } = render(<SignInFlow />)
        expect(status(container)?.getAttribute("data-state")).toBe("error")
        expect(status(container)?.getAttribute("role")).toBe("alert")
        expect(status(container)?.textContent).toBe("That code is not right")
    })

    it("never blames the code when the request did not reach a verdict", () => {
        leaves.flow = { ...challenged(), failure: { isTransport: true } }
        const { container } = render(<SignInFlow />)
        const text = status(container)?.textContent ?? ""
        expect(text).toContain("could not reach the server")
        expect(text).not.toContain("code")
    })

    it("still says something when the server refuses without saying why", () => {
        leaves.flow = { ...challenged(), failure: { isTransport: false } }
        const { container } = render(<SignInFlow />)
        expect(status(container)?.textContent).toBe("That did not work. Please try again.")
    })

    it("lets a refusal outrank the news that a code was sent", () => {
        leaves.flow = {
            ...challenged(),
            failure: { message: "That code is not right", isTransport: false },
        }
        const { container } = render(<SignInFlow />)
        expect(status(container)?.getAttribute("data-state")).toBe("error")
    })

    it("reports a resend on its own, without claiming the code is being checked", () => {
        leaves.flow = { ...challenged(), isResending: true }
        const { container } = render(<SignInFlow />)
        expect(status(container)?.getAttribute("data-state")).toBe("resending")
    })

    it("confirms the session once the token is in hand", () => {
        leaves.flow = { ...challenged(), step: "done" }
        const { container } = render(<SignInFlow />)
        expect(container.querySelector("form")).toBeNull()
        expect(container.querySelector("h3")?.textContent).toBe("You are signed in")
    })

    it("names an address it does not have without pretending to know it", () => {
        leaves.flow = { ...challenged(), email: undefined, expiresInSeconds: undefined }
        const { container } = render(<SignInFlow />)
        expect(container.querySelector("[data-part='code-hint']")?.textContent).toBe("Sent to your email.")
    })

    it("counts a single minute in the singular", () => {
        leaves.flow = { ...challenged(), expiresInSeconds: 60 }
        const { container } = render(<SignInFlow />)
        expect(container.querySelector("[data-part='code-hint']")?.textContent)
            .toContain("It expires in 1 minute.")
    })

    it("passes the submitted credentials to the flow untouched", () => {
        const flow = idle()
        leaves.flow = flow
        const { container } = render(<SignInFlow />)
        fireEvent.change(container.querySelector("[data-part='email']") as HTMLInputElement, {
            target: { value: "learner@example.com" },
        })
        fireEvent.change(container.querySelector("[data-part='password']") as HTMLInputElement, {
            target: { value: "secret" },
        })
        fireEvent.submit(container.querySelector("form") as HTMLFormElement)
        expect(flow.onSubmitCredentials).toHaveBeenCalledWith({
            email: "learner@example.com",
            password: "secret",
        })
    })

    it("wires the resend control to the flow", () => {
        const flow = challenged()
        leaves.flow = flow
        const { container } = render(<SignInFlow />)
        const resend = [...container.querySelectorAll("button")]
            .find((button) => button.textContent === "Send a new code")
        fireEvent.click(resend as HTMLButtonElement)
        expect(flow.onResend).toHaveBeenCalledTimes(1)
    })

    it("hands its own completion callback down to the flow", () => {
        const onSignedIn = vi.fn()
        render(<SignInFlow onSignedIn={onSignedIn} />)
        leaves.onSignedIn?.()
        expect(onSignedIn).toHaveBeenCalledTimes(1)
    })
})
