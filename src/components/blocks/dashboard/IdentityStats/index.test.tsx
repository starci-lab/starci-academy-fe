/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { IdentityStats } from "@/components/blocks/dashboard/IdentityStats"

/**
 * What these tests guard: that the connected half turns THREE independent requests
 * into three independent row states. The interesting case is the mixed one - a
 * finished row must not be held back by a slow neighbour, and that is exactly what a
 * single shared loading flag would do.
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

/** Read the `data-state` of every value node, in render order. */
const valueStates = (container: HTMLElement): string[] =>
    [...container.querySelectorAll("[data-part='value']")].map((node) => node.getAttribute("data-state") ?? "")

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
        expect(valueStates(container)).toEqual(["skeleton", "skeleton", "skeleton"])
    })

    it("reads each figure once its own request settles", () => {
        leaves.weekly = { isLoading: false, data: { streak: 5 } }
        leaves.quota = { isLoading: false, data: { credit: { remainingWeek: 3, limitWeek: 10 } } }
        leaves.wallet = { isLoading: false, data: { balance: 420 } }
        const { container } = render(<IdentityStats />)
        expect(valueStates(container)).toEqual(["ready", "ready", "ready"])
        const values = [...container.querySelectorAll("[data-part='value']")].map((node) => node.textContent)
        expect(values).toEqual(["5 days", "3 of 10", "420"])
    })

    it("lets a settled row show while a neighbour is still loading", () => {
        leaves.weekly = { isLoading: false, data: { streak: 2 } }
        const { container } = render(<IdentityStats />)
        expect(valueStates(container)).toEqual(["ready", "skeleton", "skeleton"])
    })

    it("marks a request that settled with nothing as empty rather than resting forever", () => {
        leaves.weekly = { isLoading: false }
        leaves.quota = { isLoading: false }
        leaves.wallet = { isLoading: false }
        const { container } = render(<IdentityStats />)
        expect(valueStates(container)).toEqual(["empty", "empty", "empty"])
    })

    it("draws the same three labelled rows in every state", () => {
        const { container } = render(<IdentityStats />)
        expect([...container.querySelectorAll("[data-part='label']")].map((node) => node.textContent))
            .toEqual(["Streak", "AI credit", "Reward points"])
        expect(container.querySelectorAll("[data-node='stat']").length).toBe(3)
    })
})
