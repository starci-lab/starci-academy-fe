import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { RankedUserRow } from "./index"

describe("RankedUserRow", () => {
    it("maps success and danger verdicts to inset bands without adding a border", () => {
        const success = render(<RankedUserRow props={{
            id: "one",
            rank: 1,
            rankLabel: "Rank 1",
            name: "Ada",
            points: "480 XP",
            movementLabel: "Up 1",
            verdict: "success",
        }} />)
        const successRow = success.getByText("Ada").closest("[data-verdict=success]")
        expect(successRow).toHaveClass("pl-4", "inset-shadow-[2px_0_0_0_var(--success)]")
        expect(successRow).not.toHaveClass("border")
        success.unmount()

        const danger = render(<RankedUserRow props={{
            id: "two",
            rank: 2,
            rankLabel: "Rank 2",
            name: "Grace",
            points: "400 XP",
            movementLabel: "Down 2",
            verdict: "danger",
        }} />)
        const dangerRow = danger.getByText("Grace").closest("[data-verdict=danger]")
        expect(dangerRow).toHaveClass("pl-4", "inset-shadow-[2px_0_0_0_var(--danger)]")
        expect(dangerRow).not.toHaveClass("border")
    })

    it("keeps the viewer accented and removes the follow action", () => {
        const follow = vi.fn()
        render(<RankedUserRow props={{
            id: "self",
            rank: 4,
            rankLabel: "Rank 4",
            name: "Learner · You",
            points: "105 XP",
            followLabel: "Follow",
            isMe: true,
        }} on={{ follow }} />)
        expect(screen.getByText("Learner · You")).toHaveAttribute("data-tone", "accent")
        expect(screen.queryByRole("button", { name: "Follow" })).toBeNull()
    })

    it("keeps follow as the only trailing action for another learner", () => {
        const follow = vi.fn()
        render(<RankedUserRow props={{
            id: "other",
            rank: 5,
            rankLabel: "Rank 5",
            name: "Linus",
            points: "100 XP",
            followLabel: "Follow",
        }} on={{ follow }} />)
        fireEvent.click(screen.getByRole("button", { name: "Follow" }))
        expect(follow).toHaveBeenCalledOnce()
    })
})
