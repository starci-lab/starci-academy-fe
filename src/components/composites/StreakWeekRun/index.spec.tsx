/** @vitest-environment jsdom */
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StreakWeekRun } from "."

describe("StreakWeekRun", () => {
    it("owns one horizontal list seam for all seven day cells", () => {
        const { container } = render(<StreakWeekRun props={{ days: Array.from(
            { length: 7 },
            (_unused, index) => ({ id: String(index), weekday: String(index) }),
        ) }} />)

        const run = container.querySelector("ul[data-part=\"streak-week-run\"]")
        expect(run).toHaveClass("flex", "items-start", "gap-3")
        expect(run?.querySelectorAll(":scope > li")).toHaveLength(7)
    })
})
