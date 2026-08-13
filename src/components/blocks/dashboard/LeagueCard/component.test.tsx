import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _LeagueCard } from "./component"

vi.mock("@iconify/react", () => ({
    Icon: (props: Readonly<Record<string, unknown>>) => <span {...props} />,
}))

const frame = {
    label: "Weekly league",
    seeMoreLabel: "View leaderboard",
    standing: { rank: 1, rankLabel: "Rank 1", title: "Rank #1", subtitle: "13 XP", fact: "4 days left" },
    emptyMessage: "No weekly rank",
    errorMessage: "Could not load weekly rank",
    retryLabel: "Retry",
} as const

describe("_LeagueCard", () => {
    it("renders the approved standing, nested cohort and movement verdict", () => {
        const { container } = render(<_LeagueCard state="ready" props={{
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
        const { container } = render(<_LeagueCard state="pending" props={{ ...frame, rows: [] }} />)
        expect(container.querySelectorAll("[data-node^=\"ranked-user-row\"]")).toHaveLength(5)
    })
})
