/** @vitest-environment jsdom */
import type { PropsWithChildren } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { ModalBranch } from "."

const mocks = vi.hoisted(() => ({
    size: vi.fn(),
    dialogClassName: vi.fn(),
    bodyClassName: vi.fn(),
    openChange: undefined as ((open: boolean) => void) | undefined,
}))
vi.mock("@heroui/react", () => {
    const Root = (props: PropsWithChildren<{ onOpenChange: (open: boolean) => void }>) => {
        const { children, onOpenChange } = props
        mocks.openChange = onOpenChange
        return <>{children}</>
    }
    const Container = (props: PropsWithChildren<{ size: string }>) => {
        const { children, size } = props
        mocks.size(size)
        return <div>{children}</div>
    }
    return { cn: (...tokens: Array<string>) => tokens.join(" "), Modal: Object.assign(Root, {
        Trigger: () => null,
        Backdrop: (props: PropsWithChildren) => {
            const { children } = props
            return <div>{children}</div>
        },
        Container,
        Dialog: (props: PropsWithChildren<{ className?: string }>) => {
            const { children, className } = props
            mocks.dialogClassName(className)
            return <div role="dialog">{children}</div>
        },
        CloseTrigger: () => <button type="button" onClick={() => mocks.openChange?.(false)}>Close</button>,
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
        expect(mocks.dialogClassName).toHaveBeenCalledWith("p-4")
        expect(mocks.bodyClassName).toHaveBeenCalledWith("p-0")
        expect(screen.getByText("Body")).toBeTruthy()
    })

    it("routes a vendor close outcome to one dismissal callback", () => {
        const dismiss = vi.fn()
        render(
            <ModalBranch
                isOpen
                onDismiss={dismiss}
            >{body}</ModalBranch>,
        )
        fireEvent.click(screen.getByRole("button", { name: "Close" }))
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
})
