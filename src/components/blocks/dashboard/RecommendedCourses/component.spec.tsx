/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { RecommendedCoursesBase } from "./component"

/**
 * What these tests guard - the pure half's four situations, driven by props alone.
 *
 * The failure notice carries copy the caller may not have resolved, so it is asserted both with a
 * sentence and without one: a card that renders `undefined` at a reader is worse than one that
 * renders an empty line with a way out beside it.
 */

const frame = { label: "Recommended", emptyMessage: "No recommendations yet", errorMessage: "Could not load suggestions", retryLabel: "Retry" } as const

/** One resolved recommendation row. */
const row = {
    id: "rust-basics",
    title: "Rust basics",
    price: "400,000",
    originalPrice: "500,000",
    discount: "−20%",
    savings: "You save 100,000",
    priceDetailLabel: "Why this price?",
} as const

afterEach(cleanup)

describe("RecommendedCoursesBase", () => {
    it("keeps a settled empty list surface with an honest next-state message", () => {
        render(<RecommendedCoursesBase state="empty" props={{ ...frame, rows: [] }} />)
        expect(screen.getByText("No recommendations yet")).toBeInTheDocument()
    })

    it("says what went wrong and offers the request again", () => {
        const retry = vi.fn()
        render(<RecommendedCoursesBase state="failed" props={{ ...frame, rows: [] }} on={{ retry }} />)
        expect(screen.getByText("Could not load suggestions")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("still draws a way out when the caller resolved no failure sentence", () => {
        const retry = vi.fn()
        render(<RecommendedCoursesBase
            state="failed"
            props={{ label: "Recommended", rows: [], retryLabel: "Retry" }}
            on={{ retry }}
        />)
        expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument()
        expect(screen.queryByText("undefined")).toBeNull()
    })

    it("holds three resting rows so the card keeps its height", () => {
        const { container } = render(<RecommendedCoursesBase state="pending" props={{ ...frame, rows: [] }} />)
        expect(screen.getByText("Recommended")).toBeInTheDocument()
        expect(container.querySelectorAll("button")).toHaveLength(0)
    })

    it("reports opening a course and asking about its price as two different journeys", () => {
        const open = vi.fn()
        const openPriceDetail = vi.fn()
        render(<RecommendedCoursesBase
            state="ready"
            props={{ ...frame, rows: [row] }}
            on={{ "open:rust-basics": open, "priceDetail:rust-basics": openPriceDetail }}
        />)
        fireEvent.click(screen.getByText("Why this price?"))
        expect(openPriceDetail).toHaveBeenCalledOnce()
        expect(open).not.toHaveBeenCalled()

        fireEvent.click(screen.getByRole("button", { name: "Rust basics" }))
        expect(open).toHaveBeenCalledOnce()
    })

    it("keeps every recommendation in one joined full-width list", () => {
        const rows = [row, { ...row, id: "typescript" }, { ...row, id: "systems" }]
        render(<RecommendedCoursesBase state="ready" props={{ ...frame, rows }} />)

        const items = screen.getAllByRole("listitem")
        expect(items).toHaveLength(3)
        for (const item of items) expect(item).not.toHaveClass("sm:w-1/2")
        expect(items.at(-1)).toHaveClass("last:border-b-0")
    })
})
