import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"
import { SignInOverlayView } from "./component"

/**
 * What these tests guard.
 *
 * The surface owns the covering mechanics and nothing else: it has never heard of authentication,
 * so the content is supplied directly rather than through an opaque prop this file
 * would have to know the meaning of. The narrow `xs` measure is part of that layout - a sign-in
 * panel read wider stops being a single column of fields.
 */

const mocks = vi.hoisted(() => ({ size: vi.fn(), children: vi.fn() }))

type ModalStub = {
    readonly isOpen: boolean
    readonly size: string
    readonly children: ReactNode
    readonly onDismiss: () => void
}

vi.mock("@/components/branches/ModalBranch", () => ({
    ModalBranch: (props: ModalStub) => {
        mocks.size(props.size)
        mocks.children(props.children)
        return (
            <section data-testid="modal" data-open={String(props.isOpen)}>
                <button type="button" onClick={props.onDismiss}>Close</button>
            </section>
        )
    },
}))

/*
 * The exact composition `centred-page-column` admits: a title pair heading the column, then the
 * repeated body it is read one control at a time. The panel this surface really carries is that
 * shape, so the fixture is that shape rather than a slot the entry never declared.
 */
const panel = <><h2>Sign in</h2><span>Welcome back</span><form>Authentication panel</form></>

describe("SignInOverlayView", () => {
    it("mounts the content under the heading the content itself declares", () => {
        render(<SignInOverlayView isOpen onDismiss={vi.fn()}>{panel}</SignInOverlayView>)

        expect(mocks.children).toHaveBeenCalledWith(panel)
        expect(mocks.size).toHaveBeenCalledWith("xs")
        expect(screen.getByTestId("modal")).toHaveAttribute("data-open", "true")
    })

    it("stays mounted and closed while the bar holds it shut", () => {
        render(<SignInOverlayView isOpen={false} onDismiss={vi.fn()}>{panel}</SignInOverlayView>)
        expect(screen.getByTestId("modal")).toHaveAttribute("data-open", "false")
    })

    it("hands every way out to the surface that mounted it", () => {
        const onDismiss = vi.fn()
        render(<SignInOverlayView isOpen onDismiss={onDismiss}>{panel}</SignInOverlayView>)

        fireEvent.click(screen.getByRole("button", { name: "Close" }))
        expect(onDismiss).toHaveBeenCalledOnce()
    })
})
