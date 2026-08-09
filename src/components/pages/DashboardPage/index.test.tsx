/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import { DashboardPage } from "@/components/pages/DashboardPage"
import { setSessionToken } from "@/hooks/auth/useSessionToken"

/**
 * What these tests guard: the one fact this half owns, which no block can settle for itself -
 * whether there is a session at all. Without a token every request behind this page is refused
 * and SWR retries it forever, so a page that did not ask first would shimmer at a reader who is
 * not waiting for anything. With a token, the page holds together while its blocks disagree
 * about what state they are in, which is the case a shared loading flag would collapse.
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

/** A settled week. */
const week = {
    streak: 2,
    longestStreak: 9,
    days: [
        { date: "2026-08-08", active: true },
        { date: "2026-08-09", active: true },
    ],
}

/** Every request still in flight. */
const allLoading = () => {
    leaves.weekly = { isLoading: true }
    leaves.quota = { isLoading: true }
    leaves.wallet = { isLoading: true }
    leaves.courses = { isLoading: true }
}

/** Every request settled with something to show. */
const allLoaded = () => {
    leaves.weekly = { isLoading: false, data: week }
    leaves.quota = { isLoading: false, data: { credit: { remainingWeek: 3, limitWeek: 10 } } }
    leaves.wallet = { isLoading: false, data: { balance: 12 } }
    leaves.courses = {
        isLoading: false,
        data: [{ globalId: "course-1", label: "System Design", completionPercent: 40 }],
    }
}

/** Every standing row currently on screen, in render order. */
const rowNodes = (container: HTMLElement): Array<Element> =>
    [...container.querySelectorAll("[data-node='card'] [data-node='card-header']")]

beforeEach(() => {
    allLoading()
    setSessionToken("test-session-token")
})

afterEach(() => {
    cleanup()
    setSessionToken(undefined)
})

describe("DashboardPage", () => {
    it("draws the whole page while every request is still in flight", () => {
        const { container } = render(<DashboardPage />)
        expect(container.querySelector("h1")?.textContent).toBe("Dashboard")
        expect(rowNodes(container).length).toBe(3)
        expect(container.querySelectorAll("[data-part='day']").length).toBe(7)
    })

    it("reads every figure once every request has settled", () => {
        allLoaded()
        const { container } = render(<DashboardPage />)
        expect(rowNodes(container).map((row) => row.children[2].textContent))
            .toEqual(["2 days", "3 of 10", "12"])
        expect(container.querySelector("[role='progressbar']")?.getAttribute("aria-valuenow")).toBe("40")
    })

    it("lets each block settle on its own rather than behind the slowest one", () => {
        leaves.wallet = { isLoading: false, data: { balance: 7 } }
        const { container } = render(<DashboardPage />)
        const resting = rowNodes(container).map((row) => row.children[2].getAttribute("data-loading"))
        expect(resting).toEqual(["true", "true", "false"])
    })

    it("says what is missing once the requests settle with nothing", () => {
        leaves.weekly = { isLoading: false }
        leaves.quota = { isLoading: false }
        leaves.wallet = { isLoading: false }
        leaves.courses = { isLoading: false, data: [] }
        const { container } = render(<DashboardPage />)
        expect(rowNodes(container).map((row) => row.children[2].textContent))
            .toEqual(["Sign in to see", "Sign in to see", "Sign in to see"])
        expect(container.querySelector("[data-node='empty-state']")).not.toBeNull()
    })

    it("replaces the whole dashboard with the way in when there is no session", () => {
        setSessionToken(undefined)
        const { container } = render(<DashboardPage />)
        expect(container.querySelector("[data-node='empty-state'] h2")?.textContent)
            .toBe("Sign in to see your dashboard")
        expect(container.querySelector("[data-node='split']")).toBeNull()
        expect(container.querySelector("a")?.getAttribute("href")).toBe("/authentication")
    })

    it("ends the session from the rail, which puts the reader back on the signed-out page", () => {
        allLoaded()
        const { container } = render(<DashboardPage />)
        const signOut = [...container.querySelectorAll("button")]
            .find((button) => button.textContent?.includes("Sign out"))
        fireEvent.click(signOut as HTMLButtonElement)
        expect(container.querySelector("[data-node='empty-state'] h2")?.textContent)
            .toBe("Sign in to see your dashboard")
    })
})
