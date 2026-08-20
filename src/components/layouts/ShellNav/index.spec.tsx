/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import type { AuthMode } from "@/components/blocks/auth/AuthenticationPanel/component"
import type { ShellNavRoute, ShellNavTab } from "./component"
import { ShellNav } from "."

/**
 * What these tests guard: the four things the bar cannot resolve for itself - which route the
 * reader is on, which theme is showing, whether they are signed in, and which dialog is open.
 * Each of them was silent when wrong: a navbar with no lit destination, a theme control that
 * toggles to the value already showing, and a hydration-time reveal that detached the handlers
 * on the row beneath it.
 */

type ShellNavMockInput = {
    readonly props: {
        readonly routes: ReadonlyArray<ShellNavRoute>
        readonly tabs?: ReadonlyArray<ShellNavTab>
        readonly themeLabel: string
        readonly isDark: boolean
        readonly isSignedIn: boolean
    }
    readonly on: {
        readonly openSignIn: () => void
        readonly openSignUp: () => void
        readonly navigate: (id: string) => void
        readonly selectTab: (key: string) => void
        readonly openSearch: () => void
        readonly toggleTheme: () => void
        readonly openCart: () => void
    }
}
type SignInOverlayMockInput = {
    readonly isOpen: boolean
    readonly initialMode: AuthMode
    readonly onDismiss: () => void
}
type DrawerMockInput = { readonly isOpen: boolean, readonly onDismiss: () => void }
type SearchOverlayMockInput = {
    readonly intent?: { readonly source: string }
    readonly on?: { readonly dismissed?: () => void }
}

const mocks = vi.hoisted(() => ({
    pathname: "/courses",
    searchParams: "",
    resolvedTheme: "light" as string | undefined,
    sessionToken: undefined as string | undefined,
    setTheme: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
}))

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("next-themes", () => ({
    useTheme: () => ({ resolvedTheme: mocks.resolvedTheme, setTheme: mocks.setTheme }),
}))
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(mocks.searchParams) }))
vi.mock("@/i18n/navigation", () => ({
    usePathname: () => mocks.pathname,
    useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}))
vi.mock("@/hooks/auth/useSessionToken", () => ({ useSessionToken: () => mocks.sessionToken }))
vi.mock("@/hooks/auth/useSessionRefresh", () => ({ useSessionRefresh: () => undefined }))
vi.mock("@/components/overlays/auth/SignInOverlay", () => ({
    SignInOverlay: (input: SignInOverlayMockInput) => (
        <button type="button" data-testid="sign-in" data-open={String(input.isOpen)} onClick={input.onDismiss}>
            {input.initialMode}
        </button>
    ),
}))
vi.mock("@/components/overlays/commerce/CartDrawer", () => ({
    CartDrawer: (input: DrawerMockInput) => (
        <button type="button" data-testid="cart" data-open={String(input.isOpen)} onClick={input.onDismiss}>
            Cart
        </button>
    ),
}))
vi.mock("@/components/overlays/search/GlobalSearchOverlay", () => ({
    GlobalSearchOverlay: ({ intent, on }: SearchOverlayMockInput) => intent === undefined
        ? null
        : <button type="button" onClick={on?.dismissed}>Search from {intent.source}</button>,
}))
vi.mock("./component", () => ({
    ShellNavBase: (input: ShellNavMockInput) => (
        <div>
            <span data-testid="theme">{`${input.props.themeLabel}/${String(input.props.isDark)}`}</span>
            <span data-testid="signed-in">{String(input.props.isSignedIn)}</span>
            <span data-testid="current">
                {input.props.routes.filter((route) => route.isCurrent === true).map((route) => route.id).join(",")}
            </span>
            <span data-testid="tabs">
                {input.props.tabs === undefined
                    ? "none"
                    : input.props.tabs.map((tab) => `${tab.id}${tab.isCurrent === true ? "*" : ""}`).join(",")}
            </span>
            <button type="button" onClick={input.on.openSearch}>Open search</button>
            <button type="button" onClick={input.on.openSignIn}>Sign in</button>
            <button type="button" onClick={input.on.openSignUp}>Sign up</button>
            <button type="button" onClick={input.on.toggleTheme}>Toggle theme</button>
            <button type="button" onClick={input.on.openCart}>Open cart</button>
            <button type="button" onClick={() => input.on.navigate("contact")}>Go contact</button>
            <button type="button" onClick={() => input.on.navigate("nowhere")}>Go nowhere</button>
            <button type="button" onClick={() => input.on.selectTab("overview")}>Tab overview</button>
            <button type="button" onClick={() => input.on.selectTab("explore")}>Tab explore</button>
        </div>
    ),
}))

beforeEach(() => {
    mocks.pathname = "/courses"
    mocks.searchParams = ""
    mocks.resolvedTheme = "light"
    mocks.sessionToken = undefined
    mocks.setTheme.mockReset()
    mocks.push.mockReset()
    mocks.replace.mockReset()
})

afterEach(cleanup)

describe("ShellNav connected search", () => {
    it("opens from the navbar and clears the intent on dismiss", () => {
        render(<ShellNav />)
        fireEvent.click(screen.getByRole("button", { name: "Open search" }))
        const overlay = screen.getByRole("button", { name: "Search from navbar" })
        fireEvent.click(overlay)
        expect(screen.queryByRole("button", { name: "Search from navbar" })).toBeNull()
    })

    it("opens once from Ctrl K", () => {
        render(<ShellNav />)
        fireEvent.keyDown(window, { key: "k", ctrlKey: true })
        expect(screen.getByRole("button", { name: "Search from shortcut" })).toBeTruthy()
    })

    it("opens from Cmd K on a Mac keyboard, whatever the shift state spells", () => {
        render(<ShellNav />)
        fireEvent.keyDown(window, { key: "K", metaKey: true })
        expect(screen.getByRole("button", { name: "Search from shortcut" })).toBeTruthy()
    })

    it("leaves an unmodified key and a modified other key alone", () => {
        render(<ShellNav />)
        fireEvent.keyDown(window, { key: "k" })
        fireEvent.keyDown(window, { key: "j", ctrlKey: true })
        expect(screen.queryByRole("button", { name: /^Search from/ })).toBeNull()
    })

    it("stops listening for the shortcut once the bar is gone", () => {
        const { unmount } = render(<ShellNav />)
        unmount()
        expect(() => fireEvent.keyDown(window, { key: "k", ctrlKey: true })).not.toThrow()
        expect(screen.queryByRole("button", { name: /^Search from/ })).toBeNull()
    })
})

describe("ShellNav route lighting", () => {
    it("lights a route on its own path and anywhere beneath it", () => {
        render(<ShellNav />)
        expect(screen.getByTestId("current")).toHaveTextContent("courses")
        cleanup()

        mocks.pathname = "/courses/system-design"
        render(<ShellNav />)
        expect(screen.getByTestId("current")).toHaveTextContent("courses")
    })

    it("lights nothing on a path no route owns, and refuses a mere prefix match", () => {
        mocks.pathname = "/contacts"
        render(<ShellNav />)
        expect(screen.getByTestId("current")).toBeEmptyDOMElement()
    })

    it("navigates to a known destination and ignores an id no route claims", () => {
        render(<ShellNav />)
        fireEvent.click(screen.getByRole("button", { name: "Go contact" }))
        expect(mocks.push).toHaveBeenCalledWith("/contact")

        mocks.push.mockClear()
        fireEvent.click(screen.getByRole("button", { name: "Go nowhere" }))
        expect(mocks.push).not.toHaveBeenCalled()
    })
})

describe("ShellNav dashboard tabs", () => {
    it("registers no tab layer away from the dashboard", () => {
        render(<ShellNav />)
        expect(screen.getByTestId("tabs")).toHaveTextContent("none")
    })

    it("treats a dashboard with no tab parameter as Overview", () => {
        mocks.pathname = "/dashboard"
        render(<ShellNav />)
        expect(screen.getByTestId("tabs")).toHaveTextContent("overview*,explore,courses,community")
    })

    it("follows the tab parameter the address actually carries", () => {
        mocks.pathname = "/dashboard"
        mocks.searchParams = "tab=community"
        render(<ShellNav />)
        expect(screen.getByTestId("tabs")).toHaveTextContent("overview,explore,courses,community*")
    })

    it("replaces rather than pushes, and spells Overview as the bare dashboard", () => {
        mocks.pathname = "/dashboard"
        render(<ShellNav />)
        fireEvent.click(screen.getByRole("button", { name: "Tab overview" }))
        expect(mocks.replace).toHaveBeenCalledWith("/dashboard")

        fireEvent.click(screen.getByRole("button", { name: "Tab explore" }))
        expect(mocks.replace).toHaveBeenLastCalledWith("/dashboard?tab=explore")
    })
})

describe("ShellNav theme and session", () => {
    it("offers the dark theme while a light one is showing", () => {
        render(<ShellNav />)
        expect(screen.getByTestId("theme")).toHaveTextContent("themeDark/false")
        fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }))
        expect(mocks.setTheme).toHaveBeenCalledWith("dark")
    })

    it("offers the light theme once the dark one has resolved", () => {
        mocks.resolvedTheme = "dark"
        render(<ShellNav />)
        expect(screen.getByTestId("theme")).toHaveTextContent("themeLight/true")
        fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }))
        expect(mocks.setTheme).toHaveBeenCalledWith("light")
    })

    it("reveals signed-in tools only when the browser session actually holds a token", () => {
        render(<ShellNav />)
        expect(screen.getByTestId("signed-in")).toHaveTextContent("false")
        cleanup()

        mocks.sessionToken = "token"
        render(<ShellNav />)
        expect(screen.getByTestId("signed-in")).toHaveTextContent("true")
    })
})

describe("ShellNav dialogs", () => {
    it("opens the dialog on sign-in and closes it again from every way out", () => {
        render(<ShellNav />)
        const dialog = screen.getByTestId("sign-in")
        expect(dialog.dataset.open).toBe("false")

        fireEvent.click(screen.getByRole("button", { name: "Sign in" }))
        expect(screen.getByTestId("sign-in").dataset.open).toBe("true")
        expect(screen.getByTestId("sign-in")).toHaveTextContent("signIn")

        fireEvent.click(screen.getByTestId("sign-in"))
        expect(screen.getByTestId("sign-in").dataset.open).toBe("false")
    })

    it("opens account creation without flashing the sign-in form first", () => {
        render(<ShellNav />)
        fireEvent.click(screen.getByRole("button", { name: "Sign up" }))
        expect(screen.getByTestId("sign-in").dataset.open).toBe("true")
        expect(screen.getByTestId("sign-in")).toHaveTextContent("signUp")
    })

    it("mounts one cart drawer beside the bar and opens and closes it in place", () => {
        render(<ShellNav />)
        expect(screen.getByTestId("cart").dataset.open).toBe("false")

        fireEvent.click(screen.getByRole("button", { name: "Open cart" }))
        expect(screen.getByTestId("cart").dataset.open).toBe("true")

        fireEvent.click(screen.getByTestId("cart"))
        expect(screen.getByTestId("cart").dataset.open).toBe("false")
    })
})
