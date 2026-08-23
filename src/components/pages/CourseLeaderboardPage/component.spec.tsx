import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/learn/CourseLeaderboardBlock", () => ({ CourseLeaderboardBlock: () => <output data-testid="course-board">course-board</output> }))
import { CourseLeaderboardPageBase } from "./component"

describe("CourseLeaderboardPageBase", () => {
    it("owns the page shell and composes the connected board", () => {
        render(<CourseLeaderboardPageBase displayId="course" selectedCategory="total" />)
        expect(screen.getByTestId("course-board")).toBeInTheDocument()
    })
})
