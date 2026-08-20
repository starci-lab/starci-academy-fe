/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, waitFor } from "@testing-library/react"
import { DashboardPage } from "@/components/pages/DashboardPage"

const state = vi.hoisted(() => ({
    token: undefined as string | undefined,
    replace: vi.fn(),
}))

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
}))

vi.mock("next/navigation", () => ({
    useSearchParams: () => new URLSearchParams(),
}))

vi.mock("@/i18n/navigation", () => ({
    useRouter: () => ({ replace: state.replace }),
}))

vi.mock("@/hooks/auth/useSessionToken", () => ({
    useSessionToken: () => state.token,
    setSessionToken: vi.fn(),
}))

vi.mock("@/hooks/auth/useSessionRefresh", () => ({
    useSessionRefresh: () => ({ isRestoring: false }),
}))

vi.mock("@/components/pages/DashboardPage/component", () => ({
    DashboardPageBase: () => <p data-part="dashboard">Dashboard</p>,
}))

afterEach(() => {
    cleanup()
    state.token = undefined
    state.replace.mockReset()
})

describe("dashboard access", () => {
    it("redirects a signed-out reader without mounting a signed-out dashboard state", async () => {
        const { container } = render(<DashboardPage />)

        await waitFor(() => expect(state.replace).toHaveBeenCalledWith("/authentication"))
        expect(container.querySelector("[data-part='dashboard']")).toBeNull()
    })

    it("mounts the dashboard only after a session exists", () => {
        state.token = "access-token"
        const { container } = render(<DashboardPage />)

        expect(container.querySelector("[data-part='dashboard']")?.textContent).toBe("Dashboard")
        expect(state.replace).not.toHaveBeenCalled()
    })
})
