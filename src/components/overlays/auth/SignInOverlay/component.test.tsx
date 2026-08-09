/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import type { ContractSlotProps } from "@/components/contracts"
import { _SignInOverlay } from "@/components/overlays/auth/SignInOverlay/component"

/**
 * What these tests guard: that the open flag is the ONLY thing deciding whether this is on screen.
 * Every way out - the close control the panel carries, Escape, the platform's own cancel - has to
 * end at the same callback, because the moment one of them closes the element directly, the DOM
 * and the prop disagree and the next render puts the overlay back.
 *
 * They also pin the two things this surface stopped doing. It draws no title of its own, because
 * the panel's title changes with the journey and a fixed one here would contradict it; it is NAMED
 * by that heading instead. And it adds no node around the body, because a second header row on a
 * small floating surface is most of the surface.
 *
 * The `showModal` fallback is exercised rather than mocked away: jsdom implements `<dialog>`
 * without it, which is the same path an old browser takes.
 */

/** A stand-in for the panel that normally hangs inside, carrying an id the dialog can point at. */
const Body = () => (
    <p data-part="body">
        <span id="authentication-panel-title">Sign in</span>
    </p>
)

/** Render the overlay open or closed. */
interface DrawParams {
    /** Whether it is on screen. */
    isOpen: boolean
    /** The dismiss stub. */
    onDismiss: () => void
}

/** Render with the stand-in body. */
const draw = ({ isOpen, onDismiss }: DrawParams) =>
    render(<_SignInOverlay isOpen={isOpen} slots={{ body: Body }} onDismiss={onDismiss} />)

/** The dialog element the overlay drew. */
const dialogOf = (container: HTMLElement): HTMLDialogElement =>
    container.querySelector("dialog") as HTMLDialogElement

afterEach(() => {
    cleanup()
})

describe("_SignInOverlay", () => {
    it("is a real dialog, named by the heading a reader can see", () => {
        const { container } = draw({ isOpen: true, onDismiss: vi.fn() })
        const dialog = dialogOf(container)
        expect(dialog).not.toBeNull()
        const titleId = dialog.getAttribute("aria-labelledby")
        expect(titleId).toBe("authentication-panel-title")
        expect(container.querySelector(`#${titleId}`)?.textContent).toBe("Sign in")
    })

    it("opens the element when the flag says it is on screen", () => {
        const { container } = draw({ isOpen: true, onDismiss: vi.fn() })
        expect(dialogOf(container).hasAttribute("open")).toBe(true)
        expect(dialogOf(container).getAttribute("data-state")).toBe("open")
    })

    it("leaves the element closed when the flag says it is not", () => {
        const { container } = draw({ isOpen: false, onDismiss: vi.fn() })
        expect(dialogOf(container).hasAttribute("open")).toBe(false)
        expect(dialogOf(container).getAttribute("data-state")).toBe("closed")
    })

    it("follows the flag in both directions", () => {
        const onDismiss = vi.fn()
        const { container, rerender } = draw({ isOpen: true, onDismiss })
        expect(dialogOf(container).hasAttribute("open")).toBe(true)

        rerender(<_SignInOverlay isOpen={false} slots={{ body: Body }} onDismiss={onDismiss} />)
        expect(dialogOf(container).hasAttribute("open")).toBe(false)
    })

    it("hangs the slot it was given, and adds no node of its own around it", () => {
        const { container } = draw({ isOpen: true, onDismiss: vi.fn() })
        const dialog = dialogOf(container)
        expect(dialog.children.length).toBe(1)
        expect(dialog.querySelector("[data-part='body']")?.textContent).toBe("Sign in")
    })

    it("draws no title line of its own - the panel owns the title", () => {
        const { container } = draw({ isOpen: true, onDismiss: vi.fn() })
        expect(container.querySelector("[data-node='page-header']")).toBeNull()
    })

    it("dismisses through the same callback on Escape", () => {
        const onDismiss = vi.fn()
        const { container } = draw({ isOpen: true, onDismiss })
        fireEvent.keyDown(dialogOf(container), { key: "Escape" })
        expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it("ignores every other key", () => {
        const onDismiss = vi.fn()
        const { container } = draw({ isOpen: true, onDismiss })
        fireEvent.keyDown(dialogOf(container), { key: "Enter" })
        fireEvent.keyDown(dialogOf(container), { key: "a" })
        expect(onDismiss).not.toHaveBeenCalled()
    })

    it("refuses the platform's own cancel, so the flag stays the only thing that decides", () => {
        const onDismiss = vi.fn()
        const { container } = draw({ isOpen: true, onDismiss })
        const cancel = new Event("cancel", { bubbles: false, cancelable: true })
        fireEvent(dialogOf(container), cancel)
        expect(cancel.defaultPrevented).toBe(true)
        expect(dialogOf(container).hasAttribute("open")).toBe(true)
    })

    it("uses the platform's modal path when the platform has one", () => {
        const showModal = vi.fn()
        const prototype = window.HTMLDialogElement.prototype as unknown as Record<string, unknown>
        prototype.showModal = showModal
        try {
            draw({ isOpen: true, onDismiss: vi.fn() })
            expect(showModal).toHaveBeenCalledTimes(1)
        } finally {
            delete prototype.showModal
        }
    })

    it("rests the body with the surface rather than keeping a second tree", () => {
        /** A stand-in that reports the resting flag it was handed. */
        const RestingBody = ({ isLoading }: ContractSlotProps) => (
            <p data-part="body" data-loading={isLoading === true ? "true" : "false"}>Panel</p>
        )
        const { container } = render(
            <_SignInOverlay isOpen slots={{ body: RestingBody }} onDismiss={vi.fn()} isLoading />,
        )
        expect(container.querySelector("[data-part='body']")?.getAttribute("data-loading")).toBe("true")
    })
})
