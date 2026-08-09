/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { IdentityStats } from "@/components/blocks/dashboard/IdentityStats"

/**
 * What these tests guard: that the connected half turns THREE independent requests into three
 * independent row states. Two cases matter most - the mixed one, because a finished row must
 * not be held back by a slow neighbour, and the FAILED one, because SWR reports a retrying key
 * as loading again and a row that believed it would shimmer for as long as the backend stayed
 * down, which is exactly what an auth-gated query does for a reader with no session.
 */

const leaves = vi.hoisted(() => ({
    weekly: {} as Record<string, unknown>,
    quota: {} as Record<string, unknown>,
    wallet: {} as Record<string, unknown>,
}))

vi.mock("@/hooks", () => ({
    useQueryMyWeeklyStatsSwr: () => leaves.weekly,
    useQueryMyAiQuotaSwr: () => leaves.quota,
    useQueryMyRewardWalletSwr: () => leaves.wallet,
}))

/** Every row currently on screen, in render order. */
const rowNodes = (container: HTMLElement): Array<Element> =>
    [...container.querySelectorAll("[data-node='card-header']")]

/** Whether each row's figure is resting, in render order. */
const restingFlags = (container: HTMLElement): Array<string> =>
    rowNodes(container).map((row) => row.children[2]?.getAttribute("data-loading") ?? "")

/** The text each row's figure is reporting, in render order. */
const values = (container: HTMLElement): Array<string> =>
    rowNodes(container).map((row) => row.children[2]?.textContent ?? "")

beforeEach(() => {
    leaves.weekly = { isLoading: true }
    leaves.quota = { isLoading: true }
    leaves.wallet = { isLoading: true }
})

afterEach(() => {
    cleanup()
})

describe("IdentityStats", () => {
    it("rests every row while the first requests are in flight", () => {
        const { container } = render(<IdentityStats />)
        expect(restingFlags(container)).toEqual(["true", "true", "true"])
    })

    it("reads each figure once its own request settles", () => {
        leaves.weekly = { isLoading: false, data: { streak: 5 } }
        leaves.quota = { isLoading: false, data: { credit: { remainingWeek: 3, limitWeek: 10 } } }
        leaves.wallet = { isLoading: false, data: { balance: 420 } }
        const { container } = render(<IdentityStats />)
        expect(restingFlags(container)).toEqual(["false", "false", "false"])
        expect(values(container)).toEqual(["5 days", "3 of 10", "420"])
    })

    it("lets a settled row show while a neighbour is still loading", () => {
        leaves.weekly = { isLoading: false, data: { streak: 2 } }
        const { container } = render(<IdentityStats />)
        expect(restingFlags(container)).toEqual(["false", "true", "true"])
    })

    it("marks a request that settled with nothing as empty rather than resting forever", () => {
        leaves.weekly = { isLoading: false }
        leaves.quota = { isLoading: false }
        leaves.wallet = { isLoading: false }
        const { container } = render(<IdentityStats />)
        expect(restingFlags(container)).toEqual(["false", "false", "false"])
        expect(values(container)).toEqual(["Sign in to see", "Sign in to see", "Sign in to see"])
    })

    it("settles a FAILED request rather than resting on a retry that reports itself as loading", () => {
        leaves.weekly = { isLoading: true, error: new Error("unreachable") }
        leaves.quota = { isLoading: true, error: new Error("unreachable") }
        leaves.wallet = { isLoading: true, error: new Error("unreachable") }
        const { container } = render(<IdentityStats />)
        expect(restingFlags(container)).toEqual(["false", "false", "false"])
        expect(values(container)).toEqual(["Sign in to see", "Sign in to see", "Sign in to see"])
    })

    it("draws the same three labelled rows in every state", () => {
        const { container } = render(<IdentityStats />)
        expect(rowNodes(container).map((row) => row.children[1].textContent))
            .toEqual(["Streak", "AI credit", "Reward points"])
        expect(rowNodes(container).length).toBe(3)
    })
})
