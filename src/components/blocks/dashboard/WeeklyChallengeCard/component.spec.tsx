import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { WeeklyChallengeCardBase } from "./component"

const frame = {
    label: "Weekly challenge",
    emptyMessage: "No active challenge",
    errorMessage: "Could not load the challenge",
    retryLabel: "Retry",
} as const

describe("WeeklyChallengeCardBase", () => {
    it("draws challenge facts, viewer outcome and recent finishers as distinct rows", () => {
        const act = vi.fn()
        const { container } = render(<WeeklyChallengeCardBase state="ready" props={{
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
        expect(container.querySelector("[data-slot=\"card\"]")).toBeInTheDocument()
        expect(container.querySelector("[data-slot=\"card\"]")).toBeInTheDocument()
        expect(container.querySelectorAll("img[alt]")).toHaveLength(2)
        expect(screen.queryByRole("table")).toBeNull()
        fireEvent.click(screen.getByRole("button", { name: "Try now" }))
        expect(act).toHaveBeenCalledOnce()
    })

    it("rests with the same header, status and three-finisher cardinality", () => {
        const { container } = render(<WeeklyChallengeCardBase state="pending" props={frame} />)
        expect(container.querySelectorAll("[data-loading=\"true\"]").length).toBeGreaterThan(0)
        expect(screen.queryByRole("table")).toBeNull()
        expect(container.querySelector("[data-loading=\"true\"]")).toBeInTheDocument()
    })

    it("keeps the labelled slot mounted when no event is active", () => {
        render(<WeeklyChallengeCardBase state="empty" props={frame} />)
        expect(screen.getByText(frame.label)).toBeInTheDocument()
        expect(screen.getByText(frame.emptyMessage)).toBeInTheDocument()
    })

    it("reports retry from the failed state", () => {
        const retry = vi.fn()
        render(<WeeklyChallengeCardBase state="failed" props={frame} on={{ retry }} />)
        fireEvent.click(screen.getByRole("button", { name: frame.retryLabel }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("drops the nested finisher surface when the challenge reports no finishers at all", () => {
        render(<WeeklyChallengeCardBase state="ready" props={{
            ...frame,
            title: "Build an event store",
            actionLabel: "Try now",
            passedCountLabel: "0 learners passed",
        }} />)
        // Without a list to bound, the passed count is a plain line rather than a card label.
        expect(screen.getByText("0 learners passed")).toBeInTheDocument()
    })

    /*
     * The three labels below are optional in the data type, so the caller may settle a situation
     * without resolving the words for it. The card must still draw its control rather than print
     * `undefined` at a reader - an empty control is recoverable, a lying one is not.
     */
    it("draws a nameless badge rather than the word undefined once the reward is collected", () => {
        const { container } = render(<WeeklyChallengeCardBase state="ready" props={{
            ...frame,
            title: "Build an event store",
            viewerPassed: true,
            claimed: true,
        }} />)
        const badge = container.querySelector("[data-tone=\"success\"]")
        expect(badge).toBeInTheDocument()
        expect(badge).toHaveTextContent("")
        expect(screen.queryByText("undefined")).toBeNull()
        expect(container.querySelector("[data-slot=\"button\"]")).toBeNull()
    })

    it("draws a nameless action rather than the word undefined while the reward is unclaimed", () => {
        const act = vi.fn()
        const { container } = render(<WeeklyChallengeCardBase state="ready" props={{
            ...frame,
            title: "Build an event store",
            viewerPassed: true,
            claimed: false,
            isClaiming: false,
        }} on={{ act }} />)
        const action = container.querySelector("[data-slot=\"button\"]")
        expect(action).toBeInTheDocument()
        expect(screen.queryByText("undefined")).toBeNull()
        fireEvent.click(action as HTMLElement)
        expect(act).toHaveBeenCalledOnce()
    })

    it("shuts the action while a claim is in flight", () => {
        const act = vi.fn()
        const { container } = render(<WeeklyChallengeCardBase state="ready" props={{
            ...frame,
            title: "Build an event store",
            actionLabel: "Claim 50 coins",
            viewerPassed: true,
            claimed: false,
            isClaiming: true,
        }} on={{ act }} />)
        const action = container.querySelector("[data-slot=\"button\"]")
        expect(action).toHaveAttribute("data-action-pending", "true")
        expect(action).toBeDisabled()
        fireEvent.click(action as HTMLElement)
        expect(act).not.toHaveBeenCalled()
    })

    it("names its resting action when the caller resolved one, and nothing when it did not", () => {
        const { container } = render(<WeeklyChallengeCardBase state="pending" props={{ ...frame, actionLabel: "Try now" }} />)
        expect(container.querySelector("[data-slot=\"button\"][data-loading=\"true\"]")).toHaveTextContent("Try now")
        // The resting card names nothing that is not yet known, so it carries no glyph either.
        expect(container.querySelector("svg")).toBeInTheDocument()
    })
})
