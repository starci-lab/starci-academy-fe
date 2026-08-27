import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"
import { CoursePriceOverlayView } from "./component"

/**
 * What these tests guard.
 *
 * The surface owns the covering mechanics and nothing else - no price, no currency, no copy. It
 * mounts the supplied reckoning directly, and it draws no surface
 * branch of its own, because the covering panel is already the bounded object.
 *
 * `sm` rather than `xs` is a decision, not a default: the body is a label-and-amount column, and at
 * `xs` the amounts wrap under their labels and it stops being a column.
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

const reckoning = <span>1.750.000 ₫</span>

describe("CoursePriceOverlayView", () => {
    it("reads the reckoning at the measure a two-column amount needs", () => {
        render(<CoursePriceOverlayView isOpen onDismiss={vi.fn()}>{reckoning}</CoursePriceOverlayView>)

        expect(mocks.size).toHaveBeenCalledWith("sm")
        expect(mocks.children).toHaveBeenCalledWith(reckoning)
        expect(screen.getByTestId("modal")).toHaveAttribute("data-open", "true")
    })

    it("draws no surface of its own around a body that is already framed", () => {
        render(<CoursePriceOverlayView isOpen onDismiss={vi.fn()}>{reckoning}</CoursePriceOverlayView>)

        expect(screen.getByTestId("modal")).toBeInTheDocument()
    })

    it("hands every way out to whatever mounted the surface", () => {
        const onDismiss = vi.fn()
        render(<CoursePriceOverlayView isOpen={false} onDismiss={onDismiss}>{reckoning}</CoursePriceOverlayView>)

        expect(screen.getByTestId("modal")).toHaveAttribute("data-open", "false")
        fireEvent.click(screen.getByRole("button", { name: "Close" }))
        expect(onDismiss).toHaveBeenCalledOnce()
    })
})
