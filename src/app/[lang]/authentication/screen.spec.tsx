/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import { AuthenticationPage } from "@/components/pages/AuthenticationPage"

const state = vi.hoisted(() => ({ replace: vi.fn() }))

/** Props used by the panel test double. */
type AuthenticationPanelDoubleProps = {
    readonly onSignedIn?: () => void
}

vi.mock("@/i18n/navigation", () => ({
    useRouter: () => ({ replace: state.replace }),
}))

vi.mock("@/components/blocks/auth/AuthenticationPanel", () => ({
    AuthenticationPanel: ({ onSignedIn }: AuthenticationPanelDoubleProps) => (
        <button type="button" data-part="panel" onClick={onSignedIn}>Authentication</button>
    ),
}))

afterEach(() => {
    cleanup()
    state.replace.mockReset()
})

describe("authentication screen", () => {
    it("places the auth block in one centred form card", () => {
        const { container } = render(<AuthenticationPage />)

        const page = container.querySelector("[data-node='centred-authentication-page']")
        const card = page?.querySelector("[data-component='SurfaceFormCard']")
        expect(page?.classList.contains("min-h-screen")).toBe(true)
        expect(card?.querySelector("[data-part='panel']")?.textContent).toBe("Authentication")
    })

    it("returns to the dashboard after the block establishes a session", () => {
        const { getByRole } = render(<AuthenticationPage />)

        fireEvent.click(getByRole("button", { name: "Authentication" }))
        expect(state.replace).toHaveBeenCalledWith("/dashboard")
    })
})
