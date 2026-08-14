import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CourseLeaderboardPage } from "./component"

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
    categories: [{ id: "total" as const, label: "Total XP" }],
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

describe("CourseLeaderboardPage", () => {
    it("keeps category context and an honest empty result", () => {
        render(<_CourseLeaderboardPage state="empty" props={props} />)
        expect(screen.getByRole("heading", { name: "Course leaderboard" })).toBeInTheDocument()
        expect(screen.getByText("Total XP")).toBeInTheDocument()
        expect(screen.getByText("No learners are ranked in this course yet.")).toBeInTheDocument()
    })
})
