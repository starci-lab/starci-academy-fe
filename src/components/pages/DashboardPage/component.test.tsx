/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { _DashboardPage, type DashboardPageLabels } from "@/components/pages/DashboardPage/component"
import { treeSpec } from "@/components/classNames"

/**
 * What these tests guard: the page's ONLY job, which is where the three blocks sit.
 * The rail must be the aside of the split and the progress blocks its body, in that
 * order - if those swap, the rail stops dropping underneath at a narrow width and
 * starts halving the column the reader came for.
 *
 * The blocks fetch for themselves, so the requests are mocked here to keep this test
 * about placement rather than about data.
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
        expect(container.firstElementChild?.getAttribute("class")).toBe(treeSpec("section").classes)
        expect(container.querySelector("[data-node='split']")?.getAttribute("class")).toBe(treeSpec("split").classes)
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
        expect(aside.querySelector("h2")?.textContent).toBe("Your standing")
    })

    it("mounts the streak strip above the course list, inside the progress column", () => {
        const { container } = render(<_DashboardPage labels={labels} />)
        const headings = [...container.querySelectorAll("h2")].map((node) => node.textContent)
        expect(headings).toEqual(["Your progress", "Learning streak", "My courses", "Your standing"])
    })

    it("mounts each of the three blocks exactly once", () => {
        const { container } = render(<_DashboardPage labels={labels} />)
        expect(container.querySelectorAll("[data-part='days']").length).toBe(1)
        expect(container.querySelectorAll("[data-part='courses']").length).toBe(1)
        expect(container.querySelectorAll("[data-part='value']").length).toBe(3)
    })
})
