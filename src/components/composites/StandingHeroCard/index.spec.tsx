/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { StandingHeroCard } from "./index"

/**
 * What these tests guard - that the meter is omitted rather than zeroed.
 *
 * A bar drawn at zero claims a measured distance, and there is nothing to measure when the reader
 * is first or when the place above them fell outside the fetched slice. So the absence of the whole
 * goal row is the assertion, not the value inside it.
 */

const standing = { rank: 4, rankLabel: "Rank 4", title: "Rank #4", subtitle: "105 XP" } as const

afterEach(cleanup)

describe("StandingHeroCard", () => {
    it("draws the standing, the distance still to close and the action that closes it", () => {
        render(<StandingHeroCard props={{
            standing,
            progress: { ratio: 0.625, label: "48 XP to rank 3" },
            ctaLabel: "Practise now",
            progressAccessibleLabel: "Progress to the next rank",
        }} />)
        expect(screen.getByText("Rank #4")).toBeInTheDocument()
        expect(screen.getByText("48 XP to rank 3")).toBeInTheDocument()
        expect(screen.getByRole("progressbar")).toBeInTheDocument()
        const meter = screen.getByRole("progressbar", { name: "Progress to the next rank" })
        expect(meter).toHaveAttribute("aria-valuenow", "63")
        expect(screen.getByRole("button", { name: "Practise now" })).toBeInTheDocument()
    })

    it("omits the whole meter rather than drawing an unmeasured distance at zero", () => {
        render(<StandingHeroCard props={{
            standing: { ...standing, rank: 1, title: "Rank #1" },
            ctaLabel: "Practise now",
            progressAccessibleLabel: "Progress to the next rank",
        }} />)
        expect(screen.queryByRole("progressbar")).toBeNull()
        expect(screen.queryByRole("progressbar")).toBeNull()
        expect(screen.getByText("Rank #1")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Practise now" })).toBeInTheDocument()
    })

    it("reports the reader taking the action", () => {
        const cta = vi.fn()
        render(<StandingHeroCard
            props={{ standing, ctaLabel: "Practise now", progressAccessibleLabel: "Progress" }}
            on={{ cta }}
        />)
        fireEvent.click(screen.getByRole("button", { name: "Practise now" }))
        expect(cta).toHaveBeenCalledOnce()
    })

    it("rests the standing, the meter and the action together, and presses nowhere", () => {
        const cta = vi.fn()
        const { container } = render(<StandingHeroCard
            props={{
                standing,
                progress: { ratio: 0.5, label: "48 XP to rank 3" },
                ctaLabel: "Practise now",
                progressAccessibleLabel: "Progress",
            }}
            on={{ cta }}
            isLoading
        />)
        const button = screen.getByRole("button", { name: "Practise now" })
        expect(button).toHaveAttribute("data-loading", "true")
        expect(container.querySelectorAll("[data-loading=\"true\"]").length).toBeGreaterThan(1)
        fireEvent.click(button)
        expect(cta).not.toHaveBeenCalled()
    })
})
