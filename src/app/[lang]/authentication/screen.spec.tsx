/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { AuthenticationPage } from "@/components/pages/AuthenticationPage"

const state = vi.hoisted(() => ({ replace: vi.fn(), authState: null as string | null }))

/** Props used by the panel test double. */
type AuthenticationPanelDoubleProps = {
  readonly onSignedIn?: () => void;
};

vi.mock("@/i18n/navigation", () => ({
    useRouter: () => ({ replace: state.replace }),
}))

vi.mock("next/navigation", () => ({
    useSearchParams: () => new URLSearchParams(state.authState === null ? "" : `authState=${state.authState}`),
}))

vi.mock("@/components/blocks/auth/AuthenticationPanel", () => ({
    AuthenticationPanel: ({ onSignedIn }: AuthenticationPanelDoubleProps) => (
        <button type="button" data-part="panel" onClick={onSignedIn}>
      Authentication
        </button>
    ),
}))

afterEach(() => {
    cleanup()
    state.replace.mockReset()
    state.authState = null
})

describe("authentication screen", () => {
    it("places the auth block in one centred form card", () => {
        const { container } = render(<AuthenticationPage />)

        const page = container.querySelector("main")
        const surface = page?.firstElementChild
        const grammarFrame = surface?.querySelector(".starci-core-surface")
        const scrollShadow = grammarFrame?.querySelector(":scope > .scroll-shadow--vertical")
        expect(page).toHaveClass("starci-core-form-page")
        expect(page).not.toHaveClass("items-start")
        expect(page).not.toHaveClass("px-4", "py-6")
        expect(surface).toHaveClass("starci-core-form-surface")
        expect(surface).toHaveClass("starci-core-form-surface--compact")
        expect(surface).toHaveAttribute("data-grammar-surface-card", "true")
        expect(grammarFrame).toHaveAttribute("data-grammar-frame", "bounded")
        expect(scrollShadow).toHaveAttribute("data-grammar-surface-content", "true")
        expect(scrollShadow).toHaveClass("scroll-shadow", "scroll-shadow--vertical", "scroll-shadow--hide-scrollbar", "starci-core-form-scroll-viewport")
        expect(scrollShadow).not.toHaveClass("max-w-lg", "overflow-y-auto")
        expect(grammarFrame?.querySelector("[data-slot='card-content']")).not.toBeInTheDocument()
        expect(screen.getByText("Authentication")).toBeInTheDocument()
    })

    it("keeps the OTP surface at the regular form measure", () => {
        state.authState = "sign-in-otp"
        const { container } = render(<AuthenticationPage />)

        const surface = container.querySelector("main")?.firstElementChild
        expect(surface).toHaveClass("starci-core-form-surface")
        expect(surface).not.toHaveClass("starci-core-form-surface--compact")
    })

    it("returns to the dashboard after the block establishes a session", () => {
        const { getByRole } = render(<AuthenticationPage />)

        fireEvent.click(getByRole("button", { name: "Authentication" }))
        expect(state.replace).toHaveBeenCalledWith("/dashboard")
    })
})
