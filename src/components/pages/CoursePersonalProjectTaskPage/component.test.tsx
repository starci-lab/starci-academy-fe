import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CoursePersonalProjectTaskPage } from "./component"

describe("_CoursePersonalProjectTaskPage", () => {
    it("renders the backend task fact and submit action in the ready state", () => {
        render(
            <_CoursePersonalProjectTaskPage
                state="ready"
                props={{
                    title: "Build the API client",
                    description: "techIntegrate",
                    scoreLabel: "Up to 20 points",
                    submitLabel: "Submit for review",
                    retryLabel: "Try again",
                }}
                on={{ submit: vi.fn() }}
            />,
        )

        expect(screen.getByRole("heading", { name: "Build the API client" })).toBeInTheDocument()
        expect(screen.getByText("Up to 20 points")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Submit for review" })).toBeEnabled()
    })

    it("keeps the submit action pending while review is being enqueued", () => {
        render(
            <_CoursePersonalProjectTaskPage
                state="submitting"
                props={{
                    title: "Build the API client",
                    description: "techIntegrate",
                    scoreLabel: "Up to 20 points",
                    submitLabel: "Submit for review",
                    retryLabel: "Try again",
                }}
            />,
        )

        expect(screen.getByRole("button", { name: "Submit for review" })).toBeDisabled()
    })

    it("replaces submission controls with a recovery action after failure", () => {
        render(
            <_CoursePersonalProjectTaskPage
                state="failed"
                props={{
                    title: "Personal project task",
                    description: "Complete this task.",
                    notice: "The task could not be submitted.",
                    submitLabel: "Submit for review",
                    retryLabel: "Try again",
                }}
                on={{ retry: vi.fn() }}
            />,
        )

        expect(screen.getByRole("alert")).toHaveTextContent("The task could not be submitted.")
        expect(screen.queryByRole("button", { name: "Submit for review" })).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled()
    })
})
