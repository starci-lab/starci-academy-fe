/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { CreditStatRowBase } from "./component"

describe("CreditStatRowBase", () => {
    it("renders resolved credit copy without request or locale providers", () => {
        render(<CreditStatRowBase state="settled" props={{ label: "AI credit", value: "40/50" }} />)
        expect(screen.getByText("AI credit")).toBeTruthy()
        expect(screen.getByText("40/50")).toBeTruthy()
    })

    it("turns the pending situation into a resting value leaf", () => {
        const { container } = render(<CreditStatRowBase state="pending" props={{ label: "AI credit" }} />)
        expect(container.querySelector("[data-component=\"Text\"][data-loading=\"true\"]")).toBeTruthy()
    })
})

