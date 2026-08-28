/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { ErrorMessage } from "."

afterEach(cleanup)

describe("ErrorMessage", () => {
    it("uses the HeroUI error-message slot and assertive semantics", () => {
        const { container } = render(<ErrorMessage props={{ content: "Server unavailable" }} />)

        expect(screen.getByRole("alert")).toHaveTextContent("Server unavailable")
        expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive")
        expect(container.querySelector("[slot='errorMessage']")).toBe(screen.getByRole("alert"))
    })
})
