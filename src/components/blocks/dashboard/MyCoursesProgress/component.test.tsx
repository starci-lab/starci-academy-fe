/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MyCoursesProgressBase } from "./component"

/**
 * What these tests guard - the pure half's four situations, driven by props alone.
 *
 * `empty` and `failed` draw the same tree and differ only in which sentence is true and whether
 * there is anything to re-ask for, so both are asserted rather than one standing in for the other.
 * Their sentences are optional in the data type, which makes "the caller resolved nothing" a real
 * situation the card has to survive without printing `undefined` at a reader.
 */

/** Three named dimensions, the shape every row carries. */
const dimensions = [
    { id: "content", label: "Content", completed: 4, total: 8, percent: 50, tone: "accent" },
    { id: "challenge", label: "Challenges", completed: 1, total: 2, percent: 50, tone: "success" },
    { id: "milestone", label: "Milestones", completed: 1, total: 4, percent: 25, tone: "warning" },
] as const

const frame = {
    label: "My courses",
    emptyMessage: "Nothing enrolled yet",
    errorMessage: "Could not load your courses",
    retryLabel: "Retry",
} as const

/** One resolved course row. */
const row = {
    id: "course-1",
    title: "Rust basics",
    cover: null,
    percent: 45,
    percentLabel: "45%",
    isTrial: false,
    trialLabel: "Trial",
    dimensions,
} as const

afterEach(cleanup)

describe("MyCoursesProgressBase", () => {
    it("draws one pressable row per course, with all three dimensions named and counted", () => {
        const open = vi.fn()
        const { container } = render(<MyCoursesProgressBase
            state="ready"
            props={{ ...frame, rows: [row] }}
            on={{ "open:course-1": open }}
        />)
        expect(container.querySelectorAll("[data-node=\"course-progress-row\"]")).toHaveLength(1)
        expect(screen.getByText("45%")).toBeInTheDocument()
        expect(screen.getByText("Content · 4/8")).toBeInTheDocument()
        expect(screen.getByText("Challenges · 1/2")).toBeInTheDocument()
        expect(screen.getByText("Milestones · 1/4")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Rust basics" }))
        expect(open).toHaveBeenCalledOnce()
    })

    it("badges a course the reader is only trying", () => {
        render(<MyCoursesProgressBase state="ready" props={{ ...frame, rows: [{ ...row, isTrial: true }] }} />)
        expect(screen.getByText("Trial")).toBeInTheDocument()
    })

    it("shuts a row whose destination is still being resolved", () => {
        const open = vi.fn()
        render(<MyCoursesProgressBase
            state="ready"
            props={{ ...frame, rows: [{ ...row, isPending: true }] }}
            on={{ "open:course-1": open }}
        />)
        const target = screen.getByRole("button", { name: "Rust basics" })
        expect(target).toBeDisabled()
        fireEvent.click(target)
        expect(open).not.toHaveBeenCalled()
    })

    it("holds two resting rows, with no trial badge and nothing pressable, while courses load", () => {
        const { container } = render(<MyCoursesProgressBase state="pending" props={{ ...frame, rows: [] }} />)
        const rows = container.querySelectorAll("[data-node=\"course-progress-row\"]")
        expect(rows).toHaveLength(2)
        expect(screen.queryByText("Trial")).toBeNull()
        expect(Array.from(container.querySelectorAll("button")).every((button) => button.disabled)).toBe(true)
    })

    it("says the shelf is bare, and still offers the request again", () => {
        const retry = vi.fn()
        render(<MyCoursesProgressBase state="empty" props={{ ...frame, rows: [] }} on={{ retry }} />)
        expect(screen.getByText("Nothing enrolled yet")).toBeInTheDocument()
        expect(screen.queryByText("Could not load your courses")).toBeNull()
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("says what went wrong, and offers the request again", () => {
        const retry = vi.fn()
        render(<MyCoursesProgressBase state="failed" props={{ ...frame, rows: [] }} on={{ retry }} />)
        expect(screen.getByText("Could not load your courses")).toBeInTheDocument()
        expect(screen.queryByText("Nothing enrolled yet")).toBeNull()
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("keeps the notice empty rather than printing the word undefined at a reader", () => {
        // Both sentences are optional in the data type, so a caller can settle a situation without
        // resolving the words for it. Drawing nothing is recoverable; drawing "undefined" is not.
        const { container } = render(<MyCoursesProgressBase state="empty" props={{ label: "My courses", rows: [] }} />)
        expect(container.querySelector("[data-node=\"empty-notice-stack\"]")).toBeInTheDocument()
        expect(screen.queryByText("undefined")).toBeNull()
        expect(container.querySelector("button")).toBeNull()
    })
})
