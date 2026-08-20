/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { UpcomingLivestreamCardBase } from "./component"

/**
 * What these tests guard - the pure half's four situations, driven by props alone.
 *
 * The failure notice is the one that carries copy the caller may not have resolved, so it is
 * asserted both with a sentence and without one: a card that renders `undefined` at a reader is
 * worse than one that renders an empty line with a way out beside it.
 */

const frame = { label: "Upcoming sessions", errorMessage: "Could not load sessions", retryLabel: "Retry" } as const

afterEach(cleanup)

describe("UpcomingLivestreamCardBase", () => {
    it("draws nothing when the situation is settled absence", () => {
        const { container } = render(<UpcomingLivestreamCardBase state="hidden" props={{ ...frame, rows: [] }} />)
        expect(container).toBeEmptyDOMElement()
    })

    it("says what went wrong and offers the request again", () => {
        const retry = vi.fn()
        render(<UpcomingLivestreamCardBase state="failed" props={{ ...frame, rows: [] }} on={{ retry }} />)
        expect(screen.getByText("Could not load sessions")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("still draws a way out when the caller resolved no failure sentence", () => {
        const retry = vi.fn()
        render(<UpcomingLivestreamCardBase
            state="failed"
            props={{ label: "Upcoming sessions", rows: [], retryLabel: "Retry" }}
            on={{ retry }}
        />)
        expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument()
        expect(screen.queryByText("undefined")).toBeNull()
    })

    it("holds three resting rows so the card keeps its height", () => {
        const { container } = render(<UpcomingLivestreamCardBase state="pending" props={{ ...frame, rows: [] }} />)
        expect(container.querySelectorAll("[data-node=\"upcoming-livestream-row\"]")).toHaveLength(3)
    })

    it("draws one pressable row per settled session", () => {
        const open = vi.fn()
        const { container } = render(<UpcomingLivestreamCardBase
            state="ready"
            props={{ ...frame, rows: [{ id: "r1", title: "Kickoff", subtitle: "Rust basics", time: "Sep 1, 10:00" }] }}
            on={{ "open:r1": open }}
        />)
        expect(container.querySelectorAll("[data-node=\"upcoming-livestream-row\"]")).toHaveLength(1)
        expect(screen.getByText("Sep 1, 10:00")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Kickoff" }))
        expect(open).toHaveBeenCalledOnce()
    })
})
