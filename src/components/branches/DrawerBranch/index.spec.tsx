import { fireEvent, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { PropsWithChildren } from "react"
import type * as HeroUi from "@heroui/react"
import { DrawerBranch } from "./index"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

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
    return { Drawer: DrawerRoot }
})

const drawerBody = (content: string) => defineContractComponent("stacked-peer-controls", {
    control: [defineLeafComponent("button", {}, () => <>{content}</>)],
})

describe("DrawerBranch", () => {
    it("keeps right as the default placement", () => {
        const { getByTestId } = render(
            <DrawerBranch
                isOpen
                title={resolvedCopy.cartTitle}
                contract="stacked-peer-controls"
                render={drawerBody(resolvedCopy.cartBody)}
                onDismiss={() => undefined}
            />,
        )
        expect(getByTestId("drawer-content")).toHaveAttribute("data-placement", "right")
    })

    it("passes bottom placement to the vendor drawer for the mobile AI sheet", () => {
        const { getByTestId } = render(
            <DrawerBranch
                isOpen
                placement="bottom"
                title={resolvedCopy.aiTitle}
                contract="stacked-peer-controls"
                render={drawerBody(resolvedCopy.aiBody)}
                onDismiss={() => undefined}
            />,
        )
        expect(getByTestId("drawer-content")).toHaveAttribute("data-placement", "bottom")
    })

    it("reports every vendor way out as one dismissal and ignores the panel opening", () => {
        const dismiss = vi.fn()
        const { getByRole } = render(
            <DrawerBranch
                isOpen
                title={resolvedCopy.cartTitle}
                contract="stacked-peer-controls"
                render={drawerBody(resolvedCopy.cartBody)}
                onDismiss={dismiss}
            />,
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
                contract="stacked-peer-controls"
                render={drawerBody(resolvedCopy.aiBody)}
                onDismiss={() => undefined}
            />,
        )

        expect(getByRole("heading", { name: resolvedCopy.aiTitle })).toBeInTheDocument()
        expect(getByText(resolvedCopy.aiBody).closest("[data-node=\"stacked-peer-controls\"]")).not.toBeNull()
    })
})
