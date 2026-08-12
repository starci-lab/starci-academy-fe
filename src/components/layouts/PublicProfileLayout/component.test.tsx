/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { _PublicProfileLayout, type PublicProfileLayoutProps } from "./component"

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

describe("_PublicProfileLayout", () => {
    it("owns profile tabs above the identity-and-evidence body", () => {
        const { container } = render(<_PublicProfileLayout {...base} />)
        const profileChrome = container.querySelector("[data-node=\"profile-tabs-over-body\"]")
        expect(profileChrome).toBeTruthy()
        expect(profileChrome?.querySelector("[data-node=\"underlined-tab-strip\"]")).toBeTruthy()
        expect(profileChrome?.querySelector("[data-testid=\"profile-hero\"]")).toBeTruthy()
        expect(profileChrome?.querySelector("[data-testid=\"profile-body\"]")).toBeTruthy()
        expect(screen.getByRole("tablist", { name: "Public profile sections" })).toBeTruthy()
    })

    it("suppresses route chrome for a locked visitor", () => {
        render(<_PublicProfileLayout {...base} state="locked" />)
        expect(screen.queryByRole("tablist")).toBeNull()
        expect(screen.getByText("Private")).toBeTruthy()
    })
})
