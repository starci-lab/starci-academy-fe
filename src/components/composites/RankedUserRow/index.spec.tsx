import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { RankedUserRow } from "./index"

describe("RankedUserRow", () => {
    it("reports a movement verdict on the row rather than painting one", () => {
        const success = render(<RankedUserRow props={{
            id: "one",
            rank: 1,
            rankLabel: "Rank 1",
            name: "Ada",
            points: "480 XP",
            rankDelta: 1,
            movementLabel: "Up 1",
            verdict: "success",
        }} />)
        expect(success.getByText("Ada").closest("[data-verdict=success]")).toBeInTheDocument()
        expect(success.container.querySelector("[data-direction='up']")).toHaveAttribute("aria-label", "Up 1")
        success.unmount()

        const danger = render(<RankedUserRow props={{
            id: "two",
            rank: 2,
            rankLabel: "Rank 2",
            name: "Grace",
            points: "400 XP",
            rankDelta: -2,
            movementLabel: "Down 2",
            verdict: "danger",
        }} />)
        expect(danger.getByText("Grace").closest("[data-verdict=danger]")).toBeInTheDocument()
        expect(danger.container.querySelector("[data-direction='down']")).toHaveAttribute("aria-label", "Down 2")
    })

    it("keeps the viewer accented and removes the follow action", () => {
        const follow = vi.fn()
        render(<RankedUserRow props={{
            id: "self",
            rank: 4,
            rankLabel: "Rank 4",
            name: "Learner · You",
            points: "105 XP",
            subtitle: "Đang giữ chuỗi học 42 ngày liên tiếp",
            followLabel: "Follow",
            isMe: true,
        }} on={{ follow }} />)
        expect(screen.getByText("Learner · You")).toHaveAttribute("data-tone", "accent")
        // The name column cuts before the trailing facts, and each line Grammar can answer for says
        // so itself rather than being reached at through the wrapper.
        expect(screen.getByText("Learner · You")).toHaveAttribute("data-overflow", "truncate")
        expect(screen.getByText("Đang giữ chuỗi học 42 ngày liên tiếp")).toHaveAttribute("data-overflow", "truncate")
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
