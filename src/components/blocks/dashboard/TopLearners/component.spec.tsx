import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { TopLearnersBase } from "./component"

const frame = {
    label: "Top learners",
    seeMoreLabel: "View leaderboard",
    standing: { rank: 4, rankLabel: "Rank 4", title: "Rank #4 globally", subtitle: "105 XP" },
    emptyMessage: "No leaders",
    errorMessage: "Could not load leaders",
    retryLabel: "Retry",
} as const

describe("TopLearnersBase", () => {
    it("renders avatars, trophy artwork, follow action and a non-action viewer row", () => {
        const follow = vi.fn()
        render(<TopLearnersBase state="ready" props={{
            ...frame,
            rows: [
                { id: "one", rank: 1, rankLabel: "Rank 1", name: "Ada with a deliberately long learner name", subtitle: "A supporting learner subtitle that must wrap", points: "480 XP", followLabel: "Follow" },
                { id: "self", rank: 4, rankLabel: "Rank 4", name: "Learner · You", points: "105 XP", followLabel: "Follow", isMe: true },
            ],
        }} on={{ "follow:one": follow }} />)
        expect(screen.getByText("Ada with a deliberately long learner name")).toBeInTheDocument()
        expect(screen.getByText("Ada with a deliberately long learner name").closest("[data-dashboard-community-ranked-row]")).toBeInTheDocument()
        expect(screen.getByText("Learner · You")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Follow" }))
        expect(follow).toHaveBeenCalledOnce()
        expect(screen.getAllByRole("button", { name: "Follow" })).toHaveLength(1)
    })

    it("preserves five ranked rows while loading", () => {
        render(<TopLearnersBase state="pending" props={{ ...frame, rows: [] }} />)
        expect(screen.getByText("Top learners")).toBeInTheDocument()
    })

    it("offers the request again on failure, and nothing to press on a settled empty board", () => {
        const retry = vi.fn()
        const failed = render(<TopLearnersBase state="failed" props={{ ...frame, rows: [] }} on={{ retry }} />)
        expect(failed.getByText("Could not load leaders")).toBeInTheDocument()
        fireEvent.click(failed.getByRole("button", { name: "Retry" }))
        expect(retry).toHaveBeenCalledOnce()
        cleanup()

        const empty = render(<TopLearnersBase state="empty" props={{ ...frame, rows: [] }} on={{ retry }} />)
        expect(empty.getByText("No leaders")).toBeInTheDocument()
        // An empty board has nothing to re-ask for, so the notice carries no action label.
        expect(empty.queryByRole("button")).toBeNull()
    })

    it("keeps the notice empty rather than printing the word undefined at a reader", () => {
        // `emptyMessage` and `errorMessage` are both optional, so a caller can settle a situation
        // without resolving the sentence for it. The card must draw nothing, never "undefined".
        const bare = { label: "Top learners", standing: frame.standing, rows: [] }
        const empty = render(<TopLearnersBase state="empty" props={bare} />)
        expect(empty.getByText("Top learners")).toBeInTheDocument()
        expect(empty.queryByText("undefined")).toBeNull()
        cleanup()

        const failed = render(<TopLearnersBase state="failed" props={bare} />)
        expect(failed.queryByText("undefined")).toBeNull()
    })

    it("owns one joined list card while destination navigation remains tab-owned", () => {
        render(<TopLearnersBase
            state="ready"
            props={{ ...frame, rows: [{ id: "one", rank: 1, name: "Ada", points: "480 XP" }] }}
        />)
        expect(screen.queryByText("View leaderboard")).toBeNull()
        const card = screen.getByText("Top learners").closest("[data-grammar-surface-list=true]")
        expect(card).toBeInTheDocument()
        expect(card?.querySelectorAll("[data-grammar-surface=true]")).toHaveLength(1)
        expect(card?.querySelector("[data-grammar-surface-depth=nested]")).toBeNull()
    })
})
