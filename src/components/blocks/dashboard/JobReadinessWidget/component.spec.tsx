import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { JobReadinessWidgetBase } from "./component"

const frame = {
    label: "My readiness",
    emptyMessage: "No readiness snapshot yet",
    errorMessage: "Could not load readiness",
    retryLabel: "Retry",
} as const

describe("JobReadinessWidgetBase", () => {
    it("draws the strongest-track headline, percentile, pillars and targeted CTA", () => {
        const act = vi.fn()
        const { container } = render(<JobReadinessWidgetBase state="ready" props={{
            ...frame,
            courseTitle: "Backend track",
            depthScore: 72,
            band: "building",
            bandLabel: "Building",
            percentileLabel: "Ahead of 64% of learners",
            metrics: [
                { id: "capstone", label: "Capstone", score: 72, scoreLabel: "72%" },
                { id: "interview", label: "Mock interview", score: 60, scoreLabel: "60%" },
            ],
            actionLabel: "Complete CV review",
        }} on={{ act }} />)
        expect(screen.getByText("72 · Backend track")).toBeInTheDocument()
        expect(screen.getByText("Building")).toBeInTheDocument()
        expect(screen.queryByText("Ahead of 64% of learners")).toBeNull()
        expect(screen.getByText("Capstone")).toBeInTheDocument()
        expect(screen.getByText("Mock interview")).toBeInTheDocument()
        expect(container.querySelector("[data-part=\"readiness-headline\"]")).toHaveClass("bg-accent-soft", "px-4", "pt-3", "pb-3", "sm:justify-between")
        expect(container.querySelector("[data-part=\"readiness-body\"]")).toHaveClass("flex", "flex-col")
        expect(container.querySelector("[data-part=\"readiness-metrics\"]")).toHaveClass("grid", "divide-y")
        expect(container.querySelector(".starci-core-surface")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Complete CV review" }))
        expect(act).toHaveBeenCalledOnce()
    })

    it("rests with all three legacy pillar rows", () => {
        const { container } = render(<JobReadinessWidgetBase state="pending" props={frame} />)
        expect(container.querySelectorAll("[data-loading=\"true\"]").length).toBeGreaterThan(0)
    })

    it("keeps the labelled surface and offers the empty-state journey", () => {
        const act = vi.fn()
        render(<JobReadinessWidgetBase state="empty" props={{ ...frame, actionLabel: "Build readiness" }} on={{ act }} />)
        expect(screen.getByText(frame.label)).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Build readiness" }))
        expect(act).toHaveBeenCalledOnce()
    })

    it("reports retry from the failed state", () => {
        const retry = vi.fn()
        render(<JobReadinessWidgetBase state="failed" props={frame} on={{ retry }} />)
        fireEvent.click(screen.getByRole("button", { name: frame.retryLabel }))
        expect(retry).toHaveBeenCalledOnce()
    })
})
