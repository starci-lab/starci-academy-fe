import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { SignInOverlayBase } from "./component"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/**
 * What these tests guard.
 *
 * The surface owns the covering mechanics and nothing else: it has never heard of authentication,
 * so the contract it mounts comes from the content's own metadata rather than from a prop this file
 * would have to know the meaning of. The narrow `xs` measure is part of that contract - a sign-in
 * panel read wider stops being a single column of fields.
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

/*
 * The exact composition `centred-page-column` admits: a title pair heading the column, then the
 * repeated body it is read one control at a time. The panel this surface really carries is that
 * shape, so the fixture is that shape rather than a slot the entry never declared.
 */
const panel = defineContractComponent("centred-page-column", {
    header: defineContractComponent("centred-title-pair", {
        title: defineLeafComponent("heading", {}, () => <h2>Sign in</h2>),
        description: defineLeafComponent("text", { size: "sm" }, () => <span>Welcome back</span>),
    }),
    body: [defineLeafComponent("form", {}, () => <form>Authentication panel</form>)],
})

describe("SignInOverlayBase", () => {
    it("mounts the content under the contract the content itself declares", () => {
        render(<SignInOverlayBase isOpen render={panel} onDismiss={vi.fn()} />)

        expect(mocks.contract).toHaveBeenCalledWith("centred-page-column")
        expect(mocks.size).toHaveBeenCalledWith("xs")
        expect(screen.getByTestId("modal")).toHaveAttribute("data-open", "true")
    })

    it("stays mounted and closed while the bar holds it shut", () => {
        render(<SignInOverlayBase isOpen={false} render={panel} onDismiss={vi.fn()} />)
        expect(screen.getByTestId("modal")).toHaveAttribute("data-open", "false")
    })

    it("hands every way out to the surface that mounted it", () => {
        const onDismiss = vi.fn()
        render(<SignInOverlayBase isOpen render={panel} onDismiss={onDismiss} />)

        fireEvent.click(screen.getByRole("button", { name: "Close" }))
        expect(onDismiss).toHaveBeenCalledOnce()
    })
})
