/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { ReactionType } from "@/modules/api/graphql/queries/types/reactions"
import { ActivityFeedBase } from "./component"

/**
 * What these tests guard - that the row reports WHICH reaction, not merely that one happened.
 *
 * The pure half keys every journey by row id and forwards the chosen reaction through, so the
 * failure it is exposed to is silent: a picker wired to the wrong row, or to a handler that drops
 * its argument, still renders correctly and still fires. Both are asserted by the argument the
 * handler receives.
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

/** One resolved activity row. */
const activityRow = (id: string, actor: string) => ({
    id,
    actor,
    action: "passed a challenge",
    target: "Build a parser",
    time: "30 minutes ago",
    reactionLabel: "React",
    reactionCount: 0,
    selectedReaction: null,
    reactionLabels,
    isMine: false,
    isReacting: false,
})

afterEach(cleanup)

describe("ActivityFeedBase", () => {
    it("draws one joined list per day, labelled by the day it names", () => {
        const { container } = render(<ActivityFeedBase state="ready" props={{
            message: "",
            days: [
                { id: "1", label: "Today", rows: [activityRow("a1", "Ada")] },
                { id: "2", label: "Yesterday", rows: [activityRow("a2", "Grace"), activityRow("a3", "Alan")] },
            ],
        }} />)
        expect(container.querySelectorAll("[data-node=\"activity-day-group\"]")).toHaveLength(2)
        expect(container.querySelectorAll("[data-node=\"activity-actor-body-time-row\"]")).toHaveLength(3)
        expect(screen.getByText("Today")).toBeInTheDocument()
        expect(screen.getByText("Yesterday")).toBeInTheDocument()
        // The day heading already names the list, so the surface does not repeat it.
        expect(screen.getAllByText("Today")).toHaveLength(1)
    })

    it("holds two resting day groups of three rows so the column keeps its height", () => {
        const { container } = render(<ActivityFeedBase state="pending" props={{ message: "", days: [] }} />)
        expect(container.querySelectorAll("[data-node=\"activity-day-group\"]")).toHaveLength(2)
        expect(container.querySelectorAll("[data-node=\"activity-actor-body-time-row\"]")).toHaveLength(6)
    })

    it.each([
        ["failed" as const],
        ["filteredEmpty" as const],
        ["platformEmpty" as const],
    ])("replaces the whole stream with one notice in the %s situation", (state) => {
        const resultAction = vi.fn()
        const { container } = render(<ActivityFeedBase
            state={state}
            props={{
                message: "Nothing to show",
                description: "Try something else",
                actionLabel: "Go",
                days: [{ id: "1", label: "Today", rows: [activityRow("a1", "Ada")] }],
            }}
            on={{ resultAction }}
        />)
        expect(screen.getByText("Nothing to show")).toBeInTheDocument()
        expect(screen.getByText("Try something else")).toBeInTheDocument()
        expect(container.querySelectorAll("[data-node=\"activity-day-group\"]")).toHaveLength(0)
        fireEvent.click(screen.getByRole("button", { name: "Go" }))
        expect(resultAction).toHaveBeenCalledOnce()
    })

    it("reports the chosen reaction, from the row it was chosen on", async () => {
        const reactFirst = vi.fn()
        const reactSecond = vi.fn()
        render(<ActivityFeedBase
            state="ready"
            props={{ message: "", days: [{
                id: "1",
                label: "Today",
                rows: [activityRow("a1", "Ada"), activityRow("a2", "Grace")],
            }] }}
            on={{ "react:a1": reactFirst, "react:a2": reactSecond }}
        />)

        fireEvent.click(screen.getAllByRole("button", { name: "React" })[1] as HTMLElement)
        fireEvent.click(await screen.findByRole("button", { name: "Wow" }))

        expect(reactSecond).toHaveBeenCalledWith(ReactionType.Wow)
        expect(reactFirst).not.toHaveBeenCalled()
    })

    it("reports taking a reaction back as a null choice, not as a second one", async () => {
        const react = vi.fn()
        render(<ActivityFeedBase
            state="ready"
            props={{ message: "", days: [{
                id: "1",
                label: "Today",
                rows: [{ ...activityRow("a1", "Ada"), selectedReaction: ReactionType.Love, reactionCount: 3 }],
            }] }}
            on={{ "react:a1": react }}
        />)

        fireEvent.click(screen.getByRole("button", { name: "React" }))
        fireEvent.click(await screen.findByRole("button", { name: "Love" }))

        expect(react).toHaveBeenCalledWith(null)
    })

    it("reports opening the actor and opening the target as two different journeys", () => {
        const openActor = vi.fn()
        const openTarget = vi.fn()
        render(<ActivityFeedBase
            state="ready"
            props={{ message: "", days: [{ id: "1", label: "Today", rows: [activityRow("a1", "Ada")] }] }}
            on={{ "actor:a1": openActor, "target:a1": openTarget }}
        />)

        fireEvent.click(screen.getByText("Ada"))
        expect(openActor).toHaveBeenCalledOnce()
        expect(openTarget).not.toHaveBeenCalled()

        fireEvent.click(screen.getByText("Build a parser"))
        expect(openTarget).toHaveBeenCalledOnce()
    })
})
