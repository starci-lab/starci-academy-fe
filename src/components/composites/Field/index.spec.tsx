/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { Field } from "."

afterEach(cleanup)

describe("Field", () => {
    it("places stable guidance before the input and exposes all descriptive copy", () => {
        const { container } = render(
            <Field
                props={{
                    id: "repository",
                    name: "repository",
                    label: "Repository",
                    description: "Paste the repository that contains your implementation.",
                    hint: "Use an HTTPS GitHub URL.",
                }}
            />,
        )

        const input = screen.getByLabelText("Repository")
        const description = screen.getByText("Paste the repository that contains your implementation.")
        const hint = screen.getByText("Use an HTTPS GitHub URL.")
        expect(container.firstElementChild).toHaveClass("starci-core-form-field")
        expect(description.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(input).toHaveAttribute("aria-describedby", "repository-description repository-hint")
        expect(description).toBeInTheDocument()
        expect(hint).toBeInTheDocument()
    })

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

    it("can remove repeated visible label copy without removing the accessible name", () => {
        render(
            <Field
                props={{
                    id: "otp",
                    name: "otp",
                    kind: "code",
                    label: "OTP code",
                    labelVisibility: "screenReader",
                }}
            />,
        )

        expect(screen.getByLabelText("OTP code")).toBeInTheDocument()
        expect(screen.getByText("OTP code")).toHaveClass("starci-core-form-label--screen-reader")
    })
})
