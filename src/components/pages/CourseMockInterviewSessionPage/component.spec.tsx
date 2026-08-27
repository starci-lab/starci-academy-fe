/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseMockInterviewSessionBlockBase, type CourseMockInterviewSessionData } from "@/components/blocks/learn/CourseMockInterviewSessionBlock/component"

const props: CourseMockInterviewSessionData = {
    title: "Mock interview", promptTitle: "Distributed cache", stateLabel: "Connected", counterLabel: "2/5", progressLabel: "Interview progress", progress: 40,
    turns: [{ id: "turn-1", role: "interviewer", label: "Interviewer", content: "How would you invalidate stale entries?" }], interviewerPendingLabel: "Waiting", answerLabel: "Your response", answerPlaceholder: "Answer here", answer: "Use versioned keys", submitLabel: "Answer and continue", abortLabel: "Stop response", leaveLabel: "Leave interview", finishLabel: "Finish and grade", retryLabel: "Try again", workspaceLabel: "Question workspace", workspaceEmptyLabel: "No code is attached.", turnsLabel: "Completed turns", turnsEmptyLabel: "Completed answers will collect here.", syncStatusLabel: "Answers saved", revisionLabel: "v3", finishConfirmationOpen: false, finishConfirmationTitle: "Finish?", finishConfirmationDescription: "Saved", abandonConfirmationOpen: false, abandonConfirmationTitle: "Discard?", abandonConfirmationDescription: "Cannot resume", confirmLabel: "Confirm", abandonLabel: "Discard", cancelLabel: "Cancel",
}

describe("CourseMockInterviewSessionBlockBase", () => {
    it("renders the live room, restored turn and answer controls", () => {
        render(<CourseMockInterviewSessionBlockBase state="live" props={props} />)
        expect(screen.getByRole("main", { name: "Mock interview" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Distributed cache" })).toBeInTheDocument()
        expect(screen.getByText("How would you invalidate stale entries?")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Answer here")).toHaveValue("Use versioned keys")
    })

    it("emits answer and finish intents", () => {
        const answer = vi.fn(), finish = vi.fn()
        render(<CourseMockInterviewSessionBlockBase state="live" props={props} on={{ answer, finish }} />)
        fireEvent.change(screen.getByPlaceholderText("Answer here"), { target: { value: "New answer" } })
        fireEvent.click(screen.getByRole("button", { name: "Finish and grade" }))
        expect(answer).toHaveBeenCalledWith("New answer")
        expect(finish).toHaveBeenCalledOnce()
    })

    it("disables submission while connecting", () => {
        render(<CourseMockInterviewSessionBlockBase state="connecting" props={props} />)
        expect(screen.getByPlaceholderText("Answer here")).toBeDisabled()
        expect(screen.getByRole("button", { name: "Finish and grade" })).toBeDisabled()
    })

    it("offers retry instead of the room after a failure", () => {
        const retry = vi.fn()
        render(<CourseMockInterviewSessionBlockBase state="failed" props={{ ...props, notice: "Connection dropped" }} on={{ retry }} />)
        expect(screen.getByText("Connection dropped")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retry).toHaveBeenCalledOnce()
        expect(screen.queryByRole("main")).toBeNull()
    })

    it("shows streaming text and stop action", () => {
        const abort = vi.fn()
        render(<CourseMockInterviewSessionBlockBase state="syncing" props={{ ...props, operation: "streaming", streamingText: "Consider a write-through cache" }} on={{ abort }} />)
        expect(screen.getByText("Consider a write-through cache")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Stop response" }))
        expect(abort).toHaveBeenCalledOnce()
    })
})
