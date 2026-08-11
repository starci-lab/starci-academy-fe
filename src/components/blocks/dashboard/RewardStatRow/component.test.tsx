/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { _RewardStatRow } from "./component"

describe("_RewardStatRow", () => {
    it("renders resolved reward copy without request or locale providers", () => {
        render(<_RewardStatRow state="settled" props={{ label: "Reward points", value: "105 points" }} />)
        expect(screen.getByText("Reward points")).toBeTruthy()
        expect(screen.getByText("105 points")).toBeTruthy()
    })

    it("turns the pending situation into a resting value leaf", () => {
        const { container } = render(<_RewardStatRow state="pending" props={{ label: "Reward points" }} />)
        expect(container.querySelector("[data-component=\"Text\"][data-loading=\"true\"]")).toBeTruthy()
    })
})

