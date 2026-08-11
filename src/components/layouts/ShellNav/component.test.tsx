/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { _ShellNav } from "./component"

afterEach(cleanup)

const props = {
    brand: "StarCi Academy",
    routes: [{ id: "home", href: "/dashboard", label: "Home", isCurrent: true }],
    tabs: [{ id: "overview", href: "/dashboard", label: "Overview", icon: "home" as const, isCurrent: true }],
    signInLabel: "Sign in",
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

    it("draws theme as a switch and tabs as the navbar bottom layer", () => {
        const { container } = render(<_ShellNav props={props} />)
        expect(screen.getByRole("switch", { name: "Switch theme" })).toBeTruthy()
        const navbar = container.querySelector("[data-node=\"double-navbar\"]")
        expect(navbar?.querySelector("[data-node=\"underlined-tab-strip\"]")).toBeTruthy()
    })
})
