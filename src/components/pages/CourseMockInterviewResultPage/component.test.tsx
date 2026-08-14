import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { _CourseMockInterviewResultPage } from "./component"

describe("_CourseMockInterviewResultPage", () => {
    it("renders persisted rubric and question feedback", () => {
        const { container } = render(
            <_CourseMockInterviewResultPage
                state="ready"
                props={{
                    title: "Interview debrief",
                    description: "Persisted result",
                    gradingLabel: "Grading",
                    failedLabel: "Failed",
                    scoreLabel: "Overall score",
                    score: 82,
                    verdict: "pass",
                    promptTitle: "Distributed cache",
                    phaseTitle: "Score breakdown",
                    phases: [{ id: "requirements", label: "Requirements", score: 16, max: 20 }],
                    strengthsTitle: "Strengths",
                    strengths: ["Clear trade-offs"],
                    gapsTitle: "What to improve",
                    gaps: ["Quantify capacity"],
                    reviewsTitle: "Question review",
                    reviews: [{ id: "0", title: "Cache invalidation", answer: "Version keys", feedback: "Cover eviction too", scoreLabel: "80/100" }],
                    retryLabel: "Check again",
                    newSessionLabel: "Interview again",
                }}
            />,
        )

        expect(screen.getByText("82/100")).toBeTruthy()
        expect(screen.getByText("Clear trade-offs")).toBeTruthy()
        expect(screen.getByText("Cover eviction too")).toBeTruthy()
        expect(container.querySelector("[data-node=\"course-mock-interview-result-page\"]")).toBeTruthy()
    })
})
