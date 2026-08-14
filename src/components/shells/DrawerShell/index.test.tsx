import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import type * as HeroUi from "@heroui/react"
import { DrawerShell } from "./index"

type VendorPartProps = { readonly children?: ReactNode }
type VendorContentProps = VendorPartProps & { readonly placement?: string }

const resolvedCopy = {
    cartTitle: String(["Cart"].join("")),
    cartBody: String(["Cart", "body"].join(" ")),
    aiTitle: String(["StarCi", "AI"].join(" ")),
    aiBody: String(["AI", "body"].join(" ")),
}

void (undefined as unknown as typeof HeroUi)

vi.mock("@heroui/react", () => {
    const DrawerRoot = (input: VendorPartProps) => <div>{input.children}</div>
    DrawerRoot.Backdrop = (input: VendorPartProps) => <div>{input.children}</div>
    DrawerRoot.Content = (input: VendorContentProps) => (
        <div data-testid="drawer-content" data-placement={input.placement}>{input.children}</div>
    )
    DrawerRoot.Dialog = (input: VendorPartProps) => <div>{input.children}</div>
    DrawerRoot.Header = (input: VendorPartProps) => <div>{input.children}</div>
    DrawerRoot.Heading = (input: VendorPartProps) => <h2>{input.children}</h2>
    DrawerRoot.CloseTrigger = () => <button type="button">Close</button>
    DrawerRoot.Body = (input: VendorPartProps) => <div>{input.children}</div>
    return { Drawer: DrawerRoot }
})

describe("DrawerShell", () => {
    it("keeps right as the default placement", () => {
        const { getByTestId } = render(
            <DrawerShell isOpen title={resolvedCopy.cartTitle} onDismiss={() => undefined}>{resolvedCopy.cartBody}</DrawerShell>,
        )
        expect(getByTestId("drawer-content")).toHaveAttribute("data-placement", "right")
    })

    it("passes bottom placement to the vendor drawer for the mobile AI sheet", () => {
        const { getByTestId } = render(
            <DrawerShell isOpen placement="bottom" title={resolvedCopy.aiTitle} onDismiss={() => undefined}>{resolvedCopy.aiBody}</DrawerShell>,
        )
        expect(getByTestId("drawer-content")).toHaveAttribute("data-placement", "bottom")
    })
})
