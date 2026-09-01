import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { RankMark, RankMarkIconId } from "./index"

describe("RankMark", () => {
    it("maps the podium to Grammar artwork and keeps ordinary ranks numeric", () => {
        expect(RankMarkIconId(1)).toBe("first")
        expect(RankMarkIconId(2)).toBe("second")
        expect(RankMarkIconId(3)).toBe("third")
        expect(RankMarkIconId(4)).toBe("number")
        expect(RankMarkIconId(27)).toBe("number")
        expect(RankMarkIconId(2, "cup")).toBe("cup")
    })

    it("renders an ordinary place as a number and retains its accessible label", () => {
        const { container } = render(
            <RankMark props={{ rank: 4, placement: "row", accessibleLabel: "Rank 4" }} />,
        )
        expect(container.querySelector("[aria-label=\"Rank 4\"]")).toBeInTheDocument()
        expect(container.querySelector("[data-artwork=\"number\"]")).toHaveTextContent("4")
        expect(container.querySelector("svg")).toBeNull()
    })

    it("renders explicit cup artwork independently from the numeric place", () => {
        const { container } = render(
            <RankMark props={{ rank: 27, placement: "standing", artwork: "cup", accessibleLabel: "Rank 27" }} />,
        )
        expect(container.querySelector("[data-artwork=\"cup\"] svg")).toBeInTheDocument()
    })
})
