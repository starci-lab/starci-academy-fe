/** @vitest-environment jsdom */
import type { PropsWithChildren } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { ModalBranch } from "."

const mocks = vi.hoisted(() => ({
    size: vi.fn(),
    scroll: vi.fn(),
    dialogClassName: vi.fn(),
    bodyClassName: vi.fn(),
    openChange: undefined as ((open: boolean) => void) | undefined,
}))

type MockCloseTriggerProps = { readonly "aria-label"?: string }

vi.mock("@heroui/react", () => {
    const Root = (props: PropsWithChildren<{ onOpenChange: (open: boolean) => void }>) => {
        const { children, onOpenChange } = props
        mocks.openChange = onOpenChange
        return <>{children}</>
    }
    const Container = (props: PropsWithChildren<{ size: string; scroll: string }>) => {
        const { children, size, scroll } = props
        mocks.size(size)
        mocks.scroll(scroll)
        return <div>{children}</div>
    }
    return { cn: (...tokens: Array<string>) => tokens.join(" "), Modal: Object.assign(Root, {
        Trigger: () => null,
        Backdrop: (props: PropsWithChildren) => {
            const { children } = props
            return <div>{children}</div>
        },
        Container,
        Dialog: (props: PropsWithChildren<{ className?: string; "aria-labelledby"?: string }>) => {
            const { children, className, ...dialogProps } = props
            mocks.dialogClassName(className)
            return <div role="dialog" data-slot="modal-dialog" {...dialogProps}>{children}</div>
        },
        CloseTrigger: (props: MockCloseTriggerProps) => (
            <button type="button" aria-label={props["aria-label"]} onClick={() => mocks.openChange?.(false)} />
        ),
        Body: (props: PropsWithChildren<{ className?: string }>) => {
            const { children, className } = props
            mocks.bodyClassName(className)
            return <div>{children}</div>
        },
    }) }
})

afterEach(cleanup)

const body = <>Body</>

describe("ModalBranch", () => {
    it("forwards the approved cover size to vendor mechanics", () => {
        render(
            <ModalBranch
                isOpen
                size="cover"
                onDismiss={() => undefined}
            >{body}</ModalBranch>,
        )
        expect(mocks.size).toHaveBeenCalledWith("cover")
        expect(mocks.scroll).toHaveBeenCalledWith("inside")
        expect(mocks.dialogClassName).toHaveBeenCalledWith("p-4")
        expect(mocks.bodyClassName).toHaveBeenCalledWith("p-0")
        expect(screen.getByText("Body")).toBeTruthy()
    })

    it("routes a vendor close outcome to one dismissal callback", () => {
        const dismiss = vi.fn()
        render(
            <ModalBranch
                isOpen
                closeLabel="Dismiss dialog"
                onDismiss={dismiss}
            >{body}</ModalBranch>,
        )
        fireEvent.click(screen.getByRole("button", { name: "Dismiss dialog" }))
        expect(dismiss).toHaveBeenCalledOnce()
    })

    it("takes the middle width and no cover inset when the caller names no size", () => {
        render(
            <ModalBranch
                isOpen
                onDismiss={() => undefined}
            >{body}</ModalBranch>,
        )
        expect(mocks.size).toHaveBeenCalledWith("md")
        expect(mocks.dialogClassName).toHaveBeenCalledWith(undefined)
    })

    it("treats the surface opening as no outcome at all", () => {
        const dismiss = vi.fn()
        render(
            <ModalBranch
                isOpen
                onDismiss={dismiss}
            >{body}</ModalBranch>,
        )
        mocks.openChange?.(true)
        expect(dismiss).not.toHaveBeenCalled()
    })

    it("forwards one visible title and explicit modal semantics to the dialog", () => {
        render(
            <ModalBranch
                isOpen
                ariaLabelledBy="dialog-title"
                onDismiss={() => undefined}
            >
                <h2 id="dialog-title">{body}</h2>
            </ModalBranch>,
        )
        const title = screen.getByRole("heading").textContent ?? ""
        expect(screen.getByRole("dialog", { name: title })).toHaveAttribute("aria-modal", "true")
    })
})
