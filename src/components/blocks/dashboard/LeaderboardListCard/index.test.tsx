/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import {
    LeaderboardListCard,
    meta,
    type LeaderboardListCardProps,
    type LeaderboardRow,
} from "@/components/blocks/dashboard/LeaderboardListCard"

/**
 * What these tests guard: that one description of a ranked list is all there is - the bug this
 * block was extracted to fix was two files drawing the same section differently - and that the
 * board never reports a first load as an empty board. A learner with no rank yet and a learner
 * whose request has not answered are two different sentences.
 */

/** Two settled rows, one of them on the podium. */
const ROWS: ReadonlyArray<LeaderboardRow> = [
    { id: "a", rank: 1, rankLabel: "1st", name: "Stacy", valueLabel: "640 pts", delta: 2, deltaLabel: "up 2" },
    { id: "b", rank: 12, rankLabel: "12th", name: "Minh", valueLabel: "120 pts", delta: null, deltaLabel: "no change" },
]

/** The way out of an empty board. */
const EmptyAction = () => <span data-testid="empty-action">start</span>

/** Render with the given props and hand back the root node. */
const renderBoard = (props: Partial<LeaderboardListCardProps> = {}): Element => {
    const merged: LeaderboardListCardProps = {
        label: "Top learners",
        rows: ROWS,
        emptyTitle: "Nobody has scored this week yet",
        emptyAction: EmptyAction,
        ...props,
    }
    const { container } = render(<LeaderboardListCard {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("LeaderboardListCard rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("LeaderboardListCard", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "block", name: "LeaderboardListCard" })
    })

    it("draws one row per learner, each with the place leading it", () => {
        const root = renderBoard()
        const rows = root.querySelectorAll("[data-node='list-row']")
        expect(rows.length).toBe(2)
        expect(rows[0].children[0].textContent).toBe("1st")
        expect(rows[0].textContent).toContain("Stacy")
        expect(rows[0].textContent).toContain("640 pts")
    })

    it("marks the podium through the shared vocabulary and leaves the rest plain", () => {
        const root = renderBoard()
        const badges = root.querySelectorAll("[data-node='list-row'] [data-component='Badge']")
        expect(badges[0].getAttribute("data-tone")).toBe("success")
    })

    it("says nothing about movement when there is no baseline to compare with", () => {
        const root = renderBoard()
        const rows = root.querySelectorAll("[data-node='list-row']")
        expect(rows[0].textContent).toContain("up 2")
        expect(rows[1].textContent).not.toContain("no change")
    })

    it("puts the reader's own standing above the board", () => {
        const root = renderBoard({ standing: { primary: "Rank 1", secondary: "640 pts" } })
        const line = root.querySelector("[data-node='key-value-row']")
        expect(line?.children[0].textContent).toBe("Rank 1")
        expect(line?.children[1].textContent).toBe("640 pts")
    })

    it("says what is missing when the board settles with nobody on it", () => {
        const root = renderBoard({ rows: [] })
        expect(root.querySelector("[data-node='empty-state']")?.textContent)
            .toContain("Nobody has scored this week yet")
        expect(root.querySelector("[data-node='list-row']")).toBeNull()
    })

    it("rests as a board rather than as the reason there is not one", () => {
        const root = renderBoard({ rows: [], isLoading: true })
        expect(root.querySelector("[data-node='empty-state']")).toBeNull()
        expect(root.querySelectorAll("[data-node='list-row']").length).toBe(5)
    })
})
