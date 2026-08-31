/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
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
        expect(screen.getByText("Complete every task to earn 20 coins")).toBeInTheDocument()
        expect(screen.getByText("Complete every task to earn 20 coins").closest("[data-dashboard-quest-reward=true]")).toHaveClass("bg-accent-soft", "text-accent-soft-foreground", "px-4", "py-3")
        expect(container.querySelector("[data-dashboard-quest-hero=true]")).toHaveClass("bg-accent")
        expect(container.querySelector("img[aria-hidden=\"true\"]")).toHaveAttribute("src", expect.stringContaining("daily-quest-reward-v1.png"))
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
        fireEvent.click(screen.getByRole("button", { name: "Claim 20 coins" }))
        expect(claim).toHaveBeenCalledOnce()
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
        expect(screen.getByText("Reward claimed").closest("[data-dashboard-quest-reward=true]")).toBeInTheDocument()
        expect(container.querySelector("button")).toBeNull()
    })

    it("draws one row per task with compact title and progress copy", () => {
        const { container } = render(
            <DailyQuestBase state="open" props={{ label: "Today's quest", tasks, rewardLine: "x" }} />,
        )
        expect(screen.getByText("Today's quest")).toBeInTheDocument()
        expect(screen.getByText("Read content")).toHaveAttribute("data-size", "sm")
        expect(screen.getByText("Pass a challenge")).toHaveAttribute("data-size", "sm")
        expect(screen.getByText("0/1")).toHaveAttribute("data-size", "xs")
        expect(screen.getByText("1/2")).toHaveAttribute("data-size", "xs")
        expect(container.querySelector("button")).toBeNull()
    })

    it("keeps the card its own size while the day is still on its way", () => {
        const { container } = render(<DailyQuestBase state="pending" props={{ label: "Today's quest" }} />)
        expect(screen.getByText("Today's quest")).toBeInTheDocument()
        expect(container.querySelectorAll("li")).toHaveLength(5)
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
