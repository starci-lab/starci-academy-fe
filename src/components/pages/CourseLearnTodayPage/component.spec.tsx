import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseLearnTodayBlockBase as RawCourseLearnTodayPageBase, type CourseLearnTodayData } from "@/components/blocks/learn/CourseLearnTodayBlock/component"
type TestTodayProps = { readonly state: string; readonly mobileView: "today" | "course" | "progress"; readonly props: Record<string, unknown>; readonly on?: Record<string, (...args: Array<never>) => void> }
const CourseLearnTodayPageBase = ({ state, mobileView, props, on }: TestTodayProps) => <RawCourseLearnTodayPageBase blockState={state as never} mobileView={mobileView} props={props as never} on={on} />

const props: CourseLearnTodayData = {
    title: "Today",
    subtitle: "Next steps",
    primaryLabel: "Continue",
    secondaryLabel: "Also today",
    courseLabel: "Course",
    progressLabel: "Progress",
    progressFact: "42% complete",
    progressValue: 42,
    primary: { id: "lesson", title: "Resume lesson", kind: "Lesson", actionLabel: "Continue" },
    secondary: [{ id: "cards", title: "Three cards due", kind: "Flashcards", actionLabel: "Review" }],
    course: { id: "modules", title: "Course modules", kind: "Course", actionLabel: "Open" },
    dashboard: {
        progress: {
            state: "ready",
            props: {
                label: "Your progress",
                completionLabel: "Course progress",
                completionFact: "42% complete",
                completionValue: 42,
                continuityLabel: "Study continuity",
                continuityFact: "6 days",
                standingLabel: "Course standing",
                standingFact: "Rank #18",
            },
        },
        nextActions: {
            state: "ready",
            props: {
                label: "Next actions",
                actions: [{ id: "dashboard-next", title: "Dashboard next", kind: "Lesson", actionLabel: "Continue" }],
            },
        },
        signals: {
            state: "ready",
            props: {
                label: "Learning signals",
                signals: [{ id: "review", label: "Due review", fact: "3 cards", actionLabel: "View", isSelected: true }],
            },
        },
        signalDetail: {
            state: "ready",
            props: {
                label: "Signal detail",
                title: "Due review",
                fact: "3 cards",
                caption: "Three cards are ready.",
                actionLabel: "Open details",
            },
        },
    },
    emptyMessage: "No course",
    failedMessage: "Could not load",
    retryLabel: "Retry",
}

describe("CourseLearnTodayPageBase", () => {
    it("draws ranked work only in the Today composition and reports its identity", () => {
        const open = vi.fn()
        render(<CourseLearnTodayPageBase state="ready" mobileView="today" props={props} on={{ open }} />)

        expect(screen.getByText("Resume lesson")).toBeTruthy()
        expect(screen.getByText("Three cards due")).toBeTruthy()
        expect(screen.getByText("42% complete")).toBeTruthy()
        const resume = screen.getByText("Resume lesson").closest("[data-node=resume-item-card]")?.querySelector("[role=link]")
        expect(resume).not.toBeNull()
        fireEvent.click(resume!)
        expect(open).toHaveBeenCalledWith("lesson")
    })

    it("switches to course without keeping Today cards visible", () => {
        render(<CourseLearnTodayPageBase state="ready" mobileView="course" props={props} />)

        expect(screen.getByText("Course modules")).toBeTruthy()
        expect(screen.queryByText("Resume lesson")).toBeNull()
        expect(screen.queryByText("Three cards due")).toBeNull()
    })

    it("switches to the progress composition", () => {
        render(<CourseLearnTodayPageBase state="ready" mobileView="progress" props={props} />)

        expect(screen.getAllByText("42% complete").length).toBeGreaterThan(0)
        expect(screen.queryByText("Resume lesson")).toBeNull()
    })

    it("offers recovery only for a failed answer", () => {
        const retry = vi.fn()
        render(<CourseLearnTodayPageBase state="failed" mobileView="today" props={props} on={{ retry }} />)

        fireEvent.click(screen.getByText("Retry"))
        expect(retry).toHaveBeenCalledOnce()
    })
})
