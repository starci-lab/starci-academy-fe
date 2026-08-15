/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { _ShellNav } from "./component"

vi.mock("@/components/blocks/locale/LanguageMenu", () => ({
    LanguageMenu: () => <button type="button" aria-label="Language menu" />,
}))

type MockAccountMenuProps = {
    readonly on?: { readonly signIn?: () => void }
}

vi.mock("@/components/blocks/auth/AccountMenu", () => ({
    AccountMenu: (input: MockAccountMenuProps) => (
        <button type="button" aria-label="Account menu" onClick={input.on?.signIn} />
    ),
}))

class TestResizeObserver implements ResizeObserver {
    observe = () => undefined
    unobserve = () => undefined
    disconnect = () => undefined
}

globalThis.ResizeObserver = TestResizeObserver

afterEach(cleanup)

const props = {
    brand: "StarCi Academy",
    routes: [{ id: "home", label: "Home", isCurrent: true }],
    tabs: [{ id: "overview", label: "Overview", icon: "home" as const, isCurrent: true }],
    themeLabel: "Switch theme",
    isDark: false,
    searchPlaceholder: "Search",
    searchLabel: "Open search",
    searchShortcut: "Ctrl K",
    cartLabel: "Basket",
    notificationLabel: "Notifications",
    isSignedIn: false,
} as const

describe("_ShellNav", () => {
    it("reports internal navigation without rendering href", () => {
        const navigate = vi.fn()
        render(<_ShellNav props={props} on={{ navigate }} />)
        const home = screen.getByRole("link", { name: "Home" })
        expect(home.getAttribute("href")).toBeNull()
        fireEvent.click(home)
        expect(navigate).toHaveBeenCalledWith("home")
    })

    it("draws search as one press target rather than a text field", () => {
        render(<_ShellNav props={props} />)
        expect(screen.getByRole("button", { name: "Open search" })).toBeTruthy()
        expect(screen.queryByRole("textbox")).toBeNull()
    })

    it("composes the language and account blocks with the original switch and tabs", () => {
        const { container } = render(<_ShellNav props={props} />)
        expect(screen.getByRole("switch", { name: "Switch theme" })).toBeTruthy()
        expect(screen.getByRole("button", { name: "Language menu" })).toBeTruthy()
        expect(screen.getByRole("button", { name: "Account menu" })).toBeTruthy()
        const navbar = container.querySelector("[data-node=\"double-navbar\"]")
        expect(navbar?.querySelector("[data-node=\"underlined-tab-strip\"]")).toBeTruthy()
        expect(navbar?.querySelector("[data-component=\"ExtendedTabs\"]")).toBeTruthy()
    })

    it("forwards the guest authentication journey to the account block", () => {
        const openSignIn = vi.fn()
        render(<_ShellNav props={props} on={{ openSignIn }} />)
        fireEvent.click(screen.getByRole("button", { name: "Account menu" }))
        expect(openSignIn).toHaveBeenCalledOnce()
    })
})
