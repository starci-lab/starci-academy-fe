/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { Field } from "."

afterEach(cleanup)

describe("Field", () => {
    it("uses the legacy eye control to reveal and hide a password", () => {
        render(
            <Field
                props={{
                    id: "password",
                    name: "password",
                    kind: "password",
                    label: "Password",
                    revealLabel: "Show password",
                    hideLabel: "Hide password",
                }}
            />,
        )

        const input = screen.getByLabelText("Password")
        const reveal = screen.getByRole("button", { name: "Show password" })
        expect(input.getAttribute("type")).toBe("password")
        expect(reveal.querySelector("svg")).toBeTruthy()
        expect(screen.queryByText("Show password")).toBeNull()

        fireEvent.click(reveal)
        expect(input.getAttribute("type")).toBe("text")
        expect(screen.getByRole("button", { name: "Hide password" }).querySelector("svg")).toBeTruthy()
    })
})
