/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { _ShellNav } from "./component"

class TestResizeObserver implements ResizeObserver {
    observe = () => undefined
    unobserve = () => undefined
    disconnect = () => undefined
}

globalThis.ResizeObserver = TestResizeObserver

afterEach(cleanup)

const props = {
    brand: "StarCi Academy",
    routes: [{ id: "home", href: "/dashboard", label: "Home", isCurrent: true }],
    tabs: [{ id: "overview", href: "/dashboard", label: "Overview", icon: "home" as const, isCurrent: true }],
    themeLabel: "Switch theme",
    isDark: false,
    localeLabel: "Change language",
    searchPlaceholder: "Search",
    searchLabel: "Open search",
    searchShortcut: "Ctrl K",
    cartLabel: "Basket",
    notificationLabel: "Notifications",
    accountLabel: "Account",
    isSignedIn: false,
} as const

describe("_ShellNav", () => {
    it("draws search as one press target rather than a text field", () => {
        render(<_ShellNav props={props} />)
        expect(screen.getByRole("button", { name: "Open search" })).toBeTruthy()
        expect(screen.queryByRole("textbox")).toBeNull()
    })

    it("draws the original switch, icon-only account trigger and ExtendedTabs bottom layer", () => {
        const { container } = render(<_ShellNav props={props} />)
        expect(screen.getByRole("switch", { name: "Switch theme" })).toBeTruthy()
        expect(screen.getByRole("button", { name: "Account" })).toBeTruthy()
        expect(screen.queryByText("Sign in")).toBeNull()
        const navbar = container.querySelector("[data-node=\"double-navbar\"]")
        expect(navbar?.querySelector("[data-node=\"underlined-tab-strip\"]")).toBeTruthy()
        expect(navbar?.querySelector("[data-component=\"ExtendedTabs\"]")).toBeTruthy()
    })
})
