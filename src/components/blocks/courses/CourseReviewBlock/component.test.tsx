import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CourseReviewBlockBase } from "./component"

describe("CourseReviewBlock", () => {
    it("joins learner opinions in one list card with yellow rating stars", async () => {
        render(
            <CourseReviewBlockBase
                state="rated"
                props={{
                    averageScore: 4.5,
                    countLabel: "2 reviews",
                    emptyLabel: "No reviews yet",
                    reviews: [
                        { id: "review-1", author: "Nguyễn Minh", score: 5, body: "Clear and practical." },
                        { id: "review-2", author: "learner.two", score: 4, body: "Useful examples." },
                    ],
                    total: 2,
                }}
            />,
        )

        expect(screen.getByText("Nguyễn Minh")).toBeInTheDocument()
        expect(screen.getByText("learner.two")).toBeInTheDocument()
        expect(document.querySelectorAll("[data-component=\"SurfaceListCardSurface\"]")).toHaveLength(1)
        expect(document.querySelectorAll("[data-node=\"course-review-row\"]")).toHaveLength(2)
        expect(document.querySelector("[data-node=\"course-review-summary\"]")).toHaveClass("items-center")
        expect(document.querySelector("[data-node=\"course-review-author-line\"]")).toHaveClass("items-center")
        expect(document.querySelector("[data-node=\"course-review-author-line\"]")).not.toHaveClass("justify-between")
        expect(screen.getByRole("img", { name: "4.5/5" })).toHaveAttribute("data-rating", "4.5")
        expect(screen.getByRole("img", { name: "Nguyễn Minh: 5/5" })).toHaveAttribute("data-rating", "5")
        await waitFor(() => {
            expect(document.querySelectorAll(".react-stars > span")).toHaveLength(15)
        })
    })

    it("keeps a score-only review as a row without inventing a comment for it", () => {
        render(
            <CourseReviewBlockBase
                state="rated"
                props={{
                    averageScore: 4,
                    countLabel: "2 reviews",
                    emptyLabel: "No reviews yet",
                    reviews: [
                        { id: "review-1", author: "silent.learner", score: 4 },
                        { id: "review-2", author: "wordy.learner", score: 4, body: "Worth the time." },
                    ],
                    total: 2,
                }}
            />,
        )

        const rows = document.querySelectorAll("[data-node=\"course-review-row\"]")
        expect(rows[0]?.childElementCount).toBe(1)
        expect(rows[1]?.childElementCount).toBe(2)
        expect(rows[0]?.querySelector("[data-component=\"Text\"]")?.textContent).toBe("silent.learner")
        expect(screen.getByText("Worth the time.")).toHaveAttribute("data-tone", "muted")
        expect(screen.getByRole("img", { name: "4.0/5" })).toHaveAttribute("data-rating", "4")
    })

    it("says nobody has reviewed yet instead of drawing a zero beside five empty marks", () => {
        render(
            <CourseReviewBlockBase
                state="unrated"
                props={{
                    averageScore: 0,
                    countLabel: "0 reviews",
                    emptyLabel: "No reviews yet",
                    reviews: [],
                    total: 0,
                }}
            />,
        )

        expect(screen.getByText("No reviews yet")).toHaveAttribute("data-tone", "muted")
        expect(screen.queryByText("0.0")).toBeNull()
        expect(screen.queryByRole("img")).toBeNull()
        expect(document.querySelector("[data-node=\"course-review-block\"]")).toBeNull()
    })
})
