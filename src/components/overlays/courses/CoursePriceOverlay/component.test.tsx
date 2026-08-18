import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CoursePriceOverlay } from "./component"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/**
 * What these tests guard.
 *
 * The surface owns the covering mechanics and nothing else - no price, no currency, no copy. It
 * mounts the reckoning under the contract the reckoning itself declares, and it draws no surface
 * branch of its own, because the covering panel is already the bounded object.
 *
 * `sm` rather than `xs` is a decision, not a default: the body is a label-and-amount column, and at
 * `xs` the amounts wrap under their labels and it stops being a column.
 */

const mocks = vi.hoisted(() => ({ size: vi.fn(), contract: vi.fn() }))

type ModalStub = {
    readonly isOpen: boolean
    readonly size: string
    readonly contract: string
    readonly render: { readonly kind: string }
    readonly onDismiss: () => void
}

vi.mock("@/components/branches/ModalBranch", () => ({
    ModalBranch: (input: ModalStub) => {
        mocks.size(input.size)
        mocks.contract(input.contract)
        return (
            <section data-testid="modal" data-open={String(input.isOpen)}>
                <button type="button" onClick={input.onDismiss}>Close</button>
            </section>
        )
    },
}))

const reckoning = defineContractComponent("stacked-peer-controls", {
    control: [defineLeafComponent("button", {}, () => <span>1.750.000 ₫</span>)],
})

describe("_CoursePriceOverlay", () => {
    it("reads the reckoning at the measure a two-column amount needs", () => {
        render(<_CoursePriceOverlay isOpen render={reckoning} onDismiss={vi.fn()} />)

        expect(mocks.size).toHaveBeenCalledWith("sm")
        expect(mocks.contract).toHaveBeenCalledWith("stacked-peer-controls")
        expect(screen.getByTestId("modal")).toHaveAttribute("data-open", "true")
    })

    it("draws no surface of its own around a body that is already framed", () => {
        const { container } = render(<_CoursePriceOverlay isOpen render={reckoning} onDismiss={vi.fn()} />)

        expect(container.querySelector("[data-component=\"SurfaceCardSurface\"]")).toBeNull()
        expect(container.querySelector("[data-component=\"SurfaceListCard\"]")).toBeNull()
    })

    it("hands every way out to whatever mounted the surface", () => {
        const onDismiss = vi.fn()
        render(<_CoursePriceOverlay isOpen={false} render={reckoning} onDismiss={onDismiss} />)

        expect(screen.getByTestId("modal")).toHaveAttribute("data-open", "false")
        fireEvent.click(screen.getByRole("button", { name: "Close" }))
        expect(onDismiss).toHaveBeenCalledOnce()
    })
})
