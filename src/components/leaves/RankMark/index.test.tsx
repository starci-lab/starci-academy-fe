import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { RankMark, RankMarkIconId } from "./index"

vi.mock("@iconify/react", () => ({
    Icon: (props: Readonly<Record<string, unknown>>) => <span {...props} />,
}))

describe("RankMark", () => {
    it("keeps the exact place-medal map and uses the trophy for every rank four or lower", () => {
        expect(RankMarkIconId(1)).toBe("fluent-emoji-flat:1st-place-medal")
        expect(RankMarkIconId(2)).toBe("fluent-emoji-flat:2nd-place-medal")
        expect(RankMarkIconId(3)).toBe("fluent-emoji-flat:3rd-place-medal")
        expect(RankMarkIconId(4)).toBe("fluent-emoji-flat:trophy")
        expect(RankMarkIconId(27)).toBe("fluent-emoji-flat:trophy")
    })

    it("retains the numeric rank in its accessible label", () => {
        const { container } = render(
            <RankMark props={{ rank: 4, placement: "row", accessibleLabel: "Rank 4" }} />,
        )
        expect(container.querySelector("[data-component=\"RankMark\"]")).toHaveAttribute("aria-label", "Rank 4")
    })
})
