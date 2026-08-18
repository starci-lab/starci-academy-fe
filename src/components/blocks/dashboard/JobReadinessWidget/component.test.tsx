import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _JobReadinessWidget } from "./component"

const frame = {
    label: "My readiness",
    emptyMessage: "No readiness snapshot yet",
    errorMessage: "Could not load readiness",
    retryLabel: "Retry",
} as const

describe("_JobReadinessWidget", () => {
    it("draws the strongest-track headline, percentile, pillars and targeted CTA", () => {
        const act = vi.fn()
        const { container } = render(<_JobReadinessWidget state="ready" props={{
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
        expect(screen.getByText("Ahead of 64% of learners")).toBeInTheDocument()
        expect(screen.getByText("Ahead of 64% of learners")).toHaveAttribute("data-size", "xs")
        expect(container.querySelector("[data-component=\"SurfaceListCard\"]")).toBeInTheDocument()
        expect(container.querySelector("[data-component=\"SurfaceListCardSurface\"]")).toHaveAttribute("data-surface-context", "nested")
        expect(container.querySelector("[data-component=\"SurfaceListCard\"] [data-component=\"Heading\"]")).toBeNull()
        expect(container.querySelector("[data-node=\"job-readiness-list\"]")?.className).toContain("divide-y")
        expect(container.querySelectorAll("[data-node=\"label-fact-over-progress\"]")).toHaveLength(2)
        fireEvent.click(screen.getByRole("button", { name: "Complete CV review" }))
        expect(act).toHaveBeenCalledOnce()
    })

    it("rests with all three legacy pillar rows", () => {
        const { container } = render(<_JobReadinessWidget state="pending" props={frame} />)
        expect(container.querySelectorAll("[data-node=\"label-fact-over-progress\"]")).toHaveLength(3)
        expect(container.querySelector("[data-node=\"job-readiness-list\"]")).toBeInTheDocument()
        expect(container.querySelector("[data-component=\"Button\"][data-loading=\"true\"]")).toBeInTheDocument()
    })

    it("keeps the labelled surface and offers the empty-state journey", () => {
        const act = vi.fn()
        render(<_JobReadinessWidget state="empty" props={{ ...frame, actionLabel: "Build readiness" }} on={{ act }} />)
        expect(screen.getByText(frame.label)).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Build readiness" }))
        expect(act).toHaveBeenCalledOnce()
    })

    it("reports retry from the failed state", () => {
        const retry = vi.fn()
        render(<_JobReadinessWidget state="failed" props={frame} on={{ retry }} />)
        fireEvent.click(screen.getByRole("button", { name: frame.retryLabel }))
        expect(retry).toHaveBeenCalledOnce()
    })
})
