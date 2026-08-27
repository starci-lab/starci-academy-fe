/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { PublicProfileLayoutBase, type PublicProfileLayoutProps } from "./component"

vi.mock("@/components/blocks/profile/ProfileHero", () => ({
    ProfileHero: () => <div data-testid="profile-hero" />,
}))

class TestResizeObserver implements ResizeObserver {
    observe = () => undefined
    unobserve = () => undefined
    disconnect = () => undefined
}

globalThis.ResizeObserver = TestResizeObserver
afterEach(cleanup)

const base: PublicProfileLayoutProps = {
    state: "ready",
    props: {
        notFoundMessage: "Missing",
        failedMessage: "Failed",
        lockedMessage: "Private",
        lockedDescription: "Locked",
        homeLabel: "Home",
        retryLabel: "Retry",
        browseLabel: "Browse",
        tabs: {
            label: "Public profile sections",
            selectedKey: "overview",
            tabs: [
                { id: "overview", label: "Overview", icon: "home" },
                { id: "projects", label: "Projects", icon: "course" },
            ],
        },
    },
    on: { home: vi.fn(), browse: vi.fn(), retry: vi.fn(), selectTab: vi.fn() },
    body: () => <div data-testid="profile-body" />,
}

describe("PublicProfileLayoutBase", () => {
    it("owns profile tabs above the identity-and-evidence body", () => {
        const { container } = render(<PublicProfileLayoutBase {...base} />)
        const profileChrome = container.querySelector("main")
        expect(profileChrome).toBeTruthy()
        expect(screen.getByTestId("profile-hero")).toBeTruthy()
        expect(screen.getByTestId("profile-body")).toBeTruthy()
        expect(screen.getByRole("tablist", { name: "Public profile sections" })).toBeTruthy()
    })

    it("suppresses route chrome for a locked visitor", () => {
        render(<PublicProfileLayoutBase {...base} state="locked" />)
        expect(screen.queryByRole("tablist")).toBeNull()
        expect(screen.getByText("Private")).toBeTruthy()
    })

    it("keeps the identity rail beside a locked body and offers the way to browse", () => {
        const browse = vi.fn()
        const { container } = render(
            <PublicProfileLayoutBase {...base} state="locked" on={{ ...base.on, browse }} />,
        )

        expect(container.querySelector("[data-testid=\"profile-hero\"]")).toBeTruthy()
        expect(container.querySelector("[data-testid=\"profile-body\"]")).toBeNull()
        expect(screen.getByText("Locked")).toBeTruthy()
        fireEvent.click(screen.getByRole("button", { name: /Browse/ }))
        expect(browse).toHaveBeenCalledOnce()
    })

    it("replaces the whole profile with a retry when the read failed", () => {
        const retry = vi.fn()
        const { container } = render(
            <PublicProfileLayoutBase {...base} state="failed" on={{ ...base.on, retry }} />,
        )

        expect(container.querySelector("[data-testid=\"profile-hero\"]")).toBeNull()
        expect(screen.queryByRole("tablist")).toBeNull()
        expect(screen.getByText("Failed")).toBeTruthy()
        fireEvent.click(screen.getByRole("button", { name: /Retry/ }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("sends a reader home rather than retrying a profile that does not exist", () => {
        const home = vi.fn()
        const retry = vi.fn()
        render(<PublicProfileLayoutBase {...base} state="not-found" on={{ ...base.on, home, retry }} />)

        expect(screen.getByText("Missing")).toBeTruthy()
        fireEvent.click(screen.getByRole("button", { name: /Home/ }))
        expect(home).toHaveBeenCalledOnce()
        expect(retry).not.toHaveBeenCalled()
    })

    it("keeps the same chrome while the profile is still loading", () => {
        const { container } = render(<PublicProfileLayoutBase {...base} state="loading" />)

        expect(container.querySelector("main")).toBeTruthy()
        expect(container.querySelector("[data-testid=\"profile-body\"]")).toBeTruthy()
    })

    it("reports a tab change to the connected owner", () => {
        const selectTab = vi.fn()
        render(<PublicProfileLayoutBase {...base} on={{ ...base.on, selectTab }} />)

        fireEvent.click(screen.getByRole("tab", { name: "Projects" }))
        expect(selectTab).toHaveBeenCalledWith("projects")
    })
})
