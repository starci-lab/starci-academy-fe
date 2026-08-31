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

    it("draws action progress beside the unchanged action label", () => {
        const { container } = render(
            <Button props={{ label: "Sign In", variant: "primary", isPending: true }} />,
        )

        const button = screen.getByRole("button", { name: "Sign In" })
        expect(button.getAttribute("data-action-pending")).toBe("true")
        expect(button).toHaveAttribute("data-pending", "true")
        expect(button).toBeDisabled()
        expect(container.querySelector("[data-slot='spinner']")).toHaveClass("spinner--current")
        expect(screen.getByText("Sign In")).toBeVisible()
        expect(screen.getByText("Sign In").className).not.toContain("invisible")
    })

    it("draws no named action icon and reserves motion for a trailing forward arrow", () => {
        const { container, rerender } = render(<Button props={{ label: "Retry", icon: "retry" }} />)

        expect(screen.getByRole("button", { name: "Retry" }).querySelector("svg")).toBeNull()

        rerender(<Button props={{ label: "Continue", icon: "next", iconPlacement: "trailing" }} />)

        expect(screen.getByRole("button", { name: "Continue" }).querySelector("svg")).not.toBeNull()
        expect(container.querySelector(".group-hover\\:translate-x-1")).not.toBeNull()
    })
})
