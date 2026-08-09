/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import { _DashboardPage, type DashboardPageLabels } from "@/components/pages/DashboardPage/component"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: the page's ONLY job, which is where the blocks sit - and which of two
 * pages this is. The rail must be the aside of the split and the progress blocks its body: if
 * those swap, the rail stops dropping underneath at a narrow width and starts halving the column
 * the reader came for.
 *
 * The signed-out branch matters more than any of that. Every figure here comes from an
 * auth-gated request, so a visitor with no session must get a page that SAYS so and offers the
 * way in - never four regions of shimmer waiting for a request that will never be allowed.
 *
 * The blocks fetch for themselves, so the requests are mocked here to keep this test about
 * placement rather than about data.
 */

const leaves = vi.hoisted(() => ({
    weekly: {} as Record<string, unknown>,
    quota: {} as Record<string, unknown>,
    wallet: {} as Record<string, unknown>,
    courses: {} as Record<string, unknown>,
}))

vi.mock("@/hooks", () => ({
    useQueryMyWeeklyStatsSwr: () => leaves.weekly,
    useQueryMyAiQuotaSwr: () => leaves.quota,
    useQueryMyRewardWalletSwr: () => leaves.wallet,
    useQueryMyCoursesSwr: () => leaves.courses,
}))

const labels: DashboardPageLabels = {
    title: "Dashboard",
    progressHeading: "Your progress",
    railHeading: "Your standing",
    signOut: "Sign out",
    signedOutTitle: "Sign in to see your dashboard",
    signIn: "Sign in",
}

beforeEach(() => {
    leaves.weekly = { isLoading: false, data: { streak: 2, longestStreak: 9, days: [] } }
    leaves.quota = { isLoading: false, data: { credit: { remainingWeek: 3, limitWeek: 10 } } }
    leaves.wallet = { isLoading: false, data: { balance: 12 } }
    leaves.courses = { isLoading: false, data: [] }
})

afterEach(() => {
    cleanup()
})

describe("_DashboardPage", () => {
    it("draws a section holding a split", () => {
        const { container } = render(<_DashboardPage labels={labels} />)
        expect(container.firstElementChild?.getAttribute("data-node")).toBe("section")
        expect(container.querySelector("[data-node='split']")).not.toBeNull()
    })

    it("wears the registry classes rather than any of its own", () => {
        const { container } = render(<_DashboardPage labels={labels} />)
        expect(container.firstElementChild?.getAttribute("class")).toBe(contractSpec("section").classes)
        expect(container.querySelector("[data-node='split']")?.getAttribute("class")).toBe(contractSpec("split").classes)
    })

    it("titles the page once, above everything else", () => {
        const { container } = render(<_DashboardPage labels={labels} />)
        const title = container.querySelectorAll("h1")
        expect(title.length).toBe(1)
        expect(title[0].textContent).toBe(labels.title)
        expect(container.firstElementChild?.children[0].tagName).toBe("H1")
    })

    it("puts the progress column in the body role and the rail in the aside role", () => {
        const { container } = render(<_DashboardPage labels={labels} />)
        const split = container.querySelector("[data-node='split']")
        expect(split?.getAttribute("data-roles")).toBe("body aside")
        const [body, aside] = [...(split?.children ?? [])]
        expect(body.querySelector("h2")?.textContent).toBe(labels.progressHeading)
        expect(aside.getAttribute("data-node")).toBe("card")
        expect(aside.querySelector("h3")?.textContent).toBe(labels.railHeading)
    })

    it("bounds the rail as one surface holding the standing rows and the way out", () => {
        const { container } = render(<_DashboardPage labels={labels} />)
        const rail = container.querySelector("[data-node='card']")
        expect(rail?.getAttribute("data-roles")).toBe("heading body footer")
        expect(rail?.querySelectorAll("[data-node='card-header']").length).toBe(3)
    })

    it("mounts the streak strip above the course list, inside the progress column", () => {
        const { container } = render(<_DashboardPage labels={labels} />)
        // The section names the column; each block is a card INSIDE it, so its title is one
        // level deeper - the outline and the surfaces say the same thing.
        expect([...container.querySelectorAll("h2")].map((node) => node.textContent))
            .toEqual(["Your progress"])
        // The empty state's own sentence is a heading too: a reader moving by headings has to be
        // able to land on the reason a region has nothing in it, rather than on silence.
        expect([...container.querySelectorAll("h3")].map((node) => node.textContent))
            .toEqual([
                "Learning streak",
                "My courses",
                "You have not enrolled in a course yet",
                "Your standing",
            ])
    })

    it("ends the session from the rail, and only while there is one", () => {
        const onSignOut = vi.fn()
        const { container } = render(<_DashboardPage labels={labels} onSignOut={onSignOut} />)
        const signOut = [...container.querySelectorAll("button")]
            .find((button) => button.textContent?.includes(labels.signOut))
        fireEvent.click(signOut as HTMLButtonElement)
        expect(onSignOut).toHaveBeenCalledTimes(1)
    })

    it("gives a reader with no session a designed page rather than a page of shimmer", () => {
        const { container } = render(<_DashboardPage labels={labels} isSignedOut />)
        const panel = container.querySelector("[data-node='empty-state']")
        expect(panel?.getAttribute("data-roles")).toBe("media heading action")
        expect(panel?.querySelector("h2")?.textContent).toBe(labels.signedOutTitle)
        expect(container.querySelector("[data-node='split']")).toBeNull()
        expect(container.querySelector("[data-node='card-header']")).toBeNull()
    })

    it("offers the signed-out reader a real address rather than a button that navigates", () => {
        const { container } = render(<_DashboardPage labels={labels} isSignedOut />)
        const link = container.querySelector("a")
        expect(link?.getAttribute("href")).toBe("/authentication")
        expect(link?.textContent).toContain(labels.signIn)
    })
})
