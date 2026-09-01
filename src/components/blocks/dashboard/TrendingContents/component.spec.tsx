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
        expect(container.querySelectorAll("section[data-grammar-surface-card='true']")).toHaveLength(1)
        expect(container.querySelector("section[data-grammar-surface-list='true']")).toBeNull()
        expect(screen.getAllByText("Trending")).toHaveLength(1)
        expect(row).toBeInTheDocument()
        expect(screen.getByText("1")).toBeInTheDocument()
        expect(screen.getByText("A long trending course title that can wrap")).toBeInTheDocument()
    })
})
