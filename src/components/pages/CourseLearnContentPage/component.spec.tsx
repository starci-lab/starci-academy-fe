/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseLearnContentBlockBase, type CourseLearnContentBlockData } from "@/components/blocks/learn/CourseLearnContentBlock/component"

const labels = {
    navCourse: "Course", navModule: "Module", facesLabel: "Lesson faces", searchPlaceholder: "Search contents",
    searchLabel: "Search contents", searchClearLabel: "Clear search", resizeRail: "Resize course outline",
    outlineTitle: "On this page", pageLabel: "Page", previousLabel: "Previous", nextLabel: "Next",
    reactionsLabel: "Reactions", reactionPrompt: "Was this useful?", nextTitle: "Up next",
} as const

const content = (overrides: Partial<CourseLearnContentBlockData> = {}): CourseLearnContentBlockData => ({ labels, title: "Current lesson", body: "Lesson body", ...overrides })

describe("CourseLearnContentBlockBase", () => {
    it("renders the lesson as a labelled main region with heading and article body", () => {
        render(<CourseLearnContentBlockBase blockState="ready" props={content()} />)
        expect(screen.getByRole("main", { name: "Current lesson" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Current lesson" })).toBeInTheDocument()
        expect(screen.getByRole("article")).toHaveTextContent("Lesson body")
    })

    it("renders optional description as supporting copy", () => {
        render(<CourseLearnContentBlockBase blockState="ready" props={content({ description: "Why this lesson matters" })} />)
        expect(screen.getByText("Why this lesson matters")).toBeInTheDocument()
        expect(screen.getByRole("article")).toHaveTextContent("Lesson body")
    })

    it("shows a recovery action for a failed reader", () => {
        const act = vi.fn()
        render(<CourseLearnContentBlockBase blockState="failed" props={content({ noticeMessage: "Could not load lesson", noticeActionLabel: "Retry" })} on={{ act }} />)
        expect(screen.getByText("Could not load lesson")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(act).toHaveBeenCalledOnce()
        expect(screen.queryByRole("article")).toBeNull()
    })

    it("uses the same notice path for a locked lesson without a message", () => {
        const act = vi.fn()
        render(<CourseLearnContentBlockBase blockState="locked" props={content({ noticeActionLabel: "Enrol" })} on={{ act }} />)
        fireEvent.click(screen.getByRole("button", { name: "Enrol" }))
        expect(act).toHaveBeenCalledOnce()
        expect(screen.queryByRole("article")).toBeNull()
    })

    it("keeps the reader region and body shape while loading", () => {
        render(<CourseLearnContentBlockBase blockState="pending" props={content()} />)
        expect(screen.getByRole("main", { name: "Current lesson" })).toBeInTheDocument()
        expect(screen.getByRole("article")).toBeInTheDocument()
        expect(screen.queryByText("Lesson body")).toBeNull()
    })

    it("does not invent empty copy when title or body is absent", () => {
        render(<CourseLearnContentBlockBase blockState="ready" props={content({ title: undefined, body: undefined })} />)
        expect(screen.getByRole("main", { name: "" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "" })).toBeInTheDocument()
        expect(screen.getByRole("article")).not.toHaveTextContent(/\S/)
    })
})
