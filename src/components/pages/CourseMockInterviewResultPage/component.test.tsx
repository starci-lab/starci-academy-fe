import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
    CourseMockInterviewResultPageBase,
    type CourseMockInterviewResultData,
    type CourseMockInterviewResultPageProps,
} from "./component"

/**
 * What these tests guard: a debrief the reader can trust the arithmetic of. Every rubric row is
 * measured against its OWN maximum, a grade the backend never sent has to read as zero rather than
 * as nothing, and the two states that are not a finished result - still grading, and failed - have
 * to say which one happened while keeping the retry a finished result must never offer.
 */

const copy: CourseMockInterviewResultData = {
    title: "Interview debrief",
    description: "Persisted result",
    gradingLabel: "Grading your answers",
    failedLabel: "The debrief could not be read",
    scoreLabel: "Overall score",
    score: 82,
    verdict: "Hire",
    promptTitle: "Distributed cache",
    phaseTitle: "Score breakdown",
    phases: [
        { id: "requirements", label: "Requirements", score: 16, max: 20 },
        { id: "trade-offs", label: "Trade-offs", score: 9, max: 10 },
    ],
    strengthsTitle: "Strengths",
    strengths: ["Clear trade-offs"],
    gapsTitle: "What to improve",
    gaps: ["Quantify capacity"],
    reviewsTitle: "Question review",
    reviews: [
        {
            id: "0",
            title: "Cache invalidation",
            answer: "Version keys",
            feedback: "Cover eviction too",
            scoreLabel: "80/100",
        },
    ],
    retryLabel: "Check again",
    newSessionLabel: "Interview again",
}

const draw = (
    state: CourseMockInterviewResultPageProps["state"],
    props: Partial<CourseMockInterviewResultData> = {},
    on?: CourseMockInterviewResultPageProps["on"],
) => render(<CourseMockInterviewResultPageBase state={state} props={{ ...copy, ...props }} on={on} />)

describe("CourseMockInterviewResultPageBase", () => {
    it("reports the graded outcome, the rubric behind it and the evidence behind the rubric", () => {
        const { container } = draw("ready")

        expect(container.querySelector("[data-node=\"course-mock-interview-result-page\"]")).not.toBeNull()
        expect(screen.getByText("82/100")).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Hire" })).toBeInTheDocument()
        expect(screen.getByText("Distributed cache")).toBeInTheDocument()
        expect(screen.getByText("Clear trade-offs")).toBeInTheDocument()
        expect(screen.getByText("Quantify capacity")).toBeInTheDocument()
        expect(screen.getByText("Cache invalidation: Version keys")).toBeInTheDocument()
        expect(screen.getByText("Cover eviction too")).toBeInTheDocument()
    })

    it("measures each rubric row against its own maximum rather than a shared one", () => {
        draw("ready")

        expect(screen.getByRole("progressbar", { name: "Requirements" })).toHaveAttribute("aria-valuenow", "80")
        expect(screen.getByRole("progressbar", { name: "Trade-offs" })).toHaveAttribute("aria-valuenow", "90")
    })

    it("reads a rubric row worth no points as empty instead of dividing by its missing maximum", () => {
        draw("ready", { phases: [{ id: "communication", label: "Communication", score: 0, max: 0 }] })

        expect(screen.getByRole("progressbar", { name: "Communication" })).toHaveAttribute("aria-valuenow", "0")
        expect(screen.getByText("0/0")).toBeInTheDocument()
    })

    // NOTE: this pins CURRENT behaviour, which is suspected defective and is reported separately.
    // `CourseDetailPage` deliberately refuses the analogous case - it carries an `unrated` state so
    // an unreviewed course never reads as 0.0 - whereas a `ready` debrief with no grade reads here
    // as a scored zero. The assertion records what ships today; it does not endorse it.
    it("reads a debrief that arrived without a grade as zero out of a hundred", () => {
        draw("ready", { score: undefined })

        expect(screen.getByText("0/100")).toBeInTheDocument()
    })

    it("drops the question-review section when the attempt produced no per-question evidence", () => {
        draw("ready", { reviews: [] })

        expect(screen.queryByText("Question review")).not.toBeInTheDocument()
        expect(screen.getByText("Score breakdown")).toBeInTheDocument()
    })

    it("rests the debrief and shows a running bar while the answers are still being graded", () => {
        const { container } = draw("grading")

        expect(container.querySelector("[data-component=Heading][data-loading=\"true\"]")).not.toBeNull()
        expect(container.querySelector("[data-component=Progress][data-loading=\"true\"]")).not.toBeNull()
        expect(screen.queryByText("82/100")).not.toBeInTheDocument()
        expect(screen.queryByText("Persisted result")).not.toBeInTheDocument()
    })

    it.each([
        ["grading", "Grading your answers"],
        ["failed", "The debrief could not be read"],
    ] as const)("tells a reader on the %s state what happened instead of drawing an empty debrief", (state, message) => {
        draw(state)

        expect(screen.getByText(message)).toBeInTheDocument()
        expect(screen.queryByText("Score breakdown")).not.toBeInTheDocument()
        expect(screen.queryByText("Clear trade-offs")).not.toBeInTheDocument()
    })

    it("withdraws the retry once the debrief is a finished result there is nothing to refetch for", () => {
        draw("ready", {}, { retry: vi.fn(), newSession: vi.fn() })

        expect(screen.queryByRole("button", { name: "Check again" })).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Interview again" })).toBeInTheDocument()
    })

    it("recovers a failed debrief from the notice's own way out", () => {
        const retry = vi.fn()
        const { container } = draw("failed", {}, { retry })
        const notice = container.querySelector("[data-node=\"empty-notice-stack\"]")

        expect(notice).not.toBeNull()
        fireEvent.click(within(notice as HTMLElement).getByRole("button", { name: "Check again" }))
        expect(retry).toHaveBeenCalledTimes(1)
    })

    it("keeps a second retry in the action row so a reader who scrolled past the notice still has one", () => {
        const retry = vi.fn()
        draw("grading", {}, { retry })

        fireEvent.click(screen.getByRole("button", { name: "Check again" }))
        expect(retry).toHaveBeenCalledTimes(1)
    })

    it("starts a fresh interview from a state that never produced a result at all", () => {
        const newSession = vi.fn()
        draw("failed", {}, { newSession })

        fireEvent.click(screen.getByRole("button", { name: "Interview again" }))
        expect(newSession).toHaveBeenCalledTimes(1)
    })

    it("stays inert rather than throwing when the owner registered no handlers", () => {
        draw("failed")

        expect(() => {
            screen.getAllByRole("button", { name: "Check again" }).forEach((control) => fireEvent.click(control))
            fireEvent.click(screen.getByRole("button", { name: "Interview again" }))
        }).not.toThrow()
    })
})
