/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { RewardStatRowBase } from "./component"

describe("RewardStatRowBase", () => {
    it("renders resolved reward copy without request or locale providers", () => {
        render(<RewardStatRowBase state="settled" props={{ label: "Coins", value: "105 coins" }} />)
        expect(screen.getByText("Coins")).toBeTruthy()
        expect(screen.getByText("105 coins")).toBeTruthy()
    })

    it("turns the pending situation into a resting value leaf", () => {
        const { container } = render(<RewardStatRowBase state="pending" props={{ label: "Coins" }} />)
        expect(container.querySelector("[data-loading=\"true\"]")).toBeTruthy()
    })
})
