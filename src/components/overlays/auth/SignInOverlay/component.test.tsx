/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import {
    _SignInOverlay,
    type SignInOverlayLabels,
} from "@/components/overlays/auth/SignInOverlay/component"
import { treeSpec } from "@/components/classNames"

/**
 * What these tests guard: that the open flag is the ONLY thing deciding whether this is on
 * screen. Every other way out - the close control, Escape, the platform's own cancel - has to
 * end at the same callback, because the moment one of them closes the element directly, the
 * DOM and the prop disagree and the next render puts the overlay back.
 *
 * They also pin the fallback. jsdom implements `<dialog>` without `showModal`, so the
 * component opens the element through the attribute instead - which is the same path an old
 * browser takes, and worth exercising rather than mocking away.
 */

const labels: SignInOverlayLabels = {
    title: "Sign in",
    dismiss: "Close",
}

/** A stand-in for the flow that normally hangs inside. */
const Body = () => <p data-part="body">Flow</p>

/** Render the overlay open or closed. */
interface DrawParams {
    /** Whether it is on screen. */
    isOpen: boolean
    /** The dismiss stub. */
    onDismiss: () => void
}

/** Render with the shared labels and the stand-in body. */
const draw = ({ isOpen, onDismiss }: DrawParams) =>
    render(
        <_SignInOverlay
            isOpen={isOpen}
            labels={labels}
            slots={{ body: Body }}
            onDismiss={onDismiss}
        />,
    )

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
        expect(container.querySelector(`#${titleId}`)?.textContent).toBe(labels.title)
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

        rerender(
            <_SignInOverlay
                isOpen={false}
                labels={labels}
                slots={{ body: Body }}
                onDismiss={onDismiss}
            />,
        )
        expect(dialogOf(container).hasAttribute("open")).toBe(false)
    })

    it("keeps the title line and its close control in one registry node", () => {
        const { container } = draw({ isOpen: true, onDismiss: vi.fn() })
        const header = container.querySelector("[data-node='page-header']")
        expect(header?.getAttribute("data-roles")).toBe("heading action")
        expect(header?.getAttribute("class")).toBe(treeSpec("page-header").classes)
        expect(header?.querySelector("button")?.textContent).toBe(labels.dismiss)
    })

    it("hangs the slot it was given, and nothing of its own, in the body", () => {
        const { container } = draw({ isOpen: true, onDismiss: vi.fn() })
        const section = container.querySelector("[data-node='section']")
        expect(section?.querySelector("[data-part='body']")?.textContent).toBe("Flow")
    })

    it("dismisses through the callback when the close control is pressed", () => {
        const onDismiss = vi.fn()
        const { container } = draw({ isOpen: true, onDismiss })
        const close = [...container.querySelectorAll("button")]
            .find((button) => button.textContent === labels.dismiss)
        fireEvent.click(close as HTMLButtonElement)
        expect(onDismiss).toHaveBeenCalledTimes(1)
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

    it("rests as the same tree rather than as a second one", () => {
        const { container } = render(
            <_SignInOverlay
                isOpen
                labels={labels}
                slots={{ body: Body }}
                onDismiss={vi.fn()}
                isLoading
            />,
        )
        expect(container.querySelector("[data-node='page-header']")).not.toBeNull()
        expect(container.querySelector("button")?.getAttribute("data-loading")).toBe("true")
    })
})
