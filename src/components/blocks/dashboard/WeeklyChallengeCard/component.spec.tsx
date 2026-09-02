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
        expect(container.querySelector("[data-part=\"challenge-countdown\"]")).toHaveClass("bg-surface-secondary", "px-4", "pt-4", "pb-3")
        expect(screen.getByText("Ends in 5d 8h")).toHaveAttribute("data-tone", "muted")
        expect(container.querySelector("[data-part=\"challenge-heading\"]")).toHaveClass("flex", "items-start", "gap-3", "px-4", "py-3")
        expect(container.querySelector("[data-part=\"challenge-footer\"]")).toHaveClass("px-4", "pb-4", "pt-3")
        expect(container.querySelector("[data-part=\"challenge-countdown\"]")!.compareDocumentPosition(
            container.querySelector("[data-part=\"challenge-heading\"]") as Node,
        ) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(container.querySelectorAll("[data-part=\"challenge-finisher\"]")).toHaveLength(2)
        expect(container.querySelector("[data-part=\"challenge-finisher\"]")).toHaveClass("grid", "items-center", "gap-3")
        expect(container.querySelector(".starci-core-surface")).toBeInTheDocument()
        expect(container.querySelector(".starci-core-list-shell")).toBeNull()
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
        expect(container.querySelectorAll("[data-part=\"challenge-finisher\"]")).toHaveLength(3)
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

    it("keeps the finisher count visible when no finishers are reported", () => {
        const { container } = render(<WeeklyChallengeCardBase state="ready" props={{
            ...frame,
            title: "Build an event store",
            actionLabel: "Try now",
            passedCountLabel: "0 learners passed",
        }} />)
        expect(screen.getAllByText("0 learners passed").length).toBeGreaterThan(0)
        expect(container.querySelector("[data-part=\"challenge-finishers\"]")).toBeInTheDocument()
        expect(container.querySelectorAll("[data-part=\"challenge-finisher\"]")).toHaveLength(0)
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
        expect(container.querySelector("[data-part=\"challenge-footer\"] [data-slot=\"button\"]")).toBeNull()
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
        const action = container.querySelector("[data-part=\"challenge-footer\"] [data-slot=\"button\"]")
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
        const action = container.querySelector("[data-part=\"challenge-footer\"] [data-slot=\"button\"]")
        expect(action).toHaveAttribute("data-action-pending", "true")
        expect(action).toBeDisabled()
        fireEvent.click(action as HTMLElement)
        expect(act).not.toHaveBeenCalled()
    })

    it("names its resting action when the caller resolved one, and nothing when it did not", () => {
        const { container } = render(<WeeklyChallengeCardBase state="pending" props={{ ...frame, actionLabel: "Try now" }} />)
        expect(container.querySelector("[data-part=\"challenge-footer\"] [data-slot=\"button\"][data-loading=\"true\"]")).toHaveTextContent("Try now")
        expect(container.querySelector("[data-part=\"challenge-heading\"] [data-loading=\"true\"]")).toBeInTheDocument()
    })
})
