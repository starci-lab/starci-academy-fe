import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { RankMark, RankMarkIconId } from "./index"

vi.mock("@iconify/react", () => ({
    Icon: (props: Readonly<Record<string, unknown>>) => <span {...props} />,
}))

describe("RankMark", () => {
    it("keeps distinct place medals and uses one stable mark for lower ranks", () => {
        expect(RankMarkIconId(1)).not.toBe(RankMarkIconId(2))
        expect(RankMarkIconId(2)).not.toBe(RankMarkIconId(3))
        expect(RankMarkIconId(4)).toBe(RankMarkIconId(27))
    })

    it("retains the numeric rank in its accessible label", () => {
        const { container } = render(
            <RankMark props={{ rank: 4, placement: "row", accessibleLabel: "Rank 4" }} />,
        )
        expect(container.querySelector("[data-component=\"RankMark\"]")).toHaveAttribute("aria-label", "Rank 4")
    })
})
