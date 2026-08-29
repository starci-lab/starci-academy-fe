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
        retryLabel: "Retry",
        retryPending: false,
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
    on: { browse: vi.fn(), retry: vi.fn(), selectTab: vi.fn() },
    body: () => <div data-testid="profile-body" />,
}

describe("PublicProfileLayoutBase", () => {
    it("owns profile tabs above a full-width identity and evidence body", () => {
        const { container } = render(<PublicProfileLayoutBase {...base} />)
        expect(container.querySelector("main")).toBeNull()
        const hero = screen.getByTestId("profile-hero")
        const identity = hero.parentElement
        const stack = identity?.parentElement
        expect(hero).toBeTruthy()
        expect(identity).toHaveClass("w-full", "min-w-0")
        expect(stack).toHaveClass("flex", "w-full", "min-w-0", "flex-col", "gap-6")
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

    it("keeps the failure context and marks retry pending while revalidation runs", () => {
        render(<PublicProfileLayoutBase {...base} state="failed" props={{ ...base.props, retryPending: true }} />)

        expect(screen.getByText("Failed")).toBeTruthy()
        const retry = screen.getByRole("button", { name: /Retry/ })
        expect(retry).toHaveAttribute("data-action-pending", "true")
        expect(retry).toBeDisabled()
    })

    it("sends a reader to public content rather than retrying a profile that does not exist", () => {
        const browse = vi.fn()
        const retry = vi.fn()
        render(<PublicProfileLayoutBase {...base} state="not-found" on={{ ...base.on, browse, retry }} />)

        expect(screen.getByText("Missing")).toBeTruthy()
        fireEvent.click(screen.getByRole("button", { name: /Browse/ }))
        expect(browse).toHaveBeenCalledOnce()
        expect(retry).not.toHaveBeenCalled()
    })

    it("keeps the same chrome while the profile is still loading", () => {
        const { container } = render(<PublicProfileLayoutBase {...base} state="loading" />)

        expect(container.querySelector("main")).toBeNull()
        expect(container.querySelector("[data-testid=\"profile-body\"]")).toBeTruthy()
    })

    it("reports a tab change to the connected owner", () => {
        const selectTab = vi.fn()
        render(<PublicProfileLayoutBase {...base} on={{ ...base.on, selectTab }} />)

        fireEvent.click(screen.getByRole("tab", { name: "Projects" }))
        expect(selectTab).toHaveBeenCalledWith("projects")
    })
})
