/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { ActivityType, type QueryMyFeedItemData } from "@/modules/api/graphql/queries/types/my-feed"
import { ReactionType } from "@/modules/api/graphql/queries/types/reactions"
import { ActivityFeed } from "./index"

/**
 * What these tests guard - that a run of milestones by one person reads as one line.
 *
 * A learner who passes six milestones in a row would otherwise fill the whole feed with six
 * near-identical sentences, so consecutive milestones by the SAME actor collapse into one summary
 * and everything else stays its own row. The rule is asserted in all four ways it can be broken:
 * a milestone after nothing, after another actor's milestone, after a different kind of event, and
 * after its own actor's milestone.
 *
 * It also guards the day grouping, which is the reader's only sense of when: today and yesterday
 * are words, and anything older is a date.
 */

/** Local noon, so a few hours either way stays inside the same local day. */
const NOW = new Date(2026, 8, 10, 12, 0, 0)

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) =>
        values === undefined ? key : `${key}:${Object.values(values).join(",")}`,
    useLocale: () => "en-US",
}))

/** An instant this many milliseconds before the fixed now. */
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString()

const MINUTE = 60_000
const HOUR = 60 * MINUTE

/** One feed row as the server sends it. */
const item = (over: Partial<QueryMyFeedItemData> = {}): QueryMyFeedItemData => ({
    id: "a1",
    actorGlobalId: "actor-1",
    actorUsername: "ada",
    actorAvatar: null,
    type: ActivityType.ChallengePassed,
    targetGlobalId: "target-1",
    targetLabel: "Build a parser",
    at: ago(30 * MINUTE),
    reactionCount: 2,
    myReaction: null,
    isMine: false,
    ...over,
})

beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(NOW)
})

afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.clearAllMocks()
})

describe("ActivityFeed", () => {
    it("holds two resting day groups while the feed is on its way", () => {
        const { container } = render(<ActivityFeed state="pending" items={[]} message="" />)
        expect(container.querySelectorAll("[data-node=\"activity-day-group\"]")).toHaveLength(2)
        expect(container.querySelectorAll("[data-node=\"activity-actor-body-time-row\"]")).toHaveLength(6)
    })

    it.each([
        ["failed" as const, "Could not load the feed", "Retry"],
        ["filteredEmpty" as const, "Nothing under this filter", "Show everything"],
        ["platformEmpty" as const, "Nothing has happened yet", "Browse courses"],
    ])("draws one notice with a way out for the %s situation", (state, message, actionLabel) => {
        const resultAction = vi.fn()
        const { container } = render(
            <ActivityFeed
                state={state}
                items={[item()]}
                message={message}
                actionLabel={actionLabel}
                on={{ resultAction }}
            />,
        )
        expect(screen.getByText(message)).toBeInTheDocument()
        expect(container.querySelectorAll("[data-node=\"activity-actor-body-time-row\"]")).toHaveLength(0)
        fireEvent.click(screen.getByRole("button", { name: actionLabel }))
        expect(resultAction).toHaveBeenCalledOnce()
    })

    it("carries the supporting sentence of the platform-empty situation", () => {
        render(
            <ActivityFeed
                state="platformEmpty"
                items={[]}
                message="Nothing has happened yet"
                description="Enrol in a course to start the feed"
                actionLabel="Browse courses"
            />,
        )
        expect(screen.getByText("Enrol in a course to start the feed")).toBeInTheDocument()
    })

    it("counts the last hour in minutes and anything older in hours", () => {
        render(<ActivityFeed state="ready" message="" items={[
            item({ id: "a1", at: ago(30 * MINUTE) }),
            item({ id: "a2", at: ago(3 * HOUR) }),
        ]} />)
        expect(screen.getByText("minutesAgo:30")).toBeInTheDocument()
        expect(screen.getByText("hoursAgo:3")).toBeInTheDocument()
    })

    it("never reports an activity from the future as negative time", () => {
        render(<ActivityFeed state="ready" message="" items={[
            item({ id: "a1", at: new Date(NOW.getTime() + 10 * MINUTE).toISOString() }),
        ]} />)
        expect(screen.getByText("minutesAgo:0")).toBeInTheDocument()
    })

    it("names today and yesterday, and dates everything before them", () => {
        render(<ActivityFeed state="ready" message="" items={[
            item({ id: "a1", at: ago(30 * MINUTE) }),
            item({ id: "a2", at: ago(3 * HOUR) }),
            item({ id: "a3", at: ago(20 * HOUR) }),
            item({ id: "a4", at: ago(50 * HOUR) }),
        ]} />)
        expect(screen.getByText("today")).toBeInTheDocument()
        expect(screen.getByText("yesterday")).toBeInTheDocument()
        expect(screen.getByText("September 8, 2026")).toBeInTheDocument()
    })

    it("joins two activities from the same local day under one heading", () => {
        const { container } = render(<ActivityFeed state="ready" message="" items={[
            item({ id: "a1", at: ago(30 * MINUTE) }),
            item({ id: "a2", at: ago(3 * HOUR) }),
        ]} />)
        expect(container.querySelectorAll("[data-node=\"activity-day-group\"]")).toHaveLength(1)
        expect(container.querySelectorAll("[data-node=\"activity-actor-body-time-row\"]")).toHaveLength(2)
    })

    it("says a run of milestones by one learner once, and keeps everyone else's separate", () => {
        const { container } = render(<ActivityFeed state="ready" message="" items={[
            item({ id: "m1", type: ActivityType.MilestonePassed, actorGlobalId: "actor-1", targetLabel: "Chapter one" }),
            item({ id: "m2", type: ActivityType.MilestonePassed, actorGlobalId: "actor-1", targetLabel: "Chapter two" }),
            item({ id: "m3", type: ActivityType.MilestonePassed, actorGlobalId: "actor-2", actorUsername: "grace", targetLabel: "Chapter three" }),
            item({ id: "c1", type: ActivityType.CodingSolved, actorGlobalId: "actor-2", actorUsername: "grace", targetLabel: "Two sum" }),
            item({ id: "m4", type: ActivityType.MilestonePassed, actorGlobalId: "actor-2", actorUsername: "grace", targetLabel: "Chapter four" }),
        ]} />)

        expect(container.querySelectorAll("[data-node=\"activity-actor-body-time-row\"]")).toHaveLength(4)
        // The rolled-up pair loses its target: "two milestones" is the whole claim.
        expect(screen.getByText("activity.milestonePassedGrouped:2")).toBeInTheDocument()
        expect(screen.queryByText("Chapter one")).toBeNull()
        expect(screen.queryByText("Chapter two")).toBeNull()
        // A milestone by a different actor stands alone and keeps its target.
        expect(screen.getAllByText("activity.milestonePassed")).toHaveLength(2)
        expect(screen.getByText("Chapter three")).toBeInTheDocument()
        // A milestone that follows a different kind of event starts a new run.
        expect(screen.getByText("Chapter four")).toBeInTheDocument()
        expect(screen.getByText("activity.codingSolved")).toBeInTheDocument()
    })

    it("calls read content what the product calls it", () => {
        render(<ActivityFeed state="ready" message="" items={[item({ type: ActivityType.LessonRead })]} />)
        expect(screen.getByText("activity.contentRead")).toBeInTheDocument()
        expect(screen.queryByText("activity.lessonRead")).toBeNull()
    })

    it("drops the target line when the server named none", () => {
        render(<ActivityFeed state="ready" message="" items={[item({ targetLabel: null, targetGlobalId: null })]} />)
        expect(screen.getByText("ada")).toBeInTheDocument()
        expect(screen.queryByText("Build a parser")).toBeNull()
    })

    it("gives every actor a mark, whether or not they uploaded a picture", () => {
        const { container } = render(<ActivityFeed state="ready" message="" items={[
            item({ id: "a1", actorAvatar: "https://cdn.test/ada.png" }),
            item({ id: "a2", actorAvatar: null, actorUsername: "grace", actorGlobalId: "actor-2" }),
        ]} />)
        expect(container.querySelectorAll("[data-component=\"Avatar\"]")).toHaveLength(2)
        expect(screen.getByText("ada")).toBeInTheDocument()
        expect(screen.getByText("grace")).toBeInTheDocument()
    })

    it("reports opening the actor and opening the target as two different journeys", () => {
        const openActor = vi.fn()
        const openTarget = vi.fn()
        render(<ActivityFeed state="ready" message="" items={[item()]} on={{
            "actor:a1": openActor,
            "target:a1": openTarget,
        }} />)

        fireEvent.click(screen.getByText("ada"))
        expect(openActor).toHaveBeenCalledOnce()
        expect(openTarget).not.toHaveBeenCalled()

        fireEvent.click(screen.getByText("Build a parser"))
        expect(openTarget).toHaveBeenCalledOnce()
    })

    it("shuts only the reaction control of the row whose reaction is in flight", () => {
        render(<ActivityFeed state="ready" message="" reactingId="a2" items={[
            item({ id: "a1" }),
            item({ id: "a2" }),
        ]} />)
        const controls = screen.getAllByRole("button", { name: "react" })
        expect(controls).toHaveLength(2)
        expect(controls.filter((control) => control.hasAttribute("disabled"))).toHaveLength(1)
    })

    it("replaces the invitation with the reader's own reaction once they have left one", () => {
        render(<ActivityFeed state="ready" message="" items={[
            item({ id: "a1", myReaction: ReactionType.Love, reactionCount: 7 }),
            item({ id: "a2", myReaction: null, reactionCount: 0 }),
        ]} />)
        // The chosen reaction is drawn, so the word "react" survives only as the control's name.
        expect(screen.getByText("7")).toBeInTheDocument()
        expect(screen.getByText("react")).toBeInTheDocument()
        expect(screen.getAllByRole("button", { name: "react" })).toHaveLength(2)
    })

    it("offers no reaction control on the reader's own activity", () => {
        render(<ActivityFeed state="ready" message="" items={[
            item({ id: "a1", isMine: true, reactionCount: 3 }),
        ]} />)
        expect(screen.queryByRole("button", { name: "react" })).toBeNull()
        expect(screen.getByText("3")).toBeInTheDocument()
    })
})
