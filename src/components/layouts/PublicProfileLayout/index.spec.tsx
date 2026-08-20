import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PublicProfileLayout } from "."

/**
 * What these tests guard.
 *
 * The connected half settles two things the pure half must never guess: which whole-screen situation
 * the profile is in, and which tabs the asking viewer is allowed to see. A locked profile is locked
 * only for somebody else; the CV tab exists for its owner always and for a visitor only when a public
 * CV was actually published.
 *
 * It also owns canonicalization: a profile reached under a stale username is replaced with the real
 * one rather than rendered under a URL that no longer names it.
 */

const mocks = vi.hoisted(() => ({
    username: "ada" as string | undefined,
    pathname: "/profile/ada",
    push: vi.fn(),
    replace: vi.fn(),
    profile: undefined as unknown,
    profileError: undefined as unknown,
    profileMutate: vi.fn(),
    publicCv: undefined as unknown,
    viewer: undefined as unknown,
}))

vi.mock("next/navigation", () => ({ useParams: () => ({ username: mocks.username }) }))
vi.mock("@/i18n/navigation", () => ({
    usePathname: () => mocks.pathname,
    useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/hooks/swr/useQueryUserProfileSwr", () => ({
    useQueryUserProfileSwr: () => ({ data: mocks.profile, error: mocks.profileError, mutate: mocks.profileMutate }),
}))
vi.mock("@/hooks/swr/useQueryPublicUserCvSwr", () => ({ useQueryPublicUserCvSwr: () => ({ data: mocks.publicCv }) }))
vi.mock("@/hooks/swr/useQueryMeSwr", () => ({ useQueryMeSwr: () => ({ data: mocks.viewer }) }))

type LayoutStub = {
    readonly state: string
    readonly props: { readonly tabs: { readonly selectedKey: string, readonly tabs: ReadonlyArray<{ readonly id: string }> } }
    readonly on: Readonly<Record<string, ((key: string) => void) | (() => void)>>
    readonly body: React.ComponentType
}

vi.mock("./component", () => ({
    PublicProfileLayoutBase: (input: LayoutStub) => {
        const Body = input.body
        return (
            <>
                <output data-testid="state">{input.state}</output>
                <output data-testid="tabs">{input.props.tabs.tabs.map((tab) => tab.id).join(",")}</output>
                <output data-testid="selected">{input.props.tabs.selectedKey}</output>
                <button type="button" onClick={input.on.home as () => void}>home</button>
                <button type="button" onClick={input.on.browse as () => void}>browse</button>
                <button type="button" onClick={input.on.retry as () => void}>retry</button>
                <button type="button" onClick={() => (input.on.selectTab as (key: string) => void)("overview")}>tab overview</button>
                <button type="button" onClick={() => (input.on.selectTab as (key: string) => void)("skills")}>tab skills</button>
                <Body />
            </>
        )
    },
}))

const ada = { id: "user-1", username: "ada", profileLocked: false }

describe("PublicProfileLayout", () => {
    beforeEach(() => {
        mocks.username = "ada"
        mocks.pathname = "/profile/ada"
        mocks.profile = ada
        mocks.profileError = undefined
        mocks.publicCv = undefined
        mocks.viewer = { id: "user-2" }
        vi.clearAllMocks()
    })

    it("keeps the routed profile content mounted under the settled chrome", () => {
        render(<PublicProfileLayout content={<p>Overview evidence</p>} />)

        expect(screen.getByTestId("state")).toHaveTextContent("ready")
        expect(screen.getByText("Overview evidence")).toBeInTheDocument()
    })

    it("hides the CV tab from a visitor who was never shown a public CV", () => {
        render(<PublicProfileLayout content={<p />} />)
        expect(screen.getByTestId("tabs")).toHaveTextContent("overview,projects,challenges,skills,activity")
    })

    it("shows the CV tab to a visitor once a public CV exists", () => {
        mocks.publicCv = { headline: "Staff engineer" }
        render(<PublicProfileLayout content={<p />} />)
        expect(screen.getByTestId("tabs")).toHaveTextContent("overview,projects,challenges,skills,cv,activity")
    })

    it("shows the owner their own CV tab and never locks them out of their own profile", () => {
        mocks.viewer = { id: "user-1" }
        mocks.profile = { ...ada, profileLocked: true }
        render(<PublicProfileLayout content={<p />} />)

        expect(screen.getByTestId("tabs")).toHaveTextContent("cv")
        expect(screen.getByTestId("state")).toHaveTextContent("ready")
    })

    it("locks a private profile for everybody else", () => {
        mocks.profile = { ...ada, profileLocked: true }
        render(<PublicProfileLayout content={<p />} />)
        expect(screen.getByTestId("state")).toHaveTextContent("locked")
    })

    it.each([
        ["loading", undefined],
        ["not-found", null],
    ] as const)("settles as %s from the transport answer alone", (state, profile) => {
        mocks.profile = profile
        render(<PublicProfileLayout content={<p />} />)
        expect(screen.getByTestId("state")).toHaveTextContent(state)
    })

    it("settles as failed only while there is no profile to show", () => {
        mocks.profile = undefined
        mocks.profileError = new Error("network")
        const { unmount } = render(<PublicProfileLayout content={<p />} />)
        expect(screen.getByTestId("state")).toHaveTextContent("failed")
        unmount()

        mocks.profile = ada
        render(<PublicProfileLayout content={<p />} />)
        expect(screen.getByTestId("state")).toHaveTextContent("ready")
    })

    it("reads the open section from the path and defaults to the overview", () => {
        mocks.pathname = "/profile/ada/skills"
        const { unmount } = render(<PublicProfileLayout content={<p />} />)
        expect(screen.getByTestId("selected")).toHaveTextContent("skills")
        unmount()

        mocks.pathname = "/profile/ada"
        render(<PublicProfileLayout content={<p />} />)
        expect(screen.getByTestId("selected")).toHaveTextContent("overview")
    })

    it("routes the overview back to the bare profile and every other tab under it", () => {
        render(<PublicProfileLayout content={<p />} />)

        fireEvent.click(screen.getByRole("button", { name: "tab overview" }))
        expect(mocks.push).toHaveBeenCalledWith("/profile/ada")
        fireEvent.click(screen.getByRole("button", { name: "tab skills" }))
        expect(mocks.push).toHaveBeenCalledWith("/profile/ada/skills")
    })

    it("offers home, browse and retry as three distinct ways out", () => {
        render(<PublicProfileLayout content={<p />} />)

        fireEvent.click(screen.getByRole("button", { name: "home" }))
        expect(mocks.push).toHaveBeenCalledWith("/")
        fireEvent.click(screen.getByRole("button", { name: "browse" }))
        expect(mocks.push).toHaveBeenCalledWith("/courses")
        fireEvent.click(screen.getByRole("button", { name: "retry" }))
        expect(mocks.profileMutate).toHaveBeenCalledOnce()
    })

    it("replaces a stale username with the one the profile actually answers to", () => {
        mocks.username = "ada-old"
        mocks.pathname = "/profile/ada-old"
        render(<PublicProfileLayout content={<p />} />)
        expect(mocks.replace).toHaveBeenCalledWith("/profile/ada")
    })

    it("leaves a canonical URL alone", () => {
        render(<PublicProfileLayout content={<p />} />)
        expect(mocks.replace).not.toHaveBeenCalled()
    })

    it("does not canonicalize a route that carries no username at all", () => {
        mocks.username = undefined
        render(<PublicProfileLayout content={<p />} />)
        expect(mocks.replace).not.toHaveBeenCalled()
        expect(screen.getByTestId("state")).toHaveTextContent("ready")
    })
})
