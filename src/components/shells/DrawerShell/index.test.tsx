import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import { DrawerShell } from "./index"

vi.mock("@heroui/react", () => {
    const DrawerRoot = ({ children }: { children?: ReactNode }) => <div>{children}</div>
    DrawerRoot.Backdrop = ({ children }: { children?: ReactNode }) => <div>{children}</div>
    DrawerRoot.Content = ({ children, placement }: { children?: ReactNode, placement?: string }) => (
        <div data-testid="drawer-content" data-placement={placement}>{children}</div>
    )
    DrawerRoot.Dialog = ({ children }: { children?: ReactNode }) => <div>{children}</div>
    DrawerRoot.Header = ({ children }: { children?: ReactNode }) => <div>{children}</div>
    DrawerRoot.Heading = ({ children }: { children?: ReactNode }) => <h2>{children}</h2>
    DrawerRoot.CloseTrigger = () => <button type="button">Close</button>
    DrawerRoot.Body = ({ children }: { children?: ReactNode }) => <div>{children}</div>
    return { Drawer: DrawerRoot }
})

describe("DrawerShell", () => {
    it("keeps right as the default placement", () => {
        const { getByTestId } = render(
            <DrawerShell isOpen title="Cart" onDismiss={() => undefined}>Cart body</DrawerShell>,
        )
        expect(getByTestId("drawer-content")).toHaveAttribute("data-placement", "right")
    })

    it("passes bottom placement to the vendor drawer for the mobile AI sheet", () => {
        const { getByTestId } = render(
            <DrawerShell isOpen placement="bottom" title="StarCi AI" onDismiss={() => undefined}>AI body</DrawerShell>,
        )
        expect(getByTestId("drawer-content")).toHaveAttribute("data-placement", "bottom")
    })
})
