import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseLearnChallengePageBase, type CourseLearnChallengePageProps } from "./component"

const baseProps: CourseLearnChallengePageProps["props"] = {
    title: "Repository challenge",
    description: "Submit the authored deliverable.",
    metaLine: "hard · 4/10",
    hint: "Keep the public API stable.",
    deliverables: [{
        id: "submission-1",
        title: "API repository",
        description: "Provide the repository URL.",
        scoreLine: "10",
        url: "https://example.test/repository",
    }],
    submitLabel: "Submit",
    submittingLabel: "Submitting",
    retryLabel: "Retry",
    resultLabel: "Read result",
}

describe("CourseLearnChallengePageBase", () => {
    it("rests the challenge facts and controls while pending", () => {
        const { container } = render(<CourseLearnChallengePageBase state="pending" props={baseProps} />)

        expect(container.querySelector("[data-node=course-learn-challenge-page]")).toBeTruthy()
        expect(container.querySelector("h1")).toHaveAttribute("data-loading", "true")
        expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled()
    })

    it("submits the edited deliverable in the ready state", () => {
        const changeUrl = vi.fn()
        const submit = vi.fn()
        render(
            <CourseLearnChallengePageBase
                state="ready"
                props={baseProps}
                on={{ changeUrl, submit }}
            />,
        )

        fireEvent.change(screen.getByLabelText("API repository"), {
            target: { value: "https://example.test/next" },
        })
        fireEvent.click(screen.getByRole("button", { name: "Submit" }))
        expect(changeUrl).toHaveBeenCalledWith("submission-1", "https://example.test/next")
        expect(submit).toHaveBeenCalledWith("submission-1")
    })

    it("locks submission while the approved transport is running", () => {
        render(<CourseLearnChallengePageBase state="submitting" props={baseProps} />)

        expect(screen.getByLabelText("API repository")).toBeDisabled()
        expect(screen.getByRole("button", { name: "Submitting" })).toBeDisabled()
    })

    it("opens an authored deliverable result after the challenge has passed", () => {
        const openResult = vi.fn()
        render(
            <CourseLearnChallengePageBase
                state="passed"
                props={baseProps}
                on={{ openResult }}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Read result: API repository" }))
        expect(openResult).toHaveBeenCalledWith("submission-1")
        expect(screen.queryByLabelText("API repository")).not.toBeInTheDocument()
    })

    it("exposes one recovery action after a load or submit failure", () => {
        const retry = vi.fn()
        render(
            <CourseLearnChallengePageBase
                state="failed"
                props={{ ...baseProps, notice: "Submission refused" }}
                on={{ retry }}
            />,
        )

        expect(screen.getByRole("alert")).toHaveTextContent("Submission refused")
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(retry).toHaveBeenCalledTimes(1)
    })
})
