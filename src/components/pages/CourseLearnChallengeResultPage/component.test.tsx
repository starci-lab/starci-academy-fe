import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CourseLearnChallengeResultPage, type CourseLearnChallengeResultPageProps } from "./component"

const baseProps: CourseLearnChallengeResultPageProps["props"] = {
    title: "API repository",
    description: "Provide the repository URL.",
    scoreLine: "8/10",
    shortFeedback: "The transport is correct.",
    feedbacks: [{
        id: "feedback-1",
        message: "Validate the response envelope",
        detail: "The error branch must remain visible.",
        severity: "high",
        location: "src/client.ts:42",
        suggestion: "Check success before reading data.",
    }],
    reloadLabel: "Reload",
    retryLabel: "Retry challenge",
    nextLabel: "Next content",
}

describe("_CourseLearnChallengeResultPage", () => {
    it("rests the result surface while grading is pending", () => {
        const { container } = render(<_CourseLearnChallengeResultPage state="pending" props={baseProps} />)

        expect(container.querySelector("[data-node=course-learn-challenge-result-page]")).toBeTruthy()
        expect(container.querySelector("h1")).toHaveAttribute("data-loading", "true")
        expect(screen.getByRole("button", { name: "Retry challenge" })).toBeDisabled()
        expect(screen.getByRole("button", { name: "Next content" })).toBeDisabled()
    })

    it("renders backend score and every visible feedback body in the ready state", () => {
        const retry = vi.fn()
        const next = vi.fn()
        render(
            <_CourseLearnChallengeResultPage
                state="ready"
                props={baseProps}
                on={{ retry, next }}
            />,
        )

        expect(screen.getByText("8/10")).toBeInTheDocument()
        expect(screen.getByText("Validate the response envelope")).toBeInTheDocument()
        expect(screen.getByText("The error branch must remain visible.")).toBeInTheDocument()
        expect(screen.getByText("src/client.ts:42")).toBeInTheDocument()
        expect(screen.getByText("Check success before reading data.")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Retry challenge" }))
        fireEvent.click(screen.getByRole("button", { name: "Next content" }))
        expect(retry).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledTimes(1)
    })

    it("replaces result actions with reload after a query failure", () => {
        const reload = vi.fn()
        render(
            <_CourseLearnChallengeResultPage
                state="failed"
                props={{ ...baseProps, notice: "Result unavailable" }}
                on={{ reload }}
            />,
        )

        expect(screen.getByRole("alert")).toHaveTextContent("Result unavailable")
        fireEvent.click(screen.getByRole("button", { name: "Reload" }))
        expect(reload).toHaveBeenCalledTimes(1)
        expect(screen.queryByRole("button", { name: "Next content" })).not.toBeInTheDocument()
    })
})
