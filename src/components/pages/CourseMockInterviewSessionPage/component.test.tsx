import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CourseMockInterviewSessionPage, type CourseMockInterviewSessionData } from "./component"

const props: CourseMockInterviewSessionData = {
    title: "Mock interview",
    promptTitle: "Distributed cache",
    stateLabel: "Connected",
    counterLabel: "2/5",
    progressLabel: "Interview progress",
    progress: 40,
    remainingLabel: "24:30 remaining",
    turns: [{ id: "turn-1", role: "interviewer", label: "Interviewer", content: "How would you invalidate stale entries?" }],
    interviewerPendingLabel: "Waiting for interviewer",
    answerLabel: "Your response",
    answerPlaceholder: "Answer here",
    answer: "Use versioned keys",
    submitLabel: "Answer and continue",
    abortLabel: "Stop response",
    leaveLabel: "Leave interview",
    finishLabel: "Finish and grade",
    retryLabel: "Try again",
    workspaceLabel: "Question workspace",
}

describe("_CourseMockInterviewSessionPage", () => {
    it("emits answer and finish intents while keeping restored turns visible", () => {
        const answer = vi.fn()
        const finish = vi.fn()
        const { container } = render(<_CourseMockInterviewSessionPage state="live" props={props} on={{ answer, finish }} />)

        fireEvent.change(screen.getByPlaceholderText("Answer here"), { target: { value: "New answer" } })
        fireEvent.click(screen.getByText("Finish and grade"))

        expect(answer).toHaveBeenCalledWith("New answer")
        expect(finish).toHaveBeenCalledOnce()
        expect(screen.getByText("How would you invalidate stale entries?")).toBeTruthy()
        expect(container.querySelector("[data-node=\"course-mock-interview-session-page\"]")).toBeTruthy()
    })
})
