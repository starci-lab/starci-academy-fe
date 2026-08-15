import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { _CourseReviewBlock } from "./component"

describe("CourseReviewBlock", () => {
    it("joins learner opinions in one list card with yellow rating stars", async () => {
        render(
            <_CourseReviewBlock
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
})
