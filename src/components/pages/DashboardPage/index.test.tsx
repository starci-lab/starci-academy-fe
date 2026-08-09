/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { DashboardPage } from "@/components/pages/DashboardPage"

/**
 * What these tests guard: that the page holds together when its blocks disagree about
 * what state they are in. Each block fetches for itself, so the case that matters is
 * the mixed one - a rested block beside a settled one beside an empty one - because a
 * page that shares a single loading flag would collapse all three into a blank screen.
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

/** Every request settled with nothing to show. */
const allEmpty = () => {
    leaves.weekly = { isLoading: false, data: { streak: 0, longestStreak: 0, days: [] } }
    leaves.quota = { isLoading: false }
    leaves.wallet = { isLoading: false }
    leaves.courses = { isLoading: false, data: [] }
}

beforeEach(() => {
    allLoading()
})

afterEach(() => {
    cleanup()
})

describe("DashboardPage", () => {
    it("titles the page from its own copy", () => {
        const { container } = render(<DashboardPage />)
        expect(container.querySelector("h1")?.textContent).toBe("Dashboard")
    })

    it("draws the whole page while every request is still in flight", () => {
        const { container } = render(<DashboardPage />)
        expect(container.querySelector("[data-node='split']")).not.toBeNull()
        expect(container.querySelector("[data-part='courses']")?.getAttribute("data-state")).toBe("skeleton")
        expect(container.querySelector("[data-part='readout']")?.getAttribute("data-state")).toBe("skeleton")
        expect([...container.querySelectorAll("[data-part='value']")].map((node) => node.getAttribute("data-state")))
            .toEqual(["skeleton", "skeleton", "skeleton"])
    })

    it("reads every figure once every request has settled", () => {
        allLoaded()
        const { container } = render(<DashboardPage />)
        expect(container.querySelector("[data-part='courses']")?.getAttribute("data-state")).toBe("ready")
        expect(container.querySelector("[data-part='title']")?.textContent).toBe("System Design")
        expect(container.querySelector("[data-part='current']")?.textContent).toBe("2 day streak")
        expect([...container.querySelectorAll("[data-part='value']")].map((node) => node.textContent))
            .toEqual(["2 days", "3 of 10", "12"])
    })

    it("says what is missing once the requests settle with nothing", () => {
        allEmpty()
        const { container } = render(<DashboardPage />)
        expect(container.querySelector("[data-part='courses']")?.getAttribute("data-state")).toBe("empty")
        expect(container.querySelector("[data-part='readout']")?.getAttribute("data-state")).toBe("empty")
        expect([...container.querySelectorAll("[data-part='value']")].map((node) => node.getAttribute("data-state")))
            .toEqual(["ready", "empty", "empty"])
    })

    it("lets each block settle on its own rather than behind the slowest one", () => {
        leaves.courses = { isLoading: false, data: [{ globalId: "c", label: "Full Stack", completionPercent: 10 }] }
        const { container } = render(<DashboardPage />)
        expect(container.querySelector("[data-part='courses']")?.getAttribute("data-state")).toBe("ready")
        expect(container.querySelector("[data-part='readout']")?.getAttribute("data-state")).toBe("skeleton")
    })

    it("keeps the same three blocks on screen in every state", () => {
        for (const state of [allLoading, allLoaded, allEmpty]) {
            state()
            const { container } = render(<DashboardPage />)
            expect([...container.querySelectorAll("h2")].map((node) => node.textContent))
                .toEqual(["Your progress", "Learning streak", "My courses", "Your standing"])
            cleanup()
        }
    })
})
