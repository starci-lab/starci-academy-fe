/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { _StreakStatRow } from "./component"

describe("_StreakStatRow", () => {
    it("renders resolved streak copy without request or locale providers", () => {
        render(<_StreakStatRow state="settled" props={{ label: "Streak", value: "7 days" }} />)
        expect(screen.getByText("Streak")).toBeTruthy()
        expect(screen.getByText("7 days")).toBeTruthy()
    })

    it("turns the pending situation into a resting value leaf", () => {
        const { container } = render(<_StreakStatRow state="pending" props={{ label: "Streak" }} />)
        expect(container.querySelector("[data-component=\"Text\"][data-loading=\"true\"]")).toBeTruthy()
    })
})

