import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CourseDetailPage, type CourseDetailPageData } from "./component"

class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock)

const labels = {
    breadcrumbLabel: "Course path",
    breadcrumbHome: "Home",
    breadcrumbCourses: "Courses",
    sectionTabsLabel: "Course sections",
    overviewTab: "Explore the course",
    curriculumTab: "Content",
    reviewsTab: "Learner outcomes",
    faqTab: "FAQ",
    valuePropsTitle: "What you will learn",
    curriculumTitle: "Course content",
    prerequisitesTitle: "What you need first",
    reviewsTitle: "Learner reviews",
    reviewsEmpty: "No reviews yet",
    faqTitle: "Frequently asked questions",
    faqEmpty: "No FAQs yet",
    reviewCount: "12 reviews",
}

const props: CourseDetailPageData = {
    labels,
    selectedSection: "overview",
    title: "Fullstack Mastery",
    tagline: "One structured path into production engineering.",
    stats: [
        { id: "learners", label: "Learning alongside you", value: "13 learners" },
        { id: "modules", label: "Curriculum depth", value: "23 modules" },
        { id: "hours", label: "Focused learning time", value: "33 hours" },
        { id: "contents", label: "Knowledge library", value: "95 lessons" },
        { id: "challenges", label: "Learning by doing", value: "8 exercises" },
        { id: "rating", label: "12 reviews", value: "4.8" },
    ],
    valueProps: ["Build one connected engineering journey."],
    prerequisites: [{ id: "typescript", requirement: "TypeScript basics" }],
    modules: [{
        id: "module",
        title: "Engineer mindset",
        level: "intermediate",
        levelLabel: "Intermediate",
        previewLabel: "2 contents",
        lessons: [
            { id: "content-1", title: "System boundaries", isPreview: true },
            { id: "content-2", title: "Failure modes", isPreview: true },
        ],
    }],
    averageScore: 4.8,
    reviewTotal: 12,
    reviews: [{ id: "review", author: "Learner", score: 5, body: "Practical and clear." }],
    faqs: [{ id: "faq", question: "Can I learn with another backend stack?", answer: "Yes. The course teaches transferable system thinking." }],
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

        expect(screen.getByRole("tab", { name: "Explore the course" })).not.toContainHTML("svg")
        expect(screen.getByRole("tab", { name: "Content" })).not.toContainHTML("svg")
        expect(screen.getByRole("tab", { name: "Learner outcomes" })).not.toContainHTML("svg")
        expect(screen.getByRole("tab", { name: "FAQ" })).not.toContainHTML("svg")
        expect(screen.getByRole("list", { name: "Course path" })).toHaveTextContent("HomeCoursesFullstack Mastery")
        expect(screen.getByText("Learning alongside you")).toBeInTheDocument()
        expect(screen.getByText("13 learners")).toHaveAttribute("data-size", "sm")
        expect(screen.getByText("13 learners")).toHaveAttribute("data-weight", "medium")
        expect(screen.getByText("Build one connected engineering journey.")).toHaveAttribute("data-size", "sm")
        expect(screen.getByText("Build one connected engineering journey.")).toHaveAttribute("data-weight", "normal")
        expect(screen.getByText("TypeScript basics")).toHaveAttribute("data-size", "sm")
        expect(screen.getByText("TypeScript basics")).toHaveAttribute("data-weight", "normal")
        // The rating package also emits one off-screen status value for assistive technology;
        // the page still owns exactly two VISIBLE numeric facts (signal board + review summary).
        expect(screen.getAllByText("4.8").filter((node) => node.getAttribute("role") !== "status")).toHaveLength(2)
        expect(document.querySelectorAll("[data-component=\"SurfaceListCardSurface\"]")).toHaveLength(5)
        expect(document.querySelector("[data-node=\"course-review-list\"]")).not.toBeNull()
        expect(screen.getByRole("tab", { name: "FAQ" })).toBeInTheDocument()
        expect(screen.getByText("Can I learn with another backend stack?")).toBeInTheDocument()
        expect(screen.getByText("Yes. The course teaches transferable system thinking.")).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "What you will learn" }).closest("[data-component=\"SurfaceListCard\"]")).not.toBeNull()
        expect(screen.getByRole("heading", { name: "What you will learn" }).closest("[data-component=\"SurfaceListCard\"]")?.querySelector("[data-node=\"marked-row-list\"]")).not.toBeNull()
        expect(screen.getByRole("heading", { name: "What you need first" }).closest("[data-component=\"SurfaceListCard\"]")).not.toBeNull()
        expect(screen.getByRole("heading", { name: "Course content" }).closest("[data-component=\"SurfaceListCard\"]")).not.toBeNull()
        expect(screen.getByText("Intermediate").closest("[data-component=\"Badge\"]")).toHaveAttribute("data-tone", "warning")
        expect(screen.getByText("Engineer mindset")).toHaveAttribute("data-size", "sm")
        expect(screen.getByText("Engineer mindset")).toHaveAttribute("data-weight", "medium")
        fireEvent.click(screen.getByText("Engineer mindset"))
        const contentList = screen.getByText("System boundaries").closest("ol")
        expect(contentList).toHaveTextContent("System boundariesFailure modes")
        expect(within(contentList!).getAllByRole("listitem")).toHaveLength(2)
        expect(screen.getByRole("heading", { name: "Frequently asked questions" }).closest("[data-component=\"SurfaceListCard\"]")).not.toBeNull()

        fireEvent.click(screen.getByRole("tab", { name: "Content" }))
        expect(selectSection).toHaveBeenCalledWith("curriculum")
        fireEvent.click(screen.getByRole("tab", { name: "FAQ" }))
        expect(selectSection).toHaveBeenCalledWith("faq")
    })

    it("reports breadcrumb navigation and disables the current course crumb", () => {
        const navigateHome = vi.fn()
        const navigateCourses = vi.fn()
        render(<_CourseDetailPage state="ready" props={props} on={{ navigateHome, navigateCourses }} />)

        fireEvent.click(screen.getByText("Home"))
        fireEvent.click(screen.getByText("Courses"))
        expect(navigateHome).toHaveBeenCalledOnce()
        expect(navigateCourses).toHaveBeenCalledOnce()
        const current = screen.getByRole("link", { name: "Fullstack Mastery" })
        expect(current).toHaveAttribute("aria-current", "page")
        expect(current).toHaveAttribute("aria-disabled", "true")
    })

    it("keeps one six-cell signal ribbon while course data is pending", () => {
        render(<_CourseDetailPage state="pending" props={{ labels, selectedSection: "overview" }} />)
        expect(document.querySelectorAll("[data-node^=\"course-signal-card-\"]")).toHaveLength(6)
        const signalBoard = document.querySelector("[data-node=\"course-signal-board\"]")
        expect(signalBoard?.closest("[data-component=\"SurfaceCardSurface\"]")).not.toBeNull()
        expect(signalBoard?.className).not.toMatch(/(?:^|\s)(?:border|rounded|shadow)(?:-|\s|$)/)
        expect(signalBoard?.className).toContain("[&>*]:border-separator")
        expect(screen.getByRole("tab", { name: "Learner outcomes" })).toBeInTheDocument()
    })

    it("does not turn an unrated course into a zero-score verdict", () => {
        render(<_CourseDetailPage state="ready" props={{ ...props, averageScore: 0, reviewTotal: 0, reviews: [] }} />)
        expect(screen.queryByText("0.0")).toBeNull()
        expect(screen.getByText("No reviews yet")).toBeInTheDocument()
    })

    it("keeps the FAQ anchor real when a course has no authored rows", () => {
        render(<_CourseDetailPage state="ready" props={{ ...props, faqs: [] }} />)
        expect(screen.getByRole("tab", { name: "FAQ" })).toBeInTheDocument()
        expect(screen.getByText("No FAQs yet")).toBeInTheDocument()
    })
})
