/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { _DailyQuest } from "./component"

/**
 * What these tests guard - that the reward is offered exactly once.
 *
 * The server sends `allDone` and `claimed` separately because neither implies the other, and the
 * two failures that come from collapsing them are opposite and both bad: offering a reward that
 * has already been taken, or never offering one that has been earned. Each is a state here, and
 * each is asserted.
 *
 * THE CONTROL IS ABSENT, NOT DISABLED, while the day is unfinished - a greyed-out claim button
 * invites a press that teaches the reader nothing.
 */

/** Two rows, enough to tell a list from an empty card. */
const tasks = [
    { id: "readContent", title: "Read content", percent: 0, percentText: "0/1" },
    { id: "passChallenge", title: "Pass a challenge", percent: 50, percentText: "1/2" },
]

afterEach(cleanup)

describe("_DailyQuest", () => {
    it("says what the day is worth while it is unfinished, and offers nothing to press", () => {
        const { container } = render(
            <_DailyQuest
                state="open"
                props={{ label: "Today's quest", tasks, rewardLine: "Complete every task to earn 20 coins" }}
            />,
        )
        expect(screen.getByText("Complete every task to earn 20 coins")).toBeTruthy()
        expect(screen.getByText("Complete every task to earn 20 coins")).toHaveAttribute("data-size", "xs")
        expect(container.querySelector("button")).toBeNull()
    })

    it("offers the reward once the day is done", () => {
        const claim = vi.fn()
        render(
            <_DailyQuest
                state="claimable"
                props={{ label: "Today's quest", tasks, rewardLine: "unused", claimLabel: "Claim 20 coins" }}
                on={{ claim }}
            />,
        )
        expect(screen.getByText("Claim 20 coins")).toBeTruthy()
    })

    it("stops offering it once it has been taken", () => {
        const { container } = render(
            <_DailyQuest
                state="claimed"
                props={{ label: "Today's quest", tasks, rewardLine: "unused", claimedLine: "Reward claimed" }}
                on={{ claim: () => {} }}
            />,
        )
        expect(screen.getByText("Reward claimed")).toBeTruthy()
        expect(container.querySelector("button")).toBeNull()
    })

    it("draws one row per task", () => {
        const { container } = render(
            <_DailyQuest state="open" props={{ label: "Today's quest", tasks, rewardLine: "x" }} />,
        )
        expect(container.querySelectorAll("[data-node=\"task-mark-title-fact-row\"]")).toHaveLength(2)
        const surface = container.querySelector("[data-component=\"SurfaceListCardSurface\"]")
        expect(container.querySelectorAll("[data-component=\"SurfaceListCardSurface\"]")).toHaveLength(1)
        expect(surface?.className).toContain("p-0")
        const body = container.querySelector("[data-component=\"SurfaceListCardBody\"]")
        expect(body?.className).toContain("p-0")
        const list = container.querySelector("[data-node=\"marked-row-list\"]")
        expect(container.querySelectorAll("[data-node=\"marked-row-list\"]")).toHaveLength(1)
        expect(list?.className).toContain("divide-y")
        expect(list?.className).toContain("divide-separator")
        expect(list?.className).toContain("p-0")
        expect(list?.className).toContain("[&>*]:px-4")
        expect(list?.className).toContain("[&>*]:py-3")
        expect(list?.className).toContain("[&>*:first-child]:pt-4")
        expect(list?.className).toContain("[&>*:last-child]:pb-4")
        expect(list?.querySelectorAll(":scope > [data-node=\"task-mark-title-fact-row\"]")).toHaveLength(2)
        expect(container.querySelector("[data-node=\"task-mark-title-fact-row\"]")?.className).not.toMatch(/\bp-/)
        expect(container.querySelector("[data-component=\"SurfaceListCard\"]")?.className).toContain("gap-3")
        expect(container.querySelector("[data-node=\"title-with-end-action\"]")).toBeNull()

        const titles = tasks.map((task) => screen.getByText(task.title))
        for (const title of titles) {
            expect(title).toHaveAttribute("data-size", "sm")
            expect(title).toHaveAttribute("data-weight", "normal")
        }
    })

    it("uses the semantic completion icon only for completed tasks", () => {
        const completedTasks = [
            { id: "readContent", title: "Read content", percent: 100, percentText: "1/1" },
            { id: "passChallenge", title: "Pass a challenge", percent: 0, percentText: "0/1" },
        ]
        const { container } = render(
            <_DailyQuest state="open" props={{ label: "Today's quest", tasks: completedTasks, rewardLine: "x" }} />,
        )
        expect(container.querySelectorAll("svg.text-success-soft-foreground")).toHaveLength(1)
        const pending = container.querySelector(
            "[data-node=\"task-mark-title-fact-row\"]:not(:has(svg.text-success-soft-foreground))",
        )
        expect(pending).not.toBeNull()
        expect(pending?.querySelector("svg")).not.toBeNull()
        expect(pending?.className).not.toMatch(/border/)
    })

    it("keeps the card its own size while the day is still on its way", () => {
        const { container } = render(<_DailyQuest state="pending" props={{ label: "Today's quest" }} />)
        // Resting rows stand in for real ones so the card does not jump when they land.
        expect(container.querySelectorAll("[data-node=\"task-mark-title-fact-row\"]")).toHaveLength(5)
        const restingTitles = container.querySelectorAll(
            "[data-node=\"task-mark-title-fact-row\"] [data-component=\"Text\"][data-size=\"sm\"][data-loading=\"true\"]",
        )
        const restingFacts = container.querySelectorAll(
            "[data-node=\"task-mark-title-fact-row\"] [data-component=\"Text\"][data-size=\"xs\"][data-loading=\"true\"]",
        )
        expect(restingTitles).toHaveLength(5)
        expect(restingFacts).toHaveLength(5)
        expect(restingTitles[0]?.className).toContain("w-12")
        expect(restingFacts[0]?.className).toContain("w-10")
    })

    it("offers a way back when the day could not be read", () => {
        const retry = vi.fn()
        render(
            <_DailyQuest
                state="failed"
                props={{ label: "Today's quest", message: "Could not load", retryLabel: "Retry" }}
                on={{ retry }}
            />,
        )
        expect(screen.getByText("Could not load")).toBeTruthy()
        expect(screen.getByText("Retry")).toBeTruthy()
    })
})
