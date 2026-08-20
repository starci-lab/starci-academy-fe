import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { UserProfileData } from "@/modules/api/graphql/queries/types/user-profile"
import { useMutateSetFollowSwr } from "@/hooks/swr/useMutateSetFollowSwr"
import { useQueryMeSwr } from "@/hooks/swr/useQueryMeSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import { ProfileHero } from "./index"

const push = vi.fn()
const params = vi.fn<() => Record<string, string> | null>(() => ({ username: "ada" }))

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, string | number>) =>
        values === undefined ? key : `${key}:${Object.values(values).join("|")}`,
}))
vi.mock("next/navigation", () => ({ useParams: () => params() }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/hooks/swr/useQueryUserProfileSwr", () => ({ useQueryUserProfileSwr: vi.fn() }))
vi.mock("@/hooks/swr/useQueryMeSwr", () => ({ useQueryMeSwr: vi.fn() }))
vi.mock("@/hooks/swr/useMutateSetFollowSwr", () => ({ useMutateSetFollowSwr: vi.fn() }))

const ada: UserProfileData = {
    id: "user-ada",
    username: "ada",
    displayName: "Ada Lovelace",
    bio: "Analytical engine notes.",
    avatar: "https://cdn.starci.local/ada.png",
    githubUsername: "ada",
    createdAt: "2024-03-04T00:00:00.000Z",
    followerCount: 128,
    followingCount: 42,
    isFollowedByMe: false,
    profileLocked: false,
    openToWork: false,
    roleTitle: "Backend engineer",
    location: "Ha Noi",
    workMode: "Remote",
    linkedinUrl: "https://linkedin.com/in/ada",
    websiteUrl: "https://ada.dev",
}

type Stub = {
    readonly profile?: UserProfileData | null
    readonly viewerId?: string
    readonly isMutating?: boolean
}

const mutate = vi.fn()
const trigger = vi.fn(() => Promise.resolve({}))

const stub = ({ profile, viewerId, isMutating = false }: Stub) => {
    vi.mocked(useQueryUserProfileSwr).mockReturnValue({ data: profile, mutate } as never)
    vi.mocked(useQueryMeSwr).mockReturnValue({ data: viewerId === undefined ? null : { id: viewerId } } as never)
    vi.mocked(useMutateSetFollowSwr).mockReturnValue({ trigger, isMutating } as never)
}

afterEach(() => {
    vi.clearAllMocks()
    params.mockReturnValue({ username: "ada" })
    Reflect.deleteProperty(navigator, "share")
})

const withShareSheet = () => {
    const share = vi.fn(() => Promise.resolve())
    Object.defineProperty(navigator, "share", { value: share, configurable: true, writable: true })
    return share
}

describe("ProfileHero", () => {
    it("draws the resolved public identity, its facts, links and social proof", () => {
        stub({ profile: ada })
        const { container } = render(<ProfileHero />)

        expect(screen.getByRole("heading", { name: "Ada Lovelace" })).toBeInTheDocument()
        expect(screen.getByText("@ada")).toBeInTheDocument()
        expect(screen.getByText("Backend engineer")).toBeInTheDocument()
        expect(screen.getByText("Analytical engine notes.")).toBeInTheDocument()
        expect(Array.from(
            container.querySelectorAll("[data-node=\"profile-fact-run\"] [data-component=\"Badge\"]"),
            (fact) => fact.textContent,
        )).toEqual(["Ha Noi", "Remote"])
        expect(screen.getByText("followers:128")).toBeInTheDocument()
        expect(screen.getByText("following:42")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/ada")
        expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", "https://linkedin.com/in/ada")
        expect(screen.getByRole("link", { name: "https://ada.dev" })).toHaveAttribute("href", "https://ada.dev")
        expect(screen.getByText("joined:March 2024")).toBeInTheDocument()
    })

    it("rests the whole rail on the route handle while the profile is still in flight", () => {
        stub({ profile: undefined })
        const { container } = render(<ProfileHero />)

        expect(container.querySelector("[data-component=\"Avatar\"]")).toHaveAttribute("data-loading", "true")
        expect(container.querySelector("[data-component=\"Heading\"]")).toHaveAttribute("data-loading", "true")
        expect(container.querySelector("[data-node=\"profile-fact-run\"]")).toBeNull()
        expect(screen.queryByRole("link")).toBeNull()
        expect(screen.getByText("actions.follow")).toBeInTheDocument()
    })

    it("falls back to an empty handle when the route carries no username at all", () => {
        params.mockReturnValue(null)
        stub({ profile: null })
        const { container } = render(<ProfileHero />)

        expect(useQueryUserProfileSwr).toHaveBeenCalledWith(undefined)
        expect(container.querySelector("[data-node=\"profile-name-role-stack\"]")?.textContent).toBe("@")
    })

    it("offers the viewer their own edit route instead of a follow action", () => {
        stub({ profile: ada, viewerId: "user-ada" })
        render(<ProfileHero />)

        fireEvent.click(screen.getByRole("button", { name: "actions.edit" }))
        expect(push).toHaveBeenCalledExactlyOnceWith("/profile/settings/edit")
        expect(trigger).not.toHaveBeenCalled()
    })

    it("opens the GitHub profile of a learner who is open to work", () => {
        const open = vi.spyOn(window, "open").mockReturnValue(null)
        stub({ profile: { ...ada, openToWork: true }, viewerId: "user-grace" })
        render(<ProfileHero />)

        fireEvent.click(screen.getByRole("button", { name: "actions.hire" }))
        expect(open).toHaveBeenCalledExactlyOnceWith("https://github.com/ada", "_blank", "noopener,noreferrer")
        expect(trigger).not.toHaveBeenCalled()
        open.mockRestore()
    })

    it("keeps the follow action for a learner who is open to work but has no GitHub account", async () => {
        stub({ profile: { ...ada, openToWork: true, githubUsername: null }, viewerId: "user-grace" })
        render(<ProfileHero />)

        expect(screen.queryByRole("link", { name: "GitHub" })).toBeNull()
        fireEvent.click(screen.getByRole("button", { name: "actions.follow" }))
        await waitFor(() => expect(mutate).toHaveBeenCalledOnce())
        expect(trigger).toHaveBeenCalledExactlyOnceWith({ userId: "user-ada", follow: true })
    })

    it("unfollows a learner the viewer already follows and refreshes the profile", async () => {
        stub({ profile: { ...ada, isFollowedByMe: true }, viewerId: "user-grace" })
        render(<ProfileHero />)

        fireEvent.click(screen.getByRole("button", { name: "actions.following" }))
        expect(trigger).toHaveBeenCalledExactlyOnceWith({ userId: "user-ada", follow: false })
        await waitFor(() => expect(mutate).toHaveBeenCalledOnce())
    })

    it("blocks the action while a follow change is still being written", () => {
        stub({ profile: ada, viewerId: "user-grace", isMutating: true })
        const { container } = render(<ProfileHero />)

        expect(container.querySelector("[data-component=\"Button\"]")).toHaveAttribute("data-action-pending", "true")
        fireEvent.click(container.querySelector("[data-component=\"Button\"]") as HTMLElement)
        expect(trigger).not.toHaveBeenCalled()
    })

    it("does nothing but share an untitled address when the profile does not exist", () => {
        const share = withShareSheet()
        stub({ profile: null })
        render(<ProfileHero />)

        fireEvent.click(screen.getByRole("button", { name: "actions.follow" }))
        expect(trigger).not.toHaveBeenCalled()
        expect(push).not.toHaveBeenCalled()

        fireEvent.click(screen.getByRole("button", { name: "actions.share" }))
        expect(share).toHaveBeenCalledExactlyOnceWith({ title: "", url: window.location.href })
    })

    it("shares the profile through the native sheet under the person's display name", () => {
        const share = withShareSheet()
        stub({ profile: ada })
        render(<ProfileHero />)

        fireEvent.click(screen.getByRole("button", { name: "actions.share" }))
        expect(share).toHaveBeenCalledExactlyOnceWith({ title: "Ada Lovelace", url: window.location.href })
    })

    it("copies the address instead when the browser has no share sheet", () => {
        const writeText = vi.fn(() => Promise.resolve())
        Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true, writable: true })
        stub({ profile: { ...ada, displayName: null } })
        render(<ProfileHero />)

        fireEvent.click(screen.getByRole("button", { name: "actions.share" }))
        expect(writeText).toHaveBeenCalledExactlyOnceWith(window.location.href)
    })

    it("names an unnamed profile by its handle and drops every absent optional field", () => {
        stub({
            profile: {
                ...ada,
                displayName: "   ",
                bio: null,
                avatar: null,
                roleTitle: null,
                location: null,
                workMode: null,
                githubUsername: null,
                linkedinUrl: null,
                websiteUrl: null,
                followerCount: 0,
                followingCount: 0,
            },
        })
        const { container } = render(<ProfileHero />)

        expect(screen.getByRole("heading", { name: "ada" })).toBeInTheDocument()
        expect(container.querySelector("[data-node=\"profile-fact-run\"]")).toBeNull()
        expect(screen.queryByRole("link")).toBeNull()
        expect(screen.getByText("followers:0")).toBeInTheDocument()
    })

    it("shares an unnamed profile under its handle", () => {
        const share = withShareSheet()
        stub({ profile: { ...ada, displayName: null } })
        render(<ProfileHero />)

        fireEvent.click(screen.getByRole("button", { name: "actions.share" }))
        expect(share).toHaveBeenCalledExactlyOnceWith({ title: "ada", url: window.location.href })
    })

    it("leaves the joined line empty when the stored join date cannot be read", () => {
        stub({ profile: { ...ada, createdAt: "not-a-date" } })
        const { container } = render(<ProfileHero />)

        expect(container.textContent).not.toContain("joined")
        expect(container.querySelector("[data-node=\"profile-meta-list\"]")?.children).toHaveLength(4)
    })

    it("leaves the joined line empty for a profile that does not exist", () => {
        stub({ profile: null })
        const { container } = render(<ProfileHero />)

        expect(container.textContent).not.toContain("joined")
        expect(container.querySelector("[data-component=\"Avatar\"]")).toHaveAttribute("data-loading", "false")
    })
})
