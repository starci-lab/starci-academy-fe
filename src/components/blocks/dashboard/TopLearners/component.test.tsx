import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _TopLearners } from "./component"

vi.mock("@iconify/react", () => ({
    Icon: (props: Readonly<Record<string, unknown>>) => <span {...props} />,
}))

const frame = {
    label: "Top learners",
    seeMoreLabel: "View leaderboard",
    standing: { rank: 4, rankLabel: "Rank 4", title: "Rank #4 globally", subtitle: "105 XP" },
    emptyMessage: "No leaders",
    errorMessage: "Could not load leaders",
    retryLabel: "Retry",
} as const

describe("_TopLearners", () => {
    it("renders avatars, trophy artwork, follow action and a non-action viewer row", () => {
        const follow = vi.fn()
        const { container } = render(<_TopLearners state="ready" props={{
            ...frame,
            rows: [
                { id: "one", rank: 1, rankLabel: "Rank 1", name: "Ada", points: "480 XP", followLabel: "Follow" },
                { id: "self", rank: 4, rankLabel: "Rank 4", name: "Learner · You", points: "105 XP", followLabel: "Follow", isMe: true },
            ],
        }} on={{ "follow:one": follow }} />)
        expect(container.querySelectorAll("[data-component=\"Avatar\"]")).toHaveLength(2)
        expect(container.querySelector("[data-component=\"RankMark\"][icon=\"fluent-emoji-flat:trophy\"]")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Follow" }))
        expect(follow).toHaveBeenCalledOnce()
        expect(screen.getAllByRole("button", { name: "Follow" })).toHaveLength(1)
    })

    it("preserves five ranked rows while loading", () => {
        const { container } = render(<_TopLearners state="pending" props={{ ...frame, rows: [] }} />)
        expect(container.querySelectorAll("[data-node^=\"ranked-user-row\"]")).toHaveLength(5)
    })
})
