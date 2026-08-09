/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import {
    ActivityFeed,
    meta,
    type ActivityFeedDayGroup,
    type ActivityFeedProps,
} from "@/components/blocks/feed/ActivityFeed"

/**
 * What these tests guard: that a day is a NAMED region rather than an unlabelled run - a feed
 * without day headers is a wall - and that a thing the sentence is about is only offered as a
 * link when it actually has an address. A token that looks clickable and is not is a dead end a
 * reader finds by pressing it.
 */

/** Two days, the second of them with no address to follow. */
const DAYS: ReadonlyArray<ActivityFeedDayGroup> = [
    {
        id: "today",
        label: "Today",
        rows: [
            {
                id: "a",
                actorName: "Stacy",
                message: "Stacy passed a milestone",
                relativeLabel: "3 hours ago",
                entityLabel: "Systems Design",
                href: "/courses/systems-design",
            },
        ],
    },
    {
        id: "yesterday",
        label: "Yesterday",
        rows: [
            { id: "b", actorName: "Minh", message: "Minh enrolled in a course", relativeLabel: "a day ago" },
        ],
    },
]

/** The way out of an empty feed. */
const EmptyAction = () => <span data-testid="empty-action">find people</span>

/** Render with the given props and hand back the root node. */
const renderFeed = (props: Partial<ActivityFeedProps> = {}): Element => {
    const merged: ActivityFeedProps = {
        dayGroups: DAYS,
        emptyTitle: "Nothing has happened yet",
        emptyAction: EmptyAction,
        ...props,
    }
    const { container } = render(<ActivityFeed {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("ActivityFeed rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("ActivityFeed", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "block", name: "ActivityFeed" })
    })

    it("names every day, so the run reads as days rather than as a wall", () => {
        const root = renderFeed()
        expect([...root.querySelectorAll("h3")].map((node) => node.textContent))
            .toEqual(["Today", "Yesterday"])
    })

    it("carries the whole sentence and when it happened, on one line", () => {
        const root = renderFeed()
        const line = root.querySelector("[data-node='key-value-row']")
        expect(line?.children[0].textContent).toBe("Stacy passed a milestone")
        expect(line?.children[1].textContent).toBe("3 hours ago")
    })

    it("offers the thing the sentence is about only when it has an address", () => {
        const root = renderFeed()
        const links = root.querySelectorAll("a")
        expect(links.length).toBe(1)
        expect(links[0].getAttribute("href")).toBe("/courses/systems-design")
    })

    it("says what is missing when the feed settles with nothing", () => {
        const root = renderFeed({ dayGroups: [] })
        expect(root.getAttribute("data-node")).toBe("empty-state")
        expect(root.textContent).toContain("Nothing has happened yet")
    })

    it("rests as a feed rather than as the reason there is not one", () => {
        const root = renderFeed({ dayGroups: [], isLoading: true })
        expect(root.querySelector("[data-node='empty-state']")).toBeNull()
        expect(root.querySelectorAll("[data-node='list-row']").length).toBe(3)
    })
})
