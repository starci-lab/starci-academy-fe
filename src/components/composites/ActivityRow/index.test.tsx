/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { ReactionType } from "@/modules/api/graphql/queries/types/reactions"
import { ActivityRow } from "./index"

/**
 * What these tests guard - that a reader is never invited to react to their own activity.
 *
 * The row draws the same sentence for everybody and decides the reaction control from one flag, so
 * the failure is quiet: the picker still renders, still opens, and reports a reaction nobody should
 * be able to leave. `isMine` is asserted by the ABSENCE of the control, not by a prop.
 *
 * It also guards the two optional slots. A target and a reaction are each drawn only when the
 * caller resolved the words for them, because half a slot reads as a bug in the layout.
 */

/** The six words a picker needs before it will open. */
const reactionLabels = {
    [ReactionType.Like]: "Like",
    [ReactionType.Love]: "Love",
    [ReactionType.Haha]: "Haha",
    [ReactionType.Wow]: "Wow",
    [ReactionType.Sad]: "Sad",
    [ReactionType.Angry]: "Angry",
} as const

const base = {
    id: "a1",
    actor: "Ada",
    action: "passed a challenge",
    target: "Build a parser",
    time: "30 minutes ago",
    reactionLabel: "React",
    reactionCount: 2,
    selectedReaction: null,
    reactionLabels,
} as const

afterEach(cleanup)

describe("ActivityRow", () => {
    it("draws the actor, the event, its target and when it happened", () => {
        const { container } = render(<ActivityRow props={base} />)
        expect(screen.getByText("Ada")).toBeInTheDocument()
        expect(screen.getByText("passed a challenge")).toBeInTheDocument()
        expect(screen.getByText("Build a parser")).toBeInTheDocument()
        expect(screen.getByText("30 minutes ago")).toBeInTheDocument()
        expect(container.querySelector("[data-node=\"activity-actor-body-time-row\"]")).toBeInTheDocument()
    })

    it("reports opening the actor and opening the target as two different journeys", () => {
        const openActor = vi.fn()
        const openTarget = vi.fn()
        render(<ActivityRow props={base} on={{ openActor, openTarget }} />)

        fireEvent.click(screen.getByText("Ada"))
        expect(openActor).toHaveBeenCalledOnce()
        expect(openTarget).not.toHaveBeenCalled()

        fireEvent.click(screen.getByText("Build a parser"))
        expect(openTarget).toHaveBeenCalledOnce()
    })

    it("drops the target link entirely when the activity points at nothing", () => {
        const { container } = render(<ActivityRow props={{ ...base, target: undefined }} />)
        expect(screen.getByText("passed a challenge")).toBeInTheDocument()
        expect(container.querySelectorAll("[data-component=\"TextLink\"]")).toHaveLength(1)
    })

    it("drops the reaction control when the caller resolved no words for it", () => {
        const noLabel = render(<ActivityRow props={{ ...base, reactionLabel: undefined }} />)
        expect(noLabel.container.querySelector("[data-component=\"ReactionPicker\"]")).toBeNull()
        cleanup()

        const noLabels = render(<ActivityRow props={{ ...base, reactionLabels: undefined }} />)
        expect(noLabels.container.querySelector("[data-component=\"ReactionPicker\"]")).toBeNull()
    })

    it("reports which reaction the reader chose", async () => {
        const react = vi.fn()
        render(<ActivityRow props={base} on={{ react }} />)
        fireEvent.click(screen.getByRole("button", { name: "React" }))
        fireEvent.click(await screen.findByRole("button", { name: "Haha" }))
        expect(react).toHaveBeenCalledWith(ReactionType.Haha)
    })

    it("reports taking a reaction back as a null choice", async () => {
        const react = vi.fn()
        render(<ActivityRow props={{ ...base, selectedReaction: ReactionType.Sad }} on={{ react }} />)
        fireEvent.click(screen.getByRole("button", { name: "React" }))
        fireEvent.click(await screen.findByRole("button", { name: "Sad" }))
        expect(react).toHaveBeenCalledWith(null)
    })

    it("offers no reaction control on the reader's own activity, but still reports the count", () => {
        const react = vi.fn()
        const { container } = render(<ActivityRow props={{ ...base, isMine: true }} on={{ react }} />)
        expect(screen.queryByRole("button", { name: "React" })).toBeNull()
        expect(container.querySelector("[data-component=\"ReactionPicker\"]")).toBeInTheDocument()
        expect(screen.getByText("2")).toBeInTheDocument()
    })

    it("says nothing at all about the reader's own activity that nobody reacted to", () => {
        const { container } = render(<ActivityRow props={{ ...base, isMine: true, reactionCount: 0 }} />)
        expect(container.querySelector("[data-component=\"ReactionPicker\"]")).toBeNull()
        expect(screen.getByText("Ada")).toBeInTheDocument()
    })

    it("shuts the reaction control while a choice is in flight", () => {
        render(<ActivityRow props={{ ...base, isReacting: true }} on={{ react: vi.fn() }} />)
        expect(screen.getByRole("button", { name: "React" })).toBeDisabled()
    })

    it("rests without an actor, an action or a time, and never prints the word undefined", () => {
        const { container } = render(<ActivityRow props={{ id: "resting-0" }} isLoading />)
        expect(container.querySelector("[data-node=\"activity-actor-body-time-row\"]")).toBeInTheDocument()
        expect(container.querySelectorAll("[data-component=\"Text\"][data-loading=\"true\"]").length).toBeGreaterThan(0)
        expect(container.querySelector("[data-component=\"TextLink\"]")).toHaveTextContent("")
        expect(container.querySelector("[data-component=\"ReactionPicker\"]")).toBeNull()
        expect(screen.queryByText("undefined")).toBeNull()
    })

    it("counts an unstated reaction tally as none", () => {
        render(<ActivityRow props={{ ...base, reactionCount: undefined }} on={{ react: vi.fn() }} />)
        const control = screen.getByRole("button", { name: "React" })
        expect(control).toHaveTextContent("React")
        expect(control).not.toHaveTextContent("2")
    })
})
