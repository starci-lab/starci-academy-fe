import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
    CourseMockInterviewSetupBlockBase as CourseMockInterviewSetupPageBase,
    type CourseMockInterviewSetupData,
    type CourseMockInterviewSetupBlockProps,
} from "@/components/blocks/learn/CourseMockInterviewSetupBlock/component"

/**
 * What these tests guard: the green room is the last place a learner can still change their mind,
 * so each choice has to say which one is currently theirs, a start already running must not be
 * pressable a second time, and a failure has to replace the start with the only action that can
 * clear it - a start offered over a failed load starts nothing.
 */

const copy: CourseMockInterviewSetupData = {
    title: "Mock interview",
    description: "Course-grounded practice",
    heroEyebrow: "Guided mission",
    heroActionLabel: "Prepare a session",
    mediaAlt: "Learner practising an interview",
    heroFacts: [
        { label: "Formats", value: "2" },
        { label: "Levels", value: "3" },
        { label: "Duration", value: "Up to 60 minutes" },
    ],
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
    accessMessage: "Course access is required",
    accessLabel: "View course access",
    selectedTab: "begin",
    tabsLabel: "Mock interview setup",
    tabs: [
        { id: "begin", label: "Begin" },
        { id: "history", label: "History" },
        { id: "stats", label: "Statistics" },
    ],
    beginTitle: "Interview room",
    briefingEyebrow: "Course-grounded interview",
    briefingTitle: "Get ready for a focused interview",
    setupTitle: "Session setup",
    setupDescription: "Choose two settings",
    serverNote: "Questions are generated after you begin.",
    savedNote: "The session is saved.",
    historyTitle: "Interview history",
    statsTitle: "Interview statistics",
    historyEmpty: "No completed interviews yet",
    statsEmpty: "No statistics yet",
    historyFailed: "History failed",
    statsFailed: "Statistics failed",
    historyState: "empty",
    statsState: "empty",
    historyRows: [],
    statsRows: [],
    historyCountLabel: "0 completed",
    recentHistoryTitle: "Recent interviews",
    progressTitle: "Practice progress",
    viewHistoryLabel: "View all history",
    viewStatsLabel: "View statistics",
    historyActionLabel: "View result",
    newSessionEyebrow: "New practice session",
    newSessionLabel: "Practise a new interview",
    preflightTitle: "Review before starting",
    returnToBegin: "Prepare an interview",
    resumeTitle: "Latest session",
    readinessLabels: ["Readiness", "Format", "Focus"],
    focus: "System design",
}

const draw = (
    state: CourseMockInterviewSetupBlockProps["state"],
    props: Partial<CourseMockInterviewSetupData> = {},
    on?: CourseMockInterviewSetupBlockProps["on"],
) => render(<CourseMockInterviewSetupPageBase state={state} props={{ ...copy, ...props }} on={on} />)

describe("CourseMockInterviewSetupPageBase", () => {
    it("assigns every destination to its approved surface owner", () => {
        const begin = draw("ready")
        expect(screen.getByRole("heading", { name: "Session setup" })).toBeInTheDocument()
        begin.unmount()

        const history = draw("history", { historyState: "ready", historyRows: [{ id: "one", title: "Attempt", fact: "82/100" }] })
        expect(screen.getByRole("heading", { name: "Interview history" })).toBeInTheDocument()
        expect(screen.getByText("Interview history")).toBeInTheDocument()
        history.unmount()

        draw("stats", { statsState: "ready", statsRows: [{ id: "qna", title: "Q&A", percent: 82, percentText: "82/100" }] })
        expect(screen.getByRole("heading", { name: "Interview statistics" })).toBeInTheDocument()
        expect(screen.getByText("Interview statistics")).toBeInTheDocument()
    })

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
        draw("pending", {}, { start })

        expect(screen.getByRole("button", { name: "Start interview" })).toBeDisabled()
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

    it("moves focus to the inline setup from the hero action", () => {
        const prepare = vi.fn()
        draw("ready", {}, { prepare })

        fireEvent.click(screen.getByRole("button", { name: "Prepare a session" }))
        expect(prepare).toHaveBeenCalledOnce()
        expect(screen.getByRole("heading", { name: "Session setup" })).toBeInTheDocument()
    })

    it("offers the persisted session beside a fresh start and resumes it on request", () => {
        const resume = vi.fn()
        draw("resumable", { status: "A session is already open" }, { resume })

        expect(screen.getByRole("heading", { name: "Latest session" })).toBeInTheDocument()
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

    it("replaces protected setup controls with a course-access explanation when locked", () => {
        const access = vi.fn()
        draw("locked", { selectedTab: "stats", statsState: "ready", statsRows: [{ id: "qna", title: "Q&A", percent: 82, percentText: "82/100" }] }, { access })

        expect(screen.queryByRole("button", { name: "Start interview" })).not.toBeInTheDocument()
        expect(screen.queryByRole("tab", { name: "History" })).not.toBeInTheDocument()
        expect(screen.queryByRole("heading", { name: "Interview statistics" })).not.toBeInTheDocument()
        expect(screen.getByText("Course access is required")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "View course access" }))
        expect(access).toHaveBeenCalledTimes(1)
    })

    it("opens the result owned by one completed interview row", () => {
        const openHistory = vi.fn()
        draw("history", { historyState: "ready", historyRows: [{ id: "session-one", title: "Attempt", fact: "82/100" }] }, { openHistory })

        fireEvent.click(screen.getByRole("button", { name: "View result" }))
        expect(openHistory).toHaveBeenCalledWith("session-one")
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

    it("keeps an unresolved active session inert when the owner registered no resume handler", () => {
        draw("resumable")

        expect(screen.queryByRole("tab", { name: "Junior" })).not.toBeInTheDocument()
        expect(screen.queryByRole("tab", { name: "System design" })).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Start interview" })).not.toBeInTheDocument()
        expect(() => fireEvent.click(screen.getByRole("button", { name: "Resume interview" }))).not.toThrow()
    })

    it("stays inert rather than throwing when the failed green room was given no retry handler", () => {
        draw("failed")

        expect(() => fireEvent.click(screen.getByRole("button", { name: "Try again" }))).not.toThrow()
    })
})
