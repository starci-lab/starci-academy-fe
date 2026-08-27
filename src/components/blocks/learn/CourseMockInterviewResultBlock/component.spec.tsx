import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CourseMockInterviewResultBlockBase, type CourseMockInterviewResultData } from "./component"

const props: CourseMockInterviewResultData = {
    title: "Interview report",
    description: "Persisted assessment",
    gradingLabel: "Grading in progress",
    gradingFailedLabel: "Grading stopped",
    gradingFailureDetail: "MODEL_UNAVAILABLE",
    gradingAttemptLabel: "2/3",
    retryingLabel: "Retrying",
    failedLabel: "Report unavailable",
    scoreLabel: "Overall score",
    phaseTitle: "Rubric",
    phases: [],
    strengthsTitle: "Strengths",
    strengths: [],
    gapsTitle: "Improve",
    gaps: [],
    reviewsTitle: "Question review",
    reviews: [],
    retryLabel: "Retry grading",
    abandonLabel: "Discard session",
    newSessionLabel: "Interview again",
    openTranscriptLabel: "View transcript",
    openHistoryLabel: "Interview history",
    returnToCourseLabel: "Back to course",
    sessionSummaryTitle: "Session summary",
    sessionSummaryPromptLabel: "Interview",
    sessionSummaryQuestionLabel: "Questions graded",
    recommendationTitle: "Next practice",
    retrying: false,
    canRetryGrading: true,
}

describe("CourseMockInterviewResultBlockBase", () => {
    it("does not invent report evidence while grading is still queued", () => {
        render(<CourseMockInterviewResultBlockBase state="grading" props={props} />)
        expect(screen.getByText("Grading in progress")).toBeInTheDocument()
        expect(screen.queryByText("0/100")).not.toBeInTheDocument()
    })

    it("shows bounded retry evidence when grading terminally fails", () => {
        render(<CourseMockInterviewResultBlockBase state="gradingFailed" props={props} />)
        expect(screen.getByRole("heading", { name: "Grading stopped" })).toBeInTheDocument()
        expect(screen.getByText("MODEL_UNAVAILABLE")).toBeInTheDocument()
        expect(screen.getByText("2/3")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Retry grading" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Discard session" })).toBeInTheDocument()
    })

    it("places the course-grounded recommendation after a ready report", () => {
        render(<CourseMockInterviewResultBlockBase state="ready" props={{ ...props, score: 84, recommendation: "Review cache invalidation" }} />)
        expect(screen.getByRole("heading", { name: "Next practice" })).toBeInTheDocument()
        expect(screen.getByText("Review cache invalidation")).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Session summary" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "View transcript" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Interview history" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Back to course" })).toBeInTheDocument()
    })
})
