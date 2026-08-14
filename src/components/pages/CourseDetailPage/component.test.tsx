import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CourseDetailPage, type CourseDetailPageData } from "./component"

class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock)

const labels = {
    sectionTabsLabel: "Course sections",
    overviewTab: "Explore the course",
    curriculumTab: "Content",
    reviewsTab: "Learner outcomes",
    valuePropsTitle: "What you will learn",
    curriculumTitle: "Course content",
    prerequisitesTitle: "What you need first",
    reviewsTitle: "Learner reviews",
    reviewsEmpty: "No reviews yet",
    reviewCount: "12 reviews",
}

const props: CourseDetailPageData = {
    labels,
    selectedSection: "overview",
    title: "Fullstack Mastery",
    tagline: "One structured path into production engineering.",
    stats: [
        { id: "learners", label: "Learning alongside you", value: "13 learners", emphasis: "accent" },
        { id: "modules", label: "Curriculum depth", value: "23 modules", emphasis: "success" },
        { id: "hours", label: "Focused learning time", value: "33 hours", emphasis: "warning" },
        { id: "contents", label: "Knowledge library", value: "95 lessons", emphasis: "neutral" },
        { id: "challenges", label: "Learning by doing", value: "8 exercises", emphasis: "neutral" },
    ],
    valueProps: ["Build one connected engineering journey."],
    prerequisites: [{ id: "typescript", requirement: "TypeScript basics" }],
    modules: [{ id: "module", title: "Engineer mindset" }],
    averageScore: 4.8,
    reviewTotal: 12,
    reviews: [{ id: "review", author: "Learner", score: 5, body: "Practical and clear." }],
    rail: {
        title: "Fullstack Mastery",
        price: "1,250,000 ₫",
        ctaLabel: "Enrol now",
    },
}

describe("_CourseDetailPage", () => {
    it("renders direction C hierarchy and reports a real section selection", () => {
        const selectSection = vi.fn()
        render(<_CourseDetailPage state="ready" props={props} on={{ selectSection }} />)

        expect(screen.getByRole("tab", { name: "Explore the course" })).toBeInTheDocument()
        expect(screen.getByText("Learning alongside you")).toBeInTheDocument()
        expect(screen.getByText("13 learners")).toBeInTheDocument()
        expect(screen.getAllByText("4.8")).toHaveLength(2)
        expect(document.querySelectorAll("[data-component=\"SurfaceListCardSurface\"]")).toHaveLength(3)

        fireEvent.click(screen.getByRole("tab", { name: "Content" }))
        expect(selectSection).toHaveBeenCalledWith("curriculum")
    })

    it("keeps five signal cells while course data is pending", () => {
        render(<_CourseDetailPage state="pending" props={{ labels, selectedSection: "overview" }} />)
        expect(document.querySelectorAll("[data-node^=\"course-signal-card-\"]")).toHaveLength(5)
        expect(screen.getByRole("tab", { name: "Learner outcomes" })).toBeInTheDocument()
    })

    it("does not turn an unrated course into a zero-score verdict", () => {
        render(<_CourseDetailPage state="ready" props={{ ...props, averageScore: 0, reviewTotal: 0, reviews: [] }} />)
        expect(screen.queryByText("0.0")).toBeNull()
        expect(screen.getByText("No reviews yet")).toBeInTheDocument()
    })
})
