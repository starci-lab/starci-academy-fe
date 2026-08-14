import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CourseLearnTodayPage, type CourseLearnTodayData } from "./component"

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
    emptyMessage: "No course",
    failedMessage: "Could not load",
    retryLabel: "Retry",
}

describe("_CourseLearnTodayPage", () => {
    it("draws ranked work only in the Today composition and reports its identity", () => {
        const open = vi.fn()
        render(<_CourseLearnTodayPage state="ready" mobileView="today" props={props} on={{ open }} />)

        expect(screen.getByText("Resume lesson")).toBeTruthy()
        expect(screen.getByText("Three cards due")).toBeTruthy()
        expect(screen.queryByText("42% complete")).toBeNull()
        fireEvent.click(screen.getByRole("link", { name: "Continue" }))
        expect(open).toHaveBeenCalledWith("lesson")
    })

    it("switches to course without keeping Today cards visible", () => {
        render(<_CourseLearnTodayPage state="ready" mobileView="course" props={props} />)

        expect(screen.getByText("Course modules")).toBeTruthy()
        expect(screen.queryByText("Resume lesson")).toBeNull()
        expect(screen.queryByText("Three cards due")).toBeNull()
    })

    it("switches to the progress composition", () => {
        render(<_CourseLearnTodayPage state="ready" mobileView="progress" props={props} />)

        expect(screen.getByText("42% complete")).toBeTruthy()
        expect(screen.queryByText("Resume lesson")).toBeNull()
    })

    it("offers recovery only for a failed answer", () => {
        const retry = vi.fn()
        render(<_CourseLearnTodayPage state="failed" mobileView="today" props={props} on={{ retry }} />)

        fireEvent.click(screen.getByText("Retry"))
        expect(retry).toHaveBeenCalledOnce()
    })
})
