/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseMockInterviewResultBlockBase, type CourseMockInterviewResultData } from "@/components/blocks/learn/CourseMockInterviewResultBlock/component"

const copy: CourseMockInterviewResultData = {
    title: "Interview debrief", description: "Persisted result", gradingLabel: "Grading your answers", gradingFailedLabel: "Grading stopped", gradingFailureDetail: "Retry or discard", retryingLabel: "Retrying grading", failedLabel: "The debrief could not be read", scoreLabel: "Overall score", score: 82, verdict: "Hire", promptTitle: "Distributed cache", phaseTitle: "Score breakdown", phases: [{ id: "requirements", label: "Requirements", score: 16, max: 20 }], strengthsTitle: "Strengths", strengths: ["Clear trade-offs"], gapsTitle: "What to improve", gaps: ["Quantify capacity"], reviewsTitle: "Question review", reviews: [], retryLabel: "Check again", abandonLabel: "Discard session", newSessionLabel: "Interview again", openTranscriptLabel: "View transcript", openHistoryLabel: "Interview history", returnToCourseLabel: "Back to course", sessionSummaryTitle: "Session summary", sessionSummaryPromptLabel: "Interview", sessionSummaryQuestionLabel: "Questions graded", recommendationTitle: "Recommended next practice", retrying: false, canRetryGrading: true,
}

describe("CourseMockInterviewResultBlockBase", () => {
    it("renders score, verdict and rubric evidence", () => {
        render(<CourseMockInterviewResultBlockBase state="ready" props={copy} />)
        expect(screen.getByRole("main")).toBeInTheDocument()
        expect(screen.getByText("82/100")).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Hire" })).toBeInTheDocument()
        expect(screen.getByRole("progressbar", { name: "Requirements" })).toHaveAttribute("aria-valuenow", "80")
    })

    it("shows a running grading notice without a finished score", () => {
        render(<CourseMockInterviewResultBlockBase state="grading" props={copy} />)
        expect(screen.getByText("Grading your answers")).toBeInTheDocument()
        expect(screen.queryByText("82/100")).toBeNull()
    })

    it("offers retry from a failed result", () => {
        const retry = vi.fn()
        render(<CourseMockInterviewResultBlockBase state="failed" props={copy} on={{ retry }} />)
        fireEvent.click(screen.getByRole("button", { name: "Check again" }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("offers retry and discard after grading fails", () => {
        const retry = vi.fn(), abandon = vi.fn()
        render(<CourseMockInterviewResultBlockBase state="gradingFailed" props={copy} on={{ retry, abandon }} />)
        fireEvent.click(screen.getByRole("button", { name: "Check again" }))
        fireEvent.click(screen.getByRole("button", { name: "Discard session" }))
        expect(retry).toHaveBeenCalledOnce()
        expect(abandon).toHaveBeenCalledOnce()
    })
})
