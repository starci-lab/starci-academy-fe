/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { Button } from "./index"

afterEach(cleanup)

describe("Button", () => {
    it("exposes the vendor tertiary appearance without custom paint", () => {
        render(<Button props={{ label: "Trial", variant: "tertiary" }} />)

        expect(screen.getByRole("button", { name: "Trial" })).toHaveAttribute("data-variant", "tertiary")
    })

    it("draws action progress without replacing the resting label width", () => {
        const { container } = render(
            <Button props={{ label: "Sign In", variant: "primary", isPending: true }} />,
        )

        const button = screen.getByRole("button", { name: "Sign In" })
        expect(button.getAttribute("data-action-pending")).toBe("true")
        expect(button).toBeDisabled()
        expect(container.querySelector("[data-slot='spinner']")).toBeTruthy()
        expect(screen.getByText("Sign In").className).toContain("invisible")
    })
})
