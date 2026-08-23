import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/components/blocks/learn/CourseContentMap", () => ({ CourseContentMap: () => null }))
import { CourseLearnContentHomeBlockBase } from "@/components/blocks/learn/CourseLearnContentHomeBlock/component"

const props = {
    title: "System Design Mastery",
    description: "Design scalable systems through production trade-offs.",
    breadcrumbLabel: "Course content path",
    trail: [
        { id: "course", label: "Course" },
        { id: "current", label: "System Design Mastery" },
    ],
    metaFacts: ["4 modules", "12 study hours", "320 learners"],
    gateMessages: ["Preview mode"],
    resumeEyebrow: "Continue learning",
    resumeTarget: "Consistent hashing",
    resumeAction: "Continue",
    progressLabel: "Course content progress",
    completionPercent: 40,
    progressFact: "2/5 lessons read · 1/3 challenges completed",
    currentModule: {
        title: "Current module · Foundations",
        lessons: [{
            id: "lesson-1",
            moduleId: "module-1",
            title: "Consistent hashing",
            fact: "12 min · Unread",
            isCurrent: true,
        }],
    },
    emptyMessage: "No lessons",
    failedMessage: "Could not load",
    retryLabel: "Try again",
} as const

describe("CourseLearnContentHomeBlockBase", () => {
    it("draws the complete identity, continuation and current-module hierarchy", () => {
        const lesson = vi.fn()
        const { container } = render(<CourseLearnContentHomeBlockBase blockState="ready" props={props} on={{ lesson }} />)

        expect(screen.getByRole("heading", { level: 1, name: "System Design Mastery" })).toBeVisible()
        expect(screen.getByText("Design scalable systems through production trade-offs.")).toBeVisible()
        expect(screen.getByText("4 modules · 12 study hours · 320 learners")).toBeVisible()
        expect(container.querySelectorAll("[data-component=Badge]")).toHaveLength(0)
        const identity = container.querySelector("[data-node=course-content-identity-stack]")
        expect(identity).toHaveClass("gap-2")
        expect(identity?.querySelector("[data-node=status-metadata-line]")).not.toBeNull()
        expect(container.querySelector("[data-component=SurfaceCardSurface] [data-node=course-content-lesson-list]")).not.toBeNull()
        expect(screen.getByText("Preview mode")).toBeVisible()
        expect(screen.getByRole("heading", { level: 2, name: "Consistent hashing" })).toBeVisible()
        expect(screen.getByRole("heading", { level: 3, name: "Current module · Foundations" })).toBeVisible()

        fireEvent.click(screen.getByRole("link", { name: "Consistent hashing" }))
        expect(lesson).toHaveBeenCalledWith("module-1", "lesson-1")
    })

    it("retains course identity and offers recovery when the outline fails", () => {
        const retry = vi.fn()
        render(<CourseLearnContentHomeBlockBase blockState="failed" props={props} on={{ retry }} />)

        expect(screen.getByRole("heading", { level: 1, name: "System Design Mastery" })).toBeVisible()
        expect(screen.getByText("Could not load")).toBeVisible()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retry).toHaveBeenCalledOnce()
    })
})
