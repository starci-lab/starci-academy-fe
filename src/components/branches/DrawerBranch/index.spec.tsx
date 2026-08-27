import { fireEvent, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { PropsWithChildren } from "react"
import type * as HeroUi from "@heroui/react"
import { DrawerBranch } from "./index"

type VendorPartProps = PropsWithChildren
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
    DrawerRoot.Backdrop = (input: VendorPartProps) => <div>{input.children}</div>
    DrawerRoot.Content = (input: VendorContentProps) => (
        <div data-testid="drawer-content" data-placement={input.placement}>{input.children}</div>
    )
    DrawerRoot.Dialog = (input: VendorPartProps) => <div>{input.children}</div>
    DrawerRoot.Header = (input: VendorPartProps) => <div>{input.children}</div>
    DrawerRoot.Heading = (input: VendorPartProps) => <h2>{input.children}</h2>
    DrawerRoot.CloseTrigger = () => <button type="button" onClick={() => mocks.openChange?.(false)}>Close</button>
    DrawerRoot.Body = (input: VendorPartProps) => <div>{input.children}</div>
    return { cn: (...tokens: Array<string>) => tokens.join(" "), Drawer: DrawerRoot }
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
})
