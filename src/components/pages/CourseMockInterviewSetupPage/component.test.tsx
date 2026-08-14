import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CourseMockInterviewSetupPage } from "./component"

const props = {
    title: "Mock interview",
    description: "Course-grounded practice",
    levelLabel: "Seniority",
    modeLabel: "Format",
    levels: [{ id: "middle", label: "Middle" }],
    modes: [{ id: "qna", label: "Technical Q&A" }],
    selectedLevel: "middle",
    selectedMode: "qna",
    startLabel: "Start interview",
    resumeLabel: "Resume interview",
    retryLabel: "Try again",
} as const

describe("_CourseMockInterviewSetupPage", () => {
    it("offers the persisted session instead of hiding it", () => {
        const resume = vi.fn()
        const { container } = render(<_CourseMockInterviewSetupPage state="resumable" props={{ ...props, status: "Session available" }} on={{ resume }} />)

        fireEvent.click(screen.getByText("Resume interview"))
        expect(resume).toHaveBeenCalledOnce()
        expect(screen.getByText("Session available")).toBeTruthy()
        expect(container.querySelector("[data-node=\"course-mock-interview-setup-page\"]")).toBeTruthy()
    })
})
