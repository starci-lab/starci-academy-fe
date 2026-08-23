import { cleanup, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LeagueCardBase } from "./component"

const frame = {
    label: "Weekly league",
    seeMoreLabel: "View leaderboard",
    standing: { rank: 1, rankLabel: "Rank 1", title: "Rank #1", subtitle: "13 XP", fact: "4 days left" },
    emptyMessage: "No weekly rank",
    errorMessage: "Could not load weekly rank",
    retryLabel: "Retry",
} as const

describe("LeagueCardBase", () => {
    it("renders the approved standing, nested cohort and movement verdict", () => {
        const { container } = render(<LeagueCardBase state="ready" props={{
            ...frame,
            rows: [{
                id: "self",
                rank: 1,
                rankLabel: "Rank 1",
                name: "Learner · You",
                points: "13 XP",
                movementLabel: "Up 1",
                verdict: "success",
                isMe: true,
            }],
        }} on={{ seeMore: vi.fn() }} />)
        expect(screen.getByText("Rank #1")).toBeInTheDocument()
        expect(container.querySelector("[data-component=\"SurfaceListCardSurface\"]")).toHaveAttribute(
            "data-surface-context",
            "nested",
        )
        expect(container.querySelectorAll("[data-node=\"ranked-user-row-success-verdict\"]")).toHaveLength(1)
    })

    it("preserves five ranked rows while loading", () => {
        const { container } = render(<LeagueCardBase state="pending" props={{ ...frame, rows: [] }} />)
        expect(container.querySelectorAll("[data-node^=\"ranked-user-row\"]")).toHaveLength(5)
    })

    it("squares the list only while some row is actually drawing a verdict band", () => {
        const withVerdict = render(<LeagueCardBase state="ready" props={{
            ...frame,
            rows: [{ id: "one", rank: 1, name: "Ada", points: "13 XP", rankDelta: 2, verdict: "success" }],
        }} />)
        expect(withVerdict.container.querySelector("[data-component=\"SurfaceListCardSurface\"]"))
            .toHaveAttribute("data-verdict", "true")
        cleanup()

        const withoutVerdict = render(<LeagueCardBase state="ready" props={{
            ...frame,
            rows: [{ id: "one", rank: 1, name: "Ada", points: "13 XP", rankDelta: 0, movementLabel: "No movement" }],
        }} />)
        expect(withoutVerdict.container.querySelector("[data-component=\"SurfaceListCardSurface\"]"))
            .toHaveAttribute("data-verdict", "false")
    })

    it("keeps the notice empty rather than printing the word undefined at a reader", () => {
        // `emptyMessage` and `errorMessage` are both optional, so a caller can settle a situation
        // without resolving the sentence for it. The card must draw nothing, never "undefined".
        const bare = { label: "Weekly league", standing: frame.standing, rows: [] }
        const empty = render(<LeagueCardBase state="empty" props={bare} />)
        expect(empty.container.querySelector("[data-node=\"empty-notice-stack\"]")).toBeInTheDocument()
        expect(empty.queryByText("undefined")).toBeNull()
        cleanup()

        const failed = render(<LeagueCardBase state="failed" props={bare} />)
        expect(failed.queryByText("undefined")).toBeNull()
        expect(failed.container.querySelector("button")).toBeNull()
    })
})
