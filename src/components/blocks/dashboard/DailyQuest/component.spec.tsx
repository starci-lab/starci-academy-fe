/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { DailyQuestBase } from "./component"

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

describe("DailyQuestBase", () => {
    it("says what the day is worth while it is unfinished, and offers nothing to press", () => {
        const { container } = render(
            <DailyQuestBase
                state="open"
                props={{ label: "Today's quest", tasks, rewardLine: "Complete every task to earn 20 coins" }}
            />,
        )
        expect(screen.getByText("Complete every task to earn 20 coins")).toBeTruthy()
        expect(screen.getByText("Complete every task to earn 20 coins")).toBeInTheDocument()
        expect(container.querySelector("button")).toBeNull()
    })

    it("offers the reward once the day is done", () => {
        const claim = vi.fn()
        render(
            <DailyQuestBase
                state="claimable"
                props={{ label: "Today's quest", tasks, rewardLine: "unused", claimLabel: "Claim 20 coins" }}
                on={{ claim }}
            />,
        )
        expect(screen.getByText("unused")).toBeInTheDocument()
    })

    it("stops offering it once it has been taken", () => {
        const { container } = render(
            <DailyQuestBase
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
            <DailyQuestBase state="open" props={{ label: "Today's quest", tasks, rewardLine: "x" }} />,
        )
        expect(screen.getByText("Today's quest")).toBeInTheDocument()
        expect(screen.getByText("Read content")).toBeInTheDocument()
        expect(screen.getByText("Pass a challenge")).toBeInTheDocument()
        expect(screen.getByText("0/1")).toBeInTheDocument()
        expect(screen.getByText("1/2")).toBeInTheDocument()
        expect(container.querySelector("button")).toBeNull()

        const titles = tasks.map((task) => screen.getByText(task.title))
        for (const title of titles) {
            expect(title).toBeInTheDocument()
        }
    })

    it("uses the semantic completion icon only for completed tasks", () => {
        const completedTasks = [
            { id: "readContent", title: "Read content", percent: 100, percentText: "1/1" },
            { id: "passChallenge", title: "Pass a challenge", percent: 0, percentText: "0/1" },
        ]
        const { container } = render(
            <DailyQuestBase state="open" props={{ label: "Today's quest", tasks: completedTasks, rewardLine: "x" }} />,
        )
        expect(container.querySelectorAll("svg.text-success-soft-foreground")).toHaveLength(1)
        expect(screen.getByText("Pass a challenge")).toBeInTheDocument()
    })

    it("keeps the card its own size while the day is still on its way", () => {
        const { container } = render(<DailyQuestBase state="pending" props={{ label: "Today's quest" }} />)
        // Resting rows stand in for real ones so the card does not jump when they land.
        expect(screen.getByText("Today's quest")).toBeInTheDocument()
        expect(container.querySelectorAll("button")).toHaveLength(0)
    })

    it("offers a way back when the day could not be read", () => {
        const retry = vi.fn()
        render(
            <DailyQuestBase
                state="failed"
                props={{ label: "Today's quest", message: "Could not load", retryLabel: "Retry" }}
                on={{ retry }}
            />,
        )
        expect(screen.getByText("Could not load")).toBeTruthy()
        expect(screen.getByText("Retry")).toBeTruthy()
    })
})
