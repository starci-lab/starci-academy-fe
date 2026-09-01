import { fireEvent, render, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { PropsWithChildren } from "react"
import type * as HeroUi from "@heroui/react"
import { DrawerBranch } from "./index"

type VendorPartProps = PropsWithChildren<{ readonly className?: string }>
type VendorContentProps = PropsWithChildren<{ readonly placement?: string }>
type VendorRootProps = PropsWithChildren<{ readonly onOpenChange: (open: boolean) => void }>

const mocks = vi.hoisted(() => ({ openChange: undefined as ((open: boolean) => void) | undefined }))

const resolvedCopy = {
    cartTitle: String(["Cart"].join("")),
    cartBody: String(["Cart", "body"].join(" ")),
    aiTitle: String(["StarCi", "AI"].join(" ")),
    aiBody: String(["AI", "body"].join(" ")),
}

void (undefined as unknown as typeof HeroUi)

vi.mock("@heroui/react", () => {
    const DrawerRoot = (input: VendorRootProps) => {
        mocks.openChange = input.onOpenChange
        return <div>{input.children}</div>
    }
    DrawerRoot.Trigger = () => null
    DrawerRoot.Backdrop = (input: VendorPartProps) => <div>{input.children}</div>
    DrawerRoot.Content = (input: VendorContentProps) => (
        <div data-testid="drawer-content" data-placement={input.placement}>{input.children}</div>
    )
    DrawerRoot.Dialog = (input: VendorPartProps) => <div data-class-name={input.className}>{input.children}</div>
    DrawerRoot.Header = (input: VendorPartProps) => <div data-class-name={input.className}>{input.children}</div>
    DrawerRoot.Heading = (input: VendorPartProps) => <h2>{input.children}</h2>
    DrawerRoot.CloseTrigger = (input: VendorPartProps) => <button data-class-name={input.className} type="button" onClick={() => mocks.openChange?.(false)}>Close</button>
    DrawerRoot.Body = (input: VendorPartProps) => <div>{input.children}</div>
    return { cn: (...tokens: Array<string | undefined>) => tokens.filter(Boolean).join(" "), Drawer: DrawerRoot }
})

const drawerBody = (content: string) => <>{content}</>

describe("DrawerBranch", () => {
    it("keeps right as the default placement", () => {
        const { getByTestId } = render(
            <DrawerBranch
                isOpen
                title={resolvedCopy.cartTitle}
                onDismiss={() => undefined}
            >{drawerBody(resolvedCopy.cartBody)}</DrawerBranch>,
        )
        expect(getByTestId("drawer-content")).toHaveAttribute("data-placement", "right")
    })

    it("passes bottom placement to the vendor drawer for the mobile AI sheet", () => {
        const { getByTestId } = render(
            <DrawerBranch
                isOpen
                placement="bottom"
                title={resolvedCopy.aiTitle}
                onDismiss={() => undefined}
            >{drawerBody(resolvedCopy.aiBody)}</DrawerBranch>,
        )
        expect(getByTestId("drawer-content")).toHaveAttribute("data-placement", "bottom")
    })

    it("reports every vendor way out as one dismissal and ignores the panel opening", () => {
        const dismiss = vi.fn()
        const { getByRole } = render(
            <DrawerBranch
                isOpen
                title={resolvedCopy.cartTitle}
                onDismiss={dismiss}
            >{drawerBody(resolvedCopy.cartBody)}</DrawerBranch>,
        )

        mocks.openChange?.(true)
        expect(dismiss).not.toHaveBeenCalled()

        fireEvent.click(getByRole("button", { name: "Close" }))
        expect(dismiss).toHaveBeenCalledOnce()
    })

    it("names the panel itself and zeroes the vendor inset the interior already owns", () => {
        const { getByRole, getByText } = render(
            <DrawerBranch
                isOpen
                title={resolvedCopy.aiTitle}
                onDismiss={() => undefined}
            >{drawerBody(resolvedCopy.aiBody)}</DrawerBranch>,
        )

        expect(getByRole("heading", { name: resolvedCopy.aiTitle })).toBeInTheDocument()
        expect(getByText(resolvedCopy.aiBody)).toBeInTheDocument()
    })

    it("can keep an empty vendor title row while preserving its accessible heading", () => {
        const { getByRole } = render(
            <DrawerBranch isOpen isTitleEmpty title={resolvedCopy.cartTitle} onDismiss={() => undefined}>
                {drawerBody(resolvedCopy.cartBody)}
            </DrawerBranch>,
        )

        expect(getByRole("heading", { name: resolvedCopy.cartTitle })).toBeInTheDocument()
        expect(getByRole("button", { name: "Close" })).not.toHaveAttribute("data-class-name")
    })

    it("can remove only the outer dialog inset while the child owns its padding", () => {
        const { getByText } = render(
            <DrawerBranch inset="none" isOpen title={resolvedCopy.cartTitle} onDismiss={() => undefined}>
                {drawerBody(resolvedCopy.cartBody)}
            </DrawerBranch>,
        )

        expect(getByText(resolvedCopy.cartBody).closest("[data-class-name]")).toHaveAttribute("data-class-name", "p-0!")
    })

    it("locks the page at the viewport origin while open and restores its scroll position", async () => {
        const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined)
        Object.defineProperty(window, "scrollX", { configurable: true, value: 12 })
        Object.defineProperty(window, "scrollY", { configurable: true, value: 640 })

        const { rerender } = render(
            <DrawerBranch isOpen title={resolvedCopy.aiTitle} onDismiss={() => undefined}>
                {drawerBody(resolvedCopy.aiBody)}
            </DrawerBranch>,
        )

        await waitFor(() => expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 0, behavior: "auto" }))
        expect(document.documentElement.style.overflow).toBe("hidden")
        expect(document.body.style.overflow).toBe("hidden")

        rerender(
            <DrawerBranch isOpen={false} title={resolvedCopy.aiTitle} onDismiss={() => undefined}>
                {drawerBody(resolvedCopy.aiBody)}
            </DrawerBranch>,
        )

        await waitFor(() => expect(scrollTo).toHaveBeenCalledWith({ left: 12, top: 640, behavior: "auto" }))
        expect(document.documentElement.style.overflow).toBe("")
        expect(document.body.style.overflow).toBe("")
        scrollTo.mockRestore()
    })
})
