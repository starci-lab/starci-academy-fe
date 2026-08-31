/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { TrendingContentsBase } from "./component"

afterEach(cleanup)

describe("TrendingContentsBase", () => {
    it("keeps each ranked result in the dashboard-owned compact row wrapper", () => {
        const { container } = render(<TrendingContentsBase
            state="ready"
            props={{
                label: "Trending",
                items: [{ id: "course-1", rank: "1", title: "A long trending course title that can wrap" }],
            }}
        />)

        const row = container.querySelector("[data-dashboard-trending-row='true']")
        expect(row).toBeInTheDocument()
        expect(screen.getByText("1")).toBeInTheDocument()
        expect(screen.getByText("A long trending course title that can wrap")).toBeInTheDocument()
    })
})
