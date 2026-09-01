/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { ShellNavBase, ShellNavigationDrawerBase } from "./component"

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
    routes: [{ id: "home", label: "Home", icon: "home" as const, isCurrent: true }],
    featureTabs: [{ id: "overview", label: "Overview", icon: "home" as const, isCurrent: true }],
    themeLabel: "Switch theme",
    utilitiesLabel: "Display utilities",
    actionsLabel: "Account and commerce",
    localeActionLabel: "Tiếng Việt",
    isDark: false,
    searchPlaceholder: "Search",
    searchLabel: "Open search",
    searchShortcut: "Ctrl K",
    cartLabel: "Basket",
    notificationLabel: "Notifications",
    isSignedIn: false,
} as const

describe("ShellNavBase", () => {
    it("reports internal navigation without rendering href", () => {
        const navigate = vi.fn()
        render(<ShellNavBase props={props} on={{ navigate }} />)
        const home = screen.getByRole("link", { name: "Home" })
        expect(home.getAttribute("href")).toBeNull()
        fireEvent.click(home)
        expect(navigate).toHaveBeenCalledWith("home")
    })

    it("draws search as one press target rather than a text field", () => {
        render(<ShellNavBase props={props} />)
        expect(screen.getByRole("button", { name: "Open search" })).toBeTruthy()
        expect(screen.queryByRole("textbox")).toBeNull()
    })

    it("forwards one search press to the connected shell owner", () => {
        const openSearch = vi.fn()
        render(<ShellNavBase props={props} on={{ openSearch }} />)
        fireEvent.click(screen.getByRole("button", { name: "Open search" }))
        expect(openSearch).toHaveBeenCalledOnce()
    })

    it("uses the compact overflow as one drawer trigger rather than a cramped popover", () => {
        const openNavigation = vi.fn()
        render(<ShellNavBase props={props} on={{ openNavigation }} />)

        fireEvent.click(screen.getByRole("button", { name: "Display utilities" }))
        expect(openNavigation).toHaveBeenCalledOnce()
        expect(screen.queryByRole("menu")).toBeNull()
    })

    it("renders the complete compact navigation and utilities inside the drawer body", () => {
        const navigate = vi.fn()
        const openSearch = vi.fn()
        const toggleLocale = vi.fn()
        const toggleTheme = vi.fn()
        render(<ShellNavigationDrawerBase props={props} on={{ navigate, openSearch, toggleLocale, toggleTheme }} />)

        fireEvent.click(screen.getByRole("link", { name: "Home" }))
        expect(navigate).toHaveBeenCalledWith("home")

        fireEvent.click(screen.getByRole("button", { name: "Open search" }))
        expect(openSearch).toHaveBeenCalledOnce()

        fireEvent.click(screen.getByRole("button", { name: "Tiếng Việt" }))
        expect(toggleLocale).toHaveBeenCalledOnce()

        fireEvent.click(screen.getByRole("button", { name: "Switch theme" }))
        expect(toggleTheme).toHaveBeenCalledOnce()
    })

    it("composes the language and account blocks with the original switch and tabs", () => {
        render(<ShellNavBase props={props} />)
        expect(screen.getByRole("switch", { name: "Switch theme" })).toBeTruthy()
        expect(screen.getByRole("button", { name: "Language menu" })).toBeTruthy()
        expect(screen.getByRole("button", { name: "Account menu" })).toBeTruthy()
        expect(screen.getByRole("tablist")).toBeTruthy()
    })

    it("forwards the guest authentication journey to the account block", () => {
        const openSignIn = vi.fn()
        render(<ShellNavBase props={props} on={{ openSignIn }} />)
        fireEvent.click(screen.getByRole("button", { name: "Account menu" }))
        expect(openSignIn).toHaveBeenCalledOnce()
    })

    it("sends the brand back to the dashboard", () => {
        const navigate = vi.fn()
        render(<ShellNavBase props={props} on={{ navigate }} />)
        const brand = screen.getAllByRole("link").find((link) => link.textContent?.includes("StarCi"))
        expect(brand).not.toBeNull()
        expect(brand?.querySelector("img")?.getAttribute("src")).toContain("starci-logo.png")
        fireEvent.click(brand as Element)
        expect(navigate).toHaveBeenCalledWith("dashboard")
    })

    it("offers notifications only to a viewer who has some", () => {
        const { rerender } = render(<ShellNavBase props={props} />)
        expect(screen.queryByRole("button", { name: "Notifications" })).toBeNull()

        rerender(<ShellNavBase props={{ ...props, isSignedIn: true }} />)
        expect(screen.getByRole("button", { name: "Notifications" })).toBeTruthy()
    })

    it("opens the basket from the navbar while the panel stays the shell's", () => {
        const openCart = vi.fn()
        render(<ShellNavBase props={props} on={{ openCart }} />)
        fireEvent.click(screen.getByRole("button", { name: "Basket" }))
        expect(openCart).toHaveBeenCalledOnce()
    })

    it("drops the whole bottom layer for a page that owns no tabs", () => {
        render(<ShellNavBase props={{ ...props, featureTabs: undefined }} />)
        expect(screen.queryByRole("tablist")).toBeNull()
    })

    it("falls back to the overview tab when no page tab claims to be current", () => {
        const selectTab = vi.fn()
        render(
            <ShellNavBase
                props={{ ...props, featureTabs: [{ id: "overview", label: "Overview", icon: "home" }, { id: "courses", label: "Courses", icon: "course" }] }}
                on={{ selectFeatureTab: selectTab }}
            />,
        )

        expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true")
        fireEvent.click(screen.getByRole("tab", { name: "Courses" }))
        expect(selectTab).toHaveBeenCalledWith("courses")
    })

    it("reports the theme change the switch raises", () => {
        const toggleTheme = vi.fn()
        render(<ShellNavBase props={props} on={{ toggleTheme }} />)
        fireEvent.click(screen.getByRole("switch", { name: "Switch theme" }))
        expect(toggleTheme).toHaveBeenCalled()
    })
})
