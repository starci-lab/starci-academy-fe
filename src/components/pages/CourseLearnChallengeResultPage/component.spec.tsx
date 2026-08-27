import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ChallengeResultBase, type ChallengeResultProps } from "@/components/blocks/learn/ChallengeResult/component"

const baseProps: ChallengeResultProps["props"] = {
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
    evaluationTitle: "Evaluating your attempt",
    evaluationDetail: "You may leave and resume later.",
    realtimeStatus: "Live grading updates connected",
    breadcrumbLabel: "Course challenge path",
    courseTitle: "Fullstack Mastery",
    moduleTitle: "Backend foundations",
    contentTitle: "Dependency injection",
}

describe("ChallengeResultBase", () => {
    it("rests the result surface while grading is pending", () => {
        render(<ChallengeResultBase blockState="pending" props={baseProps} />)

        expect(screen.getByText("Evaluating your attempt")).toBeInTheDocument()
        expect(screen.getByText("You may leave and resume later.")).toBeInTheDocument()
        expect(screen.getByText("Live grading updates connected")).toHaveAttribute("aria-live", "polite")
        expect(screen.getByRole("button", { name: "Reload" })).toBeDisabled()
        expect(screen.getByLabelText("Course challenge path")).toHaveTextContent("Fullstack MasteryBackend foundationsDependency injectionAPI repository")
    })

    it("renders backend score and every visible feedback body in the ready state", () => {
        const retry = vi.fn()
        const next = vi.fn()
        render(
            <ChallengeResultBase
                blockState="ready"
                props={baseProps}
                on={{ retry, next }}
            />,
        )

        expect(screen.getByText("8/10")).toBeInTheDocument()
        expect(screen.getByText("Validate the response envelope")).toBeInTheDocument()
        expect(screen.getByText("The error branch must remain visible.")).toBeInTheDocument()
        expect(screen.getByText("src/client.ts:42")).toBeInTheDocument()
        expect(screen.getByText("Check success before reading data.")).toBeInTheDocument()
        expect(screen.getAllByRole("button").at(-1)).toHaveTextContent("Next content")
        fireEvent.click(screen.getByRole("button", { name: "Retry challenge" }))
        fireEvent.click(screen.getByRole("button", { name: "Next content" }))
        expect(retry).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledTimes(1)
    })

    it("replaces result actions with reload after a query failure", () => {
        const reload = vi.fn()
        render(
            <ChallengeResultBase
                blockState="failed"
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
