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
                props={{ label: "Today's quest", tasks, rewardLine: "Complete every task to earn 20 pts" }}
            />,
        )
        expect(screen.getByText("Complete every task to earn 20 pts")).toBeTruthy()
        expect(container.querySelector("button")).toBeNull()
    })

    it("offers the reward once the day is done", () => {
        const claim = vi.fn()
        render(
            <_DailyQuest
                state="claimable"
                props={{ label: "Today's quest", tasks, rewardLine: "unused", claimLabel: "Claim 20 pts" }}
                on={{ claim }}
            />,
        )
        expect(screen.getByText("Claim 20 pts")).toBeTruthy()
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
        expect(container.querySelectorAll("[data-component=\"TaskProgressRow\"]")).toHaveLength(2)
    })

    it("keeps the card its own size while the day is still on its way", () => {
        const { container } = render(<_DailyQuest state="pending" props={{ label: "Today's quest" }} />)
        // Resting rows stand in for real ones so the card does not jump when they land.
        expect(container.querySelectorAll("[data-component=\"TaskProgressRow\"]")).toHaveLength(5)
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
