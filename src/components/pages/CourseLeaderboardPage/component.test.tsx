import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseLeaderboardPageBase } from "./component"

/**
 * What these tests guard.
 *
 * The board keeps its header and its category switch in every situation, because both are known
 * from the route rather than from the ranking. What changes underneath is the one honest answer:
 * the viewer's standing over the podium over the ranked list, an empty course that invites climbing,
 * or a failed read that offers a retry - never an empty list dressed as a ranking.
 */

class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock)

const props = {
    title: "Course leaderboard",
    trail: [{ id: "course", label: "TypeScript" }, { id: "leaderboard", label: "Course leaderboard" }],
    categoryLabel: "Ranking category",
    selectedCategory: "total" as const,
    categories: [{ id: "total" as const, label: "Total XP" }, { id: "challenge" as const, label: "Challenge XP" }],
    board: {
        standing: { rank: 4, rankLabel: "Rank #4", title: "Rank #4", subtitle: "480 XP" },
        podium: [],
        rows: [],
    },
    listLabel: "Course standings",
    meLabel: "You",
    anonymousLabel: "Learner",
    climbLabel: "Continue learning",
    emptyMessage: "No learners are ranked in this course yet.",
    errorMessage: "Could not load the course leaderboard.",
    retryLabel: "Try again",
}

const rankedBoard = {
    standing: { rank: 4, rankLabel: "Rank #4", title: "Rank #4", subtitle: "480 XP", fact: "+120 this week" },
    podium: [
        { rank: 1, username: "Ada", avatar: null, rankLabel: "Rank 1", pointsLabel: "980 XP", isMe: false },
        { rank: 2, username: null, avatar: null, rankLabel: "Rank 2", pointsLabel: "910 XP", isMe: false },
    ],
    rows: [
        { id: "row-1", rank: 4, name: "Grace", points: "480 XP" },
        { id: "row-2", rank: 5, name: "Alan", points: "460 XP" },
    ],
    selfRow: { id: "self", rank: 12, name: "You", points: "220 XP", isMe: true },
    ellipsisLabel: "…",
}

describe("CourseLeaderboardPage", () => {
    it("keeps category context and an honest empty result", () => {
        render(<CourseLeaderboardPageBase state="empty" props={props} />)
        expect(screen.getByRole("heading", { name: "Course leaderboard" })).toBeInTheDocument()
        expect(screen.getByText("Total XP")).toBeInTheDocument()
        expect(screen.getByText("No learners are ranked in this course yet.")).toBeInTheDocument()
    })

    it("invites an unranked course to be climbed rather than retried", () => {
        const climb = vi.fn()
        const retry = vi.fn()
        render(<CourseLeaderboardPageBase state="empty" props={props} on={{ climb, retry }} />)

        fireEvent.click(screen.getByRole("button", { name: /Continue learning/ }))
        expect(climb).toHaveBeenCalledOnce()
        expect(retry).not.toHaveBeenCalled()
    })

    it("offers the way back from a failed board read", () => {
        const climb = vi.fn()
        const retry = vi.fn()
        render(<CourseLeaderboardPageBase state="failed" props={props} on={{ climb, retry }} />)

        expect(screen.getByText("Could not load the course leaderboard.")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: /Try again/ }))
        expect(retry).toHaveBeenCalledOnce()
        expect(climb).not.toHaveBeenCalled()
    })

    it("draws standing, podium, ranked rows, the gap marker and the viewer's own row", () => {
        const { container } = render(
            <CourseLeaderboardPageBase
                state="ready"
                props={{ ...props, board: rankedBoard, updatedAtLabel: "Updated 2 minutes ago" }}
            />,
        )

        expect(screen.getByText("Updated 2 minutes ago")).toBeInTheDocument()
        expect(screen.getByText("Ada")).toBeInTheDocument()
        expect(screen.getByText("Grace")).toBeInTheDocument()
        expect(screen.getByText("You")).toBeInTheDocument()
        expect(container.querySelector("[data-node=\"ranked-user-ellipsis-row\"]")).not.toBeNull()
        expect(container.querySelector("[data-node=\"league-board-stack\"]")).not.toBeNull()
    })

    it("omits the gap marker and the viewer row when the whole ranking is on screen", () => {
        const { container } = render(
            <CourseLeaderboardPageBase
                state="ready"
                props={{ ...props, board: { ...rankedBoard, ellipsisLabel: undefined, selfRow: undefined } }}
            />,
        )

        expect(container.querySelector("[data-node=\"ranked-user-ellipsis-row\"]")).toBeNull()
        expect(screen.queryByText("You")).not.toBeInTheDocument()
        expect(screen.getByText("Grace")).toBeInTheDocument()
    })

    it("rests the ranked rows while the board is in flight", () => {
        const { container } = render(
            <CourseLeaderboardPageBase state="pending" props={{ ...props, board: rankedBoard }} />,
        )

        expect(container.querySelectorAll("[data-loading=\"true\"]").length).toBeGreaterThan(0)
        expect(container.querySelector("[data-node=\"league-board-stack\"]")).not.toBeNull()
    })

    it("reports a category change and the way back to the course", () => {
        const selectCategory = vi.fn()
        const course = vi.fn()
        const climb = vi.fn()
        render(
            <CourseLeaderboardPageBase
                state="ready"
                props={{ ...props, board: rankedBoard }}
                on={{ selectCategory, course, climb }}
            />,
        )

        fireEvent.click(screen.getByText("Challenge XP"))
        expect(selectCategory).toHaveBeenCalledWith("challenge")
        fireEvent.click(screen.getByText("TypeScript"))
        expect(course).toHaveBeenCalledOnce()
    })
})
