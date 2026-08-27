import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { LeaderboardStandingRow } from "./index"
import { RankMarkIconId } from "@/components/leaves/RankMark"

describe("LeaderboardStandingRow", () => {
    it("leads the standing sentence with rank artwork and keeps the short fact trailing", () => {
        const { container } = render(<LeaderboardStandingRow props={{
            rank: 4,
            rankLabel: "Rank 4",
            title: "Rank #4 globally",
            subtitle: "105 XP",
            fact: "4 days left",
        }} />)
        expect(screen.getByText("Rank #4 globally")).toBeInTheDocument()
        expect(screen.getByText("105 XP")).toBeInTheDocument()
        expect(screen.getByText("4 days left")).toBeInTheDocument()
        expect(container.querySelector("[data-placement=\"standing\"]")).toHaveAttribute(
            "data-icon",
            RankMarkIconId(4),
        )
    })
})
