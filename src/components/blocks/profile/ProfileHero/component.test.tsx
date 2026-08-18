import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _ProfileHero, type ProfileHeroData } from "./component"

const settled: ProfileHeroData = {
    name: "Ada Lovelace",
    handle: "ada",
    avatar: "https://cdn.starci.local/ada.png",
    role: "Backend engineer",
    bio: "Building the analytical engine, one lesson at a time.",
    location: "Ha Noi",
    workMode: "Remote",
    followerLabel: "128 followers",
    followingLabel: "42 following",
    primaryLabel: "Follow",
    primaryPending: false,
    shareLabel: "Share profile",
    githubUrl: "https://github.com/ada",
    linkedinUrl: "https://linkedin.com/in/ada",
    websiteUrl: "https://ada.dev",
    joinedLabel: "Joined March 2024",
}

const bare: ProfileHeroData = {
    name: "Grace Hopper",
    handle: "grace",
    followerLabel: "0 followers",
    followingLabel: "0 following",
    primaryLabel: "Edit profile",
    primaryPending: false,
    shareLabel: "Share profile",
    joinedLabel: "Joined January 2025",
}

const facts = (root: HTMLElement) =>
    Array.from(root.querySelectorAll("[data-node=\"profile-fact-run\"] [data-component=\"Badge\"]"), (fact) => fact.textContent)

const metaItems = (root: HTMLElement) =>
    Array.from(root.querySelectorAll("[data-node=\"profile-meta-list\"] > *"), (item) => item.textContent)

describe("_ProfileHero", () => {
    it("draws the whole identity rail when every public field is present", () => {
        const { container } = render(<_ProfileHero state="ready" props={settled} />)

        expect(container.querySelector("[data-node=\"profile-hero-rail\"]")).not.toBeNull()
        expect(screen.getByRole("heading", { name: "Ada Lovelace" })).toBeInTheDocument()
        expect(screen.getByText("@ada")).toBeInTheDocument()
        expect(screen.getByText("Backend engineer")).toBeInTheDocument()
        expect(screen.getByText("Building the analytical engine, one lesson at a time.")).toBeInTheDocument()
        expect(facts(container)).toEqual(["Ha Noi", "Remote"])
        expect(container.querySelector("[data-node=\"profile-proof-row\"]")?.textContent)
            .toBe("128 followers42 following")
        const avatar = container.querySelector("[data-component=\"Avatar\"]")
        expect(avatar).toHaveAttribute("data-size", "lg")
        expect(avatar).toHaveAttribute("data-loading", "false")
    })

    it("lists each supplied external destination as a link, followed by the joined date", () => {
        const { container } = render(<_ProfileHero state="ready" props={settled} />)

        expect(metaItems(container)).toEqual(["GitHub", "LinkedIn", "https://ada.dev", "Joined March 2024"])
        expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/ada")
        expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", "https://linkedin.com/in/ada")
        expect(screen.getByRole("link", { name: "https://ada.dev" })).toHaveAttribute("href", "https://ada.dev")
    })

    it("drops the role, bio, fact run and every link when the profile carries none of them", () => {
        const { container } = render(<_ProfileHero state="ready" props={bare} />)

        expect(container.querySelector("[data-node=\"profile-fact-run\"]")).toBeNull()
        expect(screen.queryByRole("link")).toBeNull()
        expect(metaItems(container)).toEqual(["Joined January 2025"])
        expect(container.querySelector("[data-node=\"profile-name-role-stack\"]")?.textContent)
            .toBe("Grace Hopper@grace")
    })

    it("keeps a single-fact run when only one of location and work mode is public", () => {
        const { container } = render(<_ProfileHero state="ready" props={{ ...bare, workMode: "Hybrid" }} />)

        expect(facts(container)).toEqual(["Hybrid"])
    })

    it("reports the primary press and the share press to its owner", () => {
        const primary = vi.fn()
        const share = vi.fn()
        render(<_ProfileHero state="ready" props={settled} on={{ primary, share }} />)

        fireEvent.click(screen.getByRole("button", { name: "Follow" }))
        expect(primary).toHaveBeenCalledOnce()

        fireEvent.click(screen.getByRole("button", { name: "Share profile" }))
        expect(share).toHaveBeenCalledOnce()
    })

    it("blocks the primary action while the follow change is still in flight", () => {
        const primary = vi.fn()
        const { container } = render(
            <_ProfileHero state="ready" props={{ ...settled, primaryPending: true }} on={{ primary }} />,
        )

        const button = container.querySelector("[data-component=\"Button\"]")
        expect(button).toHaveAttribute("data-action-pending", "true")
        fireEvent.click(button as HTMLElement)
        expect(primary).not.toHaveBeenCalled()
    })

    it("rests the avatar, identity, proof and joined line while the profile is in flight", () => {
        const { container } = render(<_ProfileHero state="pending" props={settled} />)

        expect(container.querySelector("[data-component=\"Avatar\"]")).toHaveAttribute("data-loading", "true")
        expect(container.querySelector("[data-component=\"Heading\"]")).toHaveAttribute("data-loading", "true")
        expect(container.querySelector("[data-component=\"Button\"]")).toHaveAttribute("data-loading", "true")
        expect(Array.from(
            container.querySelectorAll("[data-node=\"profile-fact-run\"] [data-component=\"Badge\"]"),
            (fact) => fact.getAttribute("data-loading"),
        )).toEqual(["true", "true"])
        expect(screen.queryByText("Joined March 2024")).toBeNull()
    })

    it("still draws the rail when no owner listens to its actions", () => {
        render(<_ProfileHero state="ready" props={settled} />)

        fireEvent.click(screen.getByRole("button", { name: "Follow" }))
        fireEvent.click(screen.getByRole("button", { name: "Share profile" }))
        expect(screen.getByRole("heading", { name: "Ada Lovelace" })).toBeInTheDocument()
    })
})
