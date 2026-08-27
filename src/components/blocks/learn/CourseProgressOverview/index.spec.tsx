import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CourseProgressOverview } from "."

describe("CourseProgressOverview", () => {
    it("keeps completion primary and renders both supporting facts", () => {
        render(<CourseProgressOverview state="ready" props={{
            label: "Your progress",
            completionLabel: "Course progress",
            completionFact: "42% complete",
            completionValue: 42,
            continuityLabel: "Study continuity",
            continuityFact: "6 days",
            standingLabel: "Course standing",
            standingFact: "Rank #18",
        }} />)

        expect(screen.getByRole("progressbar", { name: "Course progress" })).toHaveAttribute("aria-valuenow", "42")
        expect(screen.getByText("6 days")).toBeTruthy()
        expect(screen.getByText("Rank #18")).toBeTruthy()
    })

    it("rests the accepted anatomy while evidence is pending", () => {
        const { container } = render(<CourseProgressOverview state="pending" props={{ label: "Your progress", completionLabel: "Course progress" }} />)
        expect(container.querySelector("[data-loading=true]")).toBeInTheDocument()
    })
})
