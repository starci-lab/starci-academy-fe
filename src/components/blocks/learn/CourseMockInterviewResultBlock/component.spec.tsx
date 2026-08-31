import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CourseMockInterviewResultBlockBase, type CourseMockInterviewResultData } from "./component"

const props: CourseMockInterviewResultData = {
    title: "Interview report",
    description: "Persisted assessment",
    gradingLabel: "Grading in progress",
    gradingScoreLabel: "Grading",
    gradingFailedLabel: "Grading stopped",
    gradingFailedScoreLabel: "No score available",
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
        expect(screen.queryByText("0/100")).not.toBeInTheDocument()
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

    it("renders persisted questions and explicit unanswered states inside the transcript dialog", () => {
        render(<CourseMockInterviewResultBlockBase
            state="ready"
            props={{
                ...props,
                score: 84,
                transcriptOpen: true,
                transcriptTitle: "Interview transcript",
                transcriptHint: "2 questions · Scroll inside this dialog to read the complete transcript.",
                interviewerLabel: "Interviewer",
                candidateLabel: "Your answer",
                unansweredLabel: "No answer recorded",
                reviews: [
                    { id: "q-1", title: "Question 1", question: "Explain your trade-off", answer: "I chose consistency", feedback: "Clear", scoreLabel: "80/100" },
                    { id: "q-2", title: "Question 2", question: "How would you recover?", answer: "", feedback: "Missing", scoreLabel: "0/100" },
                ],
            }}
        />)

        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Interview transcript" })).toBeInTheDocument()
        expect(screen.getByText("2 questions · Scroll inside this dialog to read the complete transcript.")).toBeInTheDocument()
        expect(screen.getByText("I chose consistency")).toBeInTheDocument()
        expect(screen.getByText("No answer recorded")).toBeInTheDocument()
    })
})
