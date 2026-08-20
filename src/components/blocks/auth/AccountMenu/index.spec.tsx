/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { mutate } from "swr"
import { setSessionToken, useSessionToken } from "@/hooks/auth/useSessionToken"
import { useQueryMeSwr } from "@/hooks/swr/useQueryMeSwr"
import { useMutateSignOutSwr } from "@/hooks/swr/useMutateSignOutSwr"
import { AccountMenu } from "./index"

const push = vi.fn()

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("swr", () => ({ mutate: vi.fn() }))

vi.mock("@/hooks/auth/useSessionToken", () => ({
    setSessionToken: vi.fn(),
    useSessionToken: vi.fn(),
}))

vi.mock("@/hooks/swr/useQueryMeSwr", () => ({
    QUERY_ME_SWR_KEY: ["QUERY_ME_SWR"],
    useQueryMeSwr: vi.fn(),
}))

vi.mock("@/hooks/swr/useMutateSignOutSwr", () => ({ useMutateSignOutSwr: vi.fn() }))

/** One viewer identity as the `me` query resolves it. */
type Identity = {
    readonly id: string
    readonly username?: string | null
    readonly email?: string | null
    readonly displayName?: string | null
    readonly avatar?: string | null
}

/** One complete situation the block can be in: a session, an identity, and two requests. */
type AccountMenuSituation = {
    /** The stored access token, absent while nobody is signed in. */
    readonly token?: string
    /** What the identity query resolved to, `null` once it resolved to nobody. */
    readonly identity?: Identity | null
    /** Whether that query is still in flight. */
    readonly isLoading?: boolean
    /** Whether a sign-out this menu started has yet to settle. */
    readonly isMutating?: boolean
}

/** Put the block in one signed-in or guest situation, and hand back its sign-out trigger. */
const stub = (over: AccountMenuSituation) => {
    const trigger = vi.fn().mockResolvedValue({ success: true })
    vi.mocked(useSessionToken).mockReturnValue(over.token)
    vi.mocked(useQueryMeSwr).mockReturnValue({
        data: over.identity,
        error: undefined,
        isLoading: over.isLoading ?? false,
        mutate: vi.fn(),
    } as never)
    vi.mocked(useMutateSignOutSwr).mockReturnValue({
        trigger,
        isMutating: over.isMutating ?? false,
    } as never)
    return trigger
}

/** Open the menu and wait for its popover to arrive. */
const open = async () => {
    fireEvent.click(screen.getByRole("button", { name: "account" }))
    await screen.findByRole("menu")
}

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
})

describe("AccountMenu", () => {
    it("offers a signed-out reader the two ways in and nothing else", async () => {
        const signIn = vi.fn()
        const signUp = vi.fn()
        stub({ token: undefined })

        render(<AccountMenu on={{ signIn, signUp }} />)
        await open()

        expect(screen.getByText("guestMessage")).toBeInTheDocument()
        expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
            "signIn",
            "signUp",
        ])

        fireEvent.click(screen.getByRole("menuitem", { name: "signUp" }))
        expect(signUp).toHaveBeenCalledOnce()
        expect(signIn).not.toHaveBeenCalled()
    })

    it("still draws the guest menu when the shell wired no overlays to it", async () => {
        stub({ token: undefined })

        render(<AccountMenu />)
        await open()
        expect(screen.getByText("guestMessage")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("menuitem", { name: "signIn" }))
        await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
    })

    it("names a signed-in reader by their display name and shows their address", async () => {
        stub({
            token: "access-token",
            identity: {
                id: "u-1",
                displayName: "StarCi Learner",
                username: "learner",
                email: "learner@starci.local",
                avatar: "https://cdn.starci.local/learner.png",
            },
        })

        render(<AccountMenu />)
        await open()

        expect(screen.getByText("StarCi Learner")).toBeInTheDocument()
        expect(screen.getByText("learner@starci.local")).toBeInTheDocument()
        expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
            "accountMenu.dashboard",
            "accountMenu.profile",
            "accountMenu.cv",
            "accountMenu.signOut",
        ])
    })

    it("falls back to the handle when the account has never been given a display name", async () => {
        stub({ token: "access-token", identity: { id: "u-1", displayName: "", username: "learner" } })

        render(<AccountMenu />)
        await open()

        expect(screen.getByText("learner")).toBeInTheDocument()
    })

    it("says only the generic word for an account the identity query resolved to nobody", async () => {
        stub({ token: "access-token", identity: null })

        render(<AccountMenu />)
        await open()

        expect(screen.getByText("account")).toBeInTheDocument()
        expect(screen.getByRole("menuitem", { name: "accountMenu.cv" })).toHaveAttribute("data-disabled", "true")
    })

    it("rests the identity row while the viewer query is still in flight", async () => {
        stub({ token: "access-token", identity: undefined, isLoading: true })

        const { container } = render(<AccountMenu />)
        await open()

        expect(container.querySelector("[data-loading=\"true\"]")).toBeInTheDocument()
        expect(screen.queryByText("account")).toBeNull()
    })

    it("sends the reader to the dashboard and to the profile from their own rows", async () => {
        stub({ token: "access-token", identity: { id: "u-1", displayName: "Reader", username: "reader" } })

        render(<AccountMenu />)
        await open()
        fireEvent.click(screen.getByRole("menuitem", { name: "accountMenu.dashboard" }))
        expect(push).toHaveBeenCalledExactlyOnceWith("/dashboard")

        await open()
        fireEvent.click(screen.getByRole("menuitem", { name: "accountMenu.profile" }))
        expect(push).toHaveBeenLastCalledWith("/profile")
    })

    it("addresses the CV by the reader's own handle", async () => {
        stub({ token: "access-token", identity: { id: "u-1", displayName: "Reader", username: "reader" } })

        render(<AccountMenu />)
        await open()
        fireEvent.click(screen.getByRole("menuitem", { name: "accountMenu.cv" }))
        expect(push).toHaveBeenCalledExactlyOnceWith("/profile/reader/cv")
    })

    it("refuses the CV journey to an account that has no handle to address it by", async () => {
        stub({ token: "access-token", identity: { id: "u-1", displayName: "Reader" } })

        render(<AccountMenu />)
        await open()
        const cv = screen.getByRole("menuitem", { name: "accountMenu.cv" })
        expect(cv).toHaveAttribute("data-disabled", "true")

        fireEvent.click(cv)
        expect(push).not.toHaveBeenCalled()
    })

    it("clears the stored token and drops the cached identity once the sign-out lands", async () => {
        const trigger = stub({ token: "access-token", identity: { id: "u-1", username: "reader" } })

        render(<AccountMenu />)
        await open()
        fireEvent.click(screen.getByRole("menuitem", { name: "accountMenu.signOut" }))

        expect(trigger).toHaveBeenCalledOnce()
        await waitFor(() => expect(setSessionToken).toHaveBeenCalledExactlyOnceWith(undefined))
        expect(mutate).toHaveBeenCalledOnce()

        const [match, value, options] = vi.mocked(mutate).mock.calls[0]
        expect(value).toBeUndefined()
        expect(options).toEqual({ revalidate: false })

        // The sign-out drops every identity entry, whichever viewer it was cached under, and
        // leaves every other cache namespace - and every non-tuple key - exactly where it was.
        const matches = match as (key: unknown) => boolean
        expect(matches(["QUERY_ME_SWR", "viewer-1"])).toBe(true)
        expect(matches(["QUERY_MY_KPIS_SWR", "viewer-1"])).toBe(false)
        expect(matches("MUTATE_SIGN_OUT_SWR")).toBe(false)
    })

    it("holds the sign-out row back while the sign-out it started is still in flight", async () => {
        stub({ token: "access-token", identity: { id: "u-1", username: "reader" }, isMutating: true })

        render(<AccountMenu />)
        await open()

        expect(screen.getByRole("menuitem", { name: "accountMenu.signOut" }))
            .toHaveAttribute("data-disabled", "true")
    })
})
