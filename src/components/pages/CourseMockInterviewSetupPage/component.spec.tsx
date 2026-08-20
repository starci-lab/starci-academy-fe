import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
    CourseMockInterviewSetupPageBase,
    type CourseMockInterviewSetupData,
    type CourseMockInterviewSetupPageProps,
} from "./component"

/**
 * What these tests guard: the green room is the last place a learner can still change their mind,
 * so each choice has to say which one is currently theirs, a start already running must not be
 * pressable a second time, and a failure has to replace the start with the only action that can
 * clear it - a start offered over a failed load starts nothing.
 */

const copy: CourseMockInterviewSetupData = {
    title: "Mock interview",
    description: "Course-grounded practice",
    levelLabel: "Seniority",
    modeLabel: "Format",
    levels: [
        { id: "junior", label: "Junior" },
        { id: "middle", label: "Middle" },
    ],
    modes: [
        { id: "qna", label: "Technical Q&A" },
        { id: "system-design", label: "System design" },
    ],
    selectedLevel: "middle",
    selectedMode: "qna",
    startLabel: "Start interview",
    resumeLabel: "Resume interview",
    retryLabel: "Try again",
    selectedTab: "begin",
    tabsLabel: "Mock interview setup",
    tabs: [
        { id: "begin", label: "Begin" },
        { id: "history", label: "History" },
        { id: "stats", label: "Statistics" },
    ],
    beginTitle: "Interview room",
    historyEmpty: "No completed interviews yet",
    statsEmpty: "No statistics yet",
    historyFailed: "History failed",
    statsFailed: "Statistics failed",
    historyState: "empty",
    statsState: "empty",
    historyRows: [],
    statsRows: [],
    returnToBegin: "Prepare an interview",
    resumeTitle: "Latest session",
    readinessLabels: ["Readiness", "Format", "Focus"],
    focus: "System design",
}

const draw = (
    state: CourseMockInterviewSetupPageProps["state"],
    props: Partial<CourseMockInterviewSetupData> = {},
    on?: CourseMockInterviewSetupPageProps["on"],
) => render(<CourseMockInterviewSetupPageBase state={state} props={{ ...copy, ...props }} on={on} />)

describe("CourseMockInterviewSetupPageBase", () => {
    it("fills the seniority and format the learner is currently on and leaves the alternatives open", () => {
        draw("ready")

        expect(screen.getByRole("tab", { name: "Middle" })).toHaveAttribute("aria-selected", "true")
        expect(screen.getByRole("tab", { name: "Junior" })).toHaveAttribute("aria-selected", "false")
        expect(screen.getByRole("tab", { name: "Technical Q&A" })).toHaveAttribute("aria-selected", "true")
        expect(screen.getByRole("tab", { name: "System design" })).toHaveAttribute("aria-selected", "false")
    })

    it.each([
        ["Junior", "level", "junior"],
        ["System design", "mode", "system-design"],
    ] as const)("reports the %s press as a change to the interview's %s", (label, field, value) => {
        const configure = vi.fn()
        draw("ready", {}, { configure })

        fireEvent.click(screen.getByRole("tab", { name: label }))
        expect(configure).toHaveBeenCalledWith(field, value)
    })

    it("rests the green room and refuses a start before the configuration has arrived", () => {
        const start = vi.fn()
        const { container } = draw("pending", {}, { start })

        expect(container.querySelector("[data-component=Heading][data-loading=\"true\"]")).not.toBeNull()
        expect(screen.getByRole("button", { name: "Start interview" })).toBeDisabled()
        fireEvent.click(screen.getByRole("button", { name: "Start interview" }))
        expect(start).not.toHaveBeenCalled()
    })

    it("shows the start running and blocks a second press while the session is being created", () => {
        const start = vi.fn()
        draw("starting", {}, { start })
        const control = screen.getByRole("button", { name: "Start interview" })

        expect(control).toHaveAttribute("data-action-pending", "true")
        fireEvent.click(control)
        expect(start).not.toHaveBeenCalled()
    })

    it("starts the interview the learner configured when they take the main action", () => {
        const start = vi.fn()
        draw("ready", {}, { start })

        fireEvent.click(screen.getByRole("button", { name: "Start interview" }))
        expect(start).toHaveBeenCalledTimes(1)
    })

    it("offers the persisted session beside a fresh start and resumes it on request", () => {
        const resume = vi.fn()
        draw("resumable", { status: "A session is already open" }, { resume })

        expect(screen.getByText("A session is already open")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Resume interview" }))
        expect(resume).toHaveBeenCalledTimes(1)
    })

    it("keeps the resume action out of every state that has no session to resume", () => {
        draw("ready")

        expect(screen.queryByRole("button", { name: "Resume interview" })).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Start interview" })).toBeInTheDocument()
    })

    it("replaces the start with the only action that can clear a failed green room", () => {
        const retry = vi.fn()
        draw("failed", {}, { retry })

        expect(screen.queryByRole("button", { name: "Start interview" })).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retry).toHaveBeenCalledTimes(1)
    })

    it.each(["failed", "resumable"] as const)("keeps the resolved status visible in the %s state", (state) => {
        draw(state, { status: "A session is already open" })
        expect(screen.getByText("A session is already open")).toBeInTheDocument()
    })

    it("carries no status line at all when the owner resolved none for this green room", () => {
        draw("ready")

        expect(screen.queryByRole("status")).not.toBeInTheDocument()
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    it("ignores a seniority or format press when the owner wired no configure handler", () => {
        const start = vi.fn()
        draw("ready", {}, { start })

        expect(() => {
            fireEvent.click(screen.getByRole("tab", { name: "Junior" }))
            fireEvent.click(screen.getByRole("tab", { name: "System design" }))
        }).not.toThrow()
        expect(start).not.toHaveBeenCalled()
    })

    it("stays inert rather than throwing when the owner registered no handlers", () => {
        draw("resumable")

        expect(() => {
            fireEvent.click(screen.getByRole("tab", { name: "Junior" }))
            fireEvent.click(screen.getByRole("tab", { name: "System design" }))
            fireEvent.click(screen.getByRole("button", { name: "Start interview" }))
            fireEvent.click(screen.getByRole("button", { name: "Resume interview" }))
        }).not.toThrow()
    })

    it("stays inert rather than throwing when the failed green room was given no retry handler", () => {
        draw("failed")

        expect(() => fireEvent.click(screen.getByRole("button", { name: "Try again" }))).not.toThrow()
    })
})
