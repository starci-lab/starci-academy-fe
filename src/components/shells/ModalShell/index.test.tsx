/** @vitest-environment jsdom */
import type { PropsWithChildren } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { ModalShell } from "."

const mocks = vi.hoisted(() => ({
    size: vi.fn(),
    dialogClassName: vi.fn(),
    bodyClassName: vi.fn(),
    openChange: undefined as ((open: boolean) => void) | undefined,
}))
vi.mock("@heroui/react", () => {
    const Root = ({ children, onOpenChange }: PropsWithChildren<{ onOpenChange: (open: boolean) => void }>) => {
        mocks.openChange = onOpenChange
        return <>{children}</>
    }
    const Container = ({ children, size }: PropsWithChildren<{ size: string }>) => {
        mocks.size(size)
        return <div>{children}</div>
    }
    return { Modal: Object.assign(Root, {
        Backdrop: ({ children }: PropsWithChildren) => <div>{children}</div>,
        Container,
        Dialog: ({ children, className }: PropsWithChildren<{ className?: string }>) => {
            mocks.dialogClassName(className)
            return <div role="dialog">{children}</div>
        },
        CloseTrigger: () => <button type="button" onClick={() => mocks.openChange?.(false)}>Close</button>,
        Body: ({ children, className }: PropsWithChildren<{ className?: string }>) => {
            mocks.bodyClassName(className)
            return <div>{children}</div>
        },
    }) }
})

afterEach(cleanup)

describe("ModalShell", () => {
    it("forwards the approved cover size to vendor mechanics", () => {
        render(<ModalShell isOpen size="cover" onDismiss={() => undefined}>Body</ModalShell>)
        expect(mocks.size).toHaveBeenCalledWith("cover")
        expect(mocks.dialogClassName).toHaveBeenCalledWith("p-4")
        expect(mocks.bodyClassName).toHaveBeenCalledWith("p-0")
        expect(screen.getByText("Body")).toBeTruthy()
    })

    it("routes a vendor close outcome to one dismissal callback", () => {
        const dismiss = vi.fn()
        render(<ModalShell isOpen onDismiss={dismiss}>Body</ModalShell>)
        fireEvent.click(screen.getByRole("button", { name: "Close" }))
        expect(dismiss).toHaveBeenCalledOnce()
    })
})
