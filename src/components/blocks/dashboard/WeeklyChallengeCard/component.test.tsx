import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _WeeklyChallengeCard } from "./component"

const frame = {
    label: "Weekly challenge",
    emptyMessage: "No active challenge",
    errorMessage: "Could not load the challenge",
    retryLabel: "Retry",
} as const

describe("_WeeklyChallengeCard", () => {
    it("draws challenge facts, viewer outcome and recent finishers as distinct rows", () => {
        const act = vi.fn()
        const { container } = render(<_WeeklyChallengeCard state="ready" props={{
            ...frame,
            title: "Build an event store",
            endsInLabel: "Ends in 5d 8h",
            actionLabel: "Try now",
            passedCountLabel: "12 learners passed",
            viewerPassed: false,
            claimed: false,
            finishers: [
                { id: "ada", label: "Ada", passedAtLabel: "2h ago" },
                { id: "linus", label: "Linus", passedAtLabel: "4h ago" },
            ],
        }} on={{ act }} />)
        expect(screen.getByText("Build an event store")).toBeInTheDocument()
        expect(screen.getByText("Ends in 5d 8h")).toBeInTheDocument()
        expect(screen.getByText("12 learners passed")).toBeInTheDocument()
        expect(screen.getByText("Ada")).toBeInTheDocument()
        expect(screen.getByText("2h ago")).toBeInTheDocument()
        expect(container.querySelector("[data-node=\"weekly-challenge-card\"]")).toBeInTheDocument()
        expect(container.querySelector("[data-node=\"weekly-challenge-finishers\"]")).toBeInTheDocument()
        const nestedSurface = container.querySelector("[data-component=\"SurfaceListCardSurface\"]")
        expect(nestedSurface).toHaveAttribute("data-surface-context", "nested")
        expect(container.querySelector("[data-node=\"weekly-challenge-finishers\"]")?.className).not.toMatch(/rounded|border/)
        expect(container.querySelectorAll("[data-node=\"weekly-challenge-finisher-row\"]")).toHaveLength(2)
        expect(container.querySelectorAll("[data-component=\"StatRow\"]")).toHaveLength(0)
        fireEvent.click(screen.getByRole("button", { name: "Try now" }))
        expect(act).toHaveBeenCalledOnce()
    })

    it("rests with the same header, status and three-finisher cardinality", () => {
        const { container } = render(<_WeeklyChallengeCard state="pending" props={frame} />)
        expect(container.querySelectorAll("[data-node=\"weekly-challenge-finisher-row\"]")).toHaveLength(3)
        expect(container.querySelectorAll("[data-component=\"StatRow\"]")).toHaveLength(0)
        expect(container.querySelector("[data-component=\"Button\"][data-loading=\"true\"]")).toBeInTheDocument()
    })

    it("keeps the labelled slot mounted when no event is active", () => {
        render(<_WeeklyChallengeCard state="empty" props={frame} />)
        expect(screen.getByText(frame.label)).toBeInTheDocument()
        expect(screen.getByText(frame.emptyMessage)).toBeInTheDocument()
    })

    it("reports retry from the failed state", () => {
        const retry = vi.fn()
        render(<_WeeklyChallengeCard state="failed" props={frame} on={{ retry }} />)
        fireEvent.click(screen.getByRole("button", { name: frame.retryLabel }))
        expect(retry).toHaveBeenCalledOnce()
    })
})
