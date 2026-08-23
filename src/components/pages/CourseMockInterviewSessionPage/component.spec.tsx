import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseMockInterviewSessionBlockBase as CourseMockInterviewSessionPageBase, type CourseMockInterviewSessionData } from "@/components/blocks/learn/CourseMockInterviewSessionBlock/component"

/**
 * What these tests guard.
 *
 * The room is one live conversation with a fixed set of controls. Which controls exist is decided
 * by the runtime situation rather than by the caller: a failed room retries instead of answering, a
 * streaming answer can be stopped, and a room that is still connecting or syncing refuses both the
 * answer box and the finish action rather than accepting input it cannot send.
 */

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
    workspaceEmptyLabel: "No code is attached.",
    turnsLabel: "Completed turns",
    turnsEmptyLabel: "Completed answers will collect here.",
}

describe("CourseMockInterviewSessionPageBase", () => {
    it("emits answer and finish intents while keeping restored turns visible", () => {
        const answer = vi.fn()
        const finish = vi.fn()
        const { container } = render(<CourseMockInterviewSessionPageBase state="live" props={props} on={{ answer, finish }} />)

        fireEvent.change(screen.getByPlaceholderText("Answer here"), { target: { value: "New answer" } })
        fireEvent.click(screen.getByText("Finish and grade"))

        expect(answer).toHaveBeenCalledWith("New answer")
        expect(finish).toHaveBeenCalledOnce()
        expect(screen.getByText("How would you invalidate stale entries?")).toBeTruthy()
        expect(container.querySelector("[data-node=\"mock-interview-session-content\"]")).toBeTruthy()
        expect(screen.getByText("24:30 remaining")).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Interviewer" })).toBeInTheDocument()
    })

    it("refuses the answer box and the finish action while the room is still connecting", () => {
        const { container } = render(<CourseMockInterviewSessionPageBase state="connecting" props={props} on={{ ask: vi.fn() }} />)

        expect(screen.getByPlaceholderText("Answer here")).toBeDisabled()
        expect(screen.getByRole("button", { name: /Answer and continue/ })).toHaveAttribute("data-action-pending", "true")
        expect(screen.getByRole("button", { name: /Finish and grade/ })).toBeDisabled()
        expect(screen.queryByText("Connected")).not.toBeInTheDocument()
        expect(container.querySelector("[data-component=\"Heading\"][data-level=\"1\"]")).toHaveAttribute("data-loading", "true")
    })

    it("states the live connection once the room is answering", () => {
        render(<CourseMockInterviewSessionPageBase state="live" props={props} />)

        expect(screen.getByText("Connected")).toHaveAttribute("aria-live", "polite")
        expect(screen.getByRole("heading", { name: "Distributed cache" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /Finish and grade/ })).toBeEnabled()
    })

    it("clears the uncontrolled answer well when one completed turn is committed", () => {
        const view = render(<CourseMockInterviewSessionPageBase state="live" props={props} />)

        expect(screen.getByPlaceholderText("Answer here")).toHaveValue("Use versioned keys")
        view.rerender(
            <CourseMockInterviewSessionPageBase
                state="live"
                props={{
                    ...props,
                    answer: "",
                    turns: [
                        ...props.turns,
                        { id: "turn-2", role: "candidate", label: "Your answer", content: "Use versioned keys" },
                    ],
                }}
            />,
        )

        expect(screen.getByPlaceholderText("Answer here")).toHaveValue("")
    })

    it("swaps answering for retrying once the transport failed, and says so assertively", () => {
        const retry = vi.fn()
        const { container } = render(
            <CourseMockInterviewSessionPageBase
                state="failed"
                props={{ ...props, notice: "The interview connection dropped." }}
                on={{ retry }}
            />,
        )

        expect(screen.queryByRole("button", { name: /Answer and continue/ })).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: /Try again/ }))
        expect(retry).toHaveBeenCalledOnce()
        const notice = screen.getByText("The interview connection dropped.")
        expect(notice).toHaveAttribute("aria-live", "assertive")
        expect(container.querySelector("[data-component=\"Text\"][data-tone=\"accent\"]")).not.toBeNull()
    })

    it("keeps an expired room readable without raising the announcement", () => {
        const { container } = render(<CourseMockInterviewSessionPageBase state="expired" props={{ ...props, notice: "Time is up." }} />)

        expect(screen.getByText("Time is up.")).toHaveAttribute("aria-live", "polite")
        expect(container.querySelector("[data-component=\"Text\"][data-tone=\"accent\"]")).not.toBeNull()
        expect(screen.getByPlaceholderText("Answer here")).toBeDisabled()
    })

    it("offers a stop control and the streaming turn only while an answer is arriving", () => {
        const abort = vi.fn()
        const leave = vi.fn()
        const { container } = render(
            <CourseMockInterviewSessionPageBase
                state="syncing"
                props={{
                    ...props,
                    operation: "streaming",
                    remainingLabel: undefined,
                    streamingText: "Consider a write-through cache",
                    workspaceCode: "const cache = new Map()",
                }}
                on={{ abort, leave }}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: /Stop response/ }))
        expect(abort).toHaveBeenCalledOnce()
        fireEvent.click(screen.getByRole("button", { name: /Leave interview/ }))
        expect(leave).toHaveBeenCalledOnce()
        expect(screen.getByText("Consider a write-through cache")).toHaveAttribute("aria-live", "polite")
        expect(screen.queryByText("24:30 remaining")).not.toBeInTheDocument()
        expect(container.querySelector("[data-component=\"SurfaceFormCard\"]")).not.toBeNull()
        expect(container.querySelector("[data-component=\"SurfaceListCard\"]")).not.toBeNull()
        expect(screen.getByText(/const cache = new Map\(\)/)).toBeInTheDocument()
    })

    it("renders an honest empty workspace and completed-turn history without inventing code", () => {
        render(
            <CourseMockInterviewSessionPageBase
                state="live"
                props={{ ...props, turns: [], workspaceCode: undefined }}
            />,
        )

        expect(screen.getByText("No code is attached.")).toBeInTheDocument()
        expect(screen.getByText("Completed answers will collect here.")).toBeInTheDocument()
        expect(screen.queryByText(/const /)).not.toBeInTheDocument()
    })

    it.each([
        ["syncing", "Saving the transcript"],
        ["grading", "Grading the interview"],
    ] as const)("keeps submission disabled while %s", (operation, stateLabel) => {
        render(
            <CourseMockInterviewSessionPageBase
                state="syncing"
                props={{ ...props, operation, stateLabel }}
            />,
        )

        expect(screen.getByPlaceholderText("Answer here")).toBeDisabled()
        expect(screen.getByRole("button", { name: /Answer and continue/ })).toBeDisabled()
        expect(screen.getByText(stateLabel)).toHaveAttribute("aria-live", "polite")
    })
})
