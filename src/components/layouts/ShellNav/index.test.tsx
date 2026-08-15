/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { ShellNav } from "."

type ShellNavMockInput = { readonly on?: { readonly openSearch?: () => void } }
type SearchOverlayMockInput = {
    readonly intent?: { readonly source: string }
    readonly on?: { readonly dismissed?: () => void }
}

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("next-themes", () => ({ useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }) }))
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }))
vi.mock("@/i18n/navigation", () => ({ usePathname: () => "/courses", useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }))
vi.mock("@/hooks/auth/useSessionToken", () => ({ useSessionToken: () => undefined }))
vi.mock("@/hooks/auth/useSessionRefresh", () => ({ useSessionRefresh: () => undefined }))
vi.mock("@/components/overlays/auth/SignInOverlay", () => ({ SignInOverlay: () => null }))
vi.mock("@/components/overlays/commerce/CartDrawer", () => ({ CartDrawer: () => null }))
vi.mock("./component", () => ({
    _ShellNav: (input: ShellNavMockInput) => <button type="button" onClick={input.on?.openSearch}>Open search</button>,
}))
vi.mock("@/components/overlays/search/GlobalSearchOverlay", () => ({
    GlobalSearchOverlay: ({ intent, on }: SearchOverlayMockInput) => intent === undefined
        ? null
        : <button type="button" onClick={on?.dismissed}>Search from {intent.source}</button>,
}))

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
})
