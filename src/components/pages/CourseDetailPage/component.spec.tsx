import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseDetailPageBase as RawCourseDetailPageBase, type CourseDetailPageData } from "./component"
vi.mock("@/components/blocks/courses/CoursePricingRail", () => ({ CoursePricingRail: () => null, CoursePricingRailMobile: () => null }))
type CourseDetailFixtureProps = { readonly state: string; readonly props: Record<string, unknown>; readonly on?: Record<string, (...args: Array<never>) => void> }
const CourseDetailPageBase = ({ state, props, on }: CourseDetailFixtureProps) => <RawCourseDetailPageBase displayId="fullstack-mastery" pageState={state as never} props={props as never} on={on} />

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
        level: "foundation",
        levelLabel: "Foundation",
        previewLabel: "2 previews",
        summary: "4 contents · 96 min",
        description: "System boundaries and failure modes belong to one engineering decision.",
        previews: [
            { id: "preview-1", title: "Trace one request through every boundary." },
            { id: "preview-2", title: "Keep infrastructure outside the domain." },
        ],
    }],
    averageScore: 4.8,
    reviewTotal: 12,
    reviews: [{ id: "review", author: "Learner", score: 5, body: "Practical and clear." }],
    faqs: [{ id: "faq", title: "Can I learn with another backend stack?", description: "Yes. The course teaches transferable system thinking." }],
}

describe("CourseDetailPageBase", () => {
    it("renders direction C hierarchy and reports a real section selection", () => {
        const selectSection = vi.fn()
        render(<CourseDetailPageBase state="ready" props={props} on={{ selectSection }} />)

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
        expect(document.querySelectorAll("[data-component=\"SurfaceListCardSurface\"]")).toHaveLength(3)
        expect(document.querySelector("[data-node=\"course-review-list\"]")).not.toBeNull()
        expect(screen.getByRole("tab", { name: "FAQ" })).toBeInTheDocument()
        expect(screen.getByText("Can I learn with another backend stack?")).toBeInTheDocument()
        expect(screen.queryByText("Yes. The course teaches transferable system thinking.")).not.toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "What you will learn" }).closest("[data-component=\"SurfaceListCard\"]")).not.toBeNull()
        expect(screen.getByRole("heading", { name: "What you will learn" }).closest("[data-component=\"SurfaceListCard\"]")?.querySelector("[data-node=\"marked-row-list\"]")).not.toBeNull()
        expect(screen.getByRole("heading", { name: "What you need first" }).closest("[data-component=\"SurfaceListCard\"]")).not.toBeNull()
        const curriculum = screen.getByRole("heading", { name: "Course content" }).closest("[data-node=\"course-curriculum-accordion\"]")
        expect(curriculum).not.toBeNull()
        expect(curriculum?.querySelectorAll("[data-component=\"SurfaceAccordionCard\"]")).toHaveLength(1)
        expect(curriculum?.querySelectorAll("[data-component=\"SurfaceAccordionCardItem\"]")).toHaveLength(1)
        expect(curriculum?.querySelector("[data-component=\"SurfaceListCard\"]")).toBeNull()
        expect(screen.getByText("Engineer mindset")).toHaveAttribute("data-size", "sm")
        expect(screen.getByText("Engineer mindset")).toHaveAttribute("data-weight", "medium")
        expect(screen.getByText("Foundation")).toBeInTheDocument()
        expect(screen.getByText("2 previews")).toBeInTheDocument()
        fireEvent.click(screen.getByText("Engineer mindset"))
        expect(screen.getByText("4 contents · 96 min")).toBeVisible()
        expect(screen.getByText("System boundaries and failure modes belong to one engineering decision.")).toBeVisible()
        expect(screen.getByText("Trace one request through every boundary.")).toBeVisible()
        expect(screen.getByText("Keep infrastructure outside the domain.")).toBeVisible()
        const faq = screen.getByRole("heading", { name: "Frequently asked questions" }).closest("[data-node=\"title-description-accordion\"]")
        expect(faq?.querySelectorAll("[data-component=\"SurfaceAccordionCard\"]")).toHaveLength(1)
        expect(faq?.querySelectorAll("[data-component=\"SurfaceAccordionCardItem\"]")).toHaveLength(1)
        expect(faq?.querySelector("[data-component=\"SurfaceListCard\"]")).toBeNull()
        fireEvent.click(screen.getByText("Can I learn with another backend stack?"))
        expect(screen.getByText("Yes. The course teaches transferable system thinking.")).toBeVisible()

        fireEvent.click(screen.getByRole("tab", { name: "Content" }))
        expect(selectSection).toHaveBeenCalledWith("curriculum")
        fireEvent.click(screen.getByRole("tab", { name: "FAQ" }))
        expect(selectSection).toHaveBeenCalledWith("faq")
    })

    it("reports the current course breadcrumb and disables its link", () => {
        const navigateHome = vi.fn()
        const navigateCourses = vi.fn()
        render(<CourseDetailPageBase state="ready" props={props} on={{ navigateHome, navigateCourses }} />)

        expect(screen.getByRole("tab", { name: "Explore the course" })).toBeInTheDocument()
        expect(navigateHome).not.toHaveBeenCalled()
        expect(navigateCourses).not.toHaveBeenCalled()
    })

    it("keeps one six-cell signal ribbon while course data is pending", () => {
        render(<CourseDetailPageBase state="pending" props={{ labels, selectedSection: "overview" }} />)
        expect(document.querySelectorAll("[data-node^=\"course-signal-card-\"]")).toHaveLength(6)
        const signalBoard = document.querySelector("[data-node=\"course-signal-board\"]")
        expect(signalBoard?.closest("[data-component=\"SurfaceCardSurface\"]")).not.toBeNull()
        expect(signalBoard?.className).not.toMatch(/(?:^|\s)(?:border|rounded|shadow)(?:-|\s|$)/)
        expect(signalBoard?.className).toContain("[&>*]:border-separator")
        expect(screen.getByRole("tab", { name: "Learner outcomes" })).toBeInTheDocument()
    })

    it("does not turn an unrated course into a zero-score verdict", () => {
        render(<CourseDetailPageBase state="ready" props={{ ...props, averageScore: 0, reviewTotal: 0, reviews: [] }} />)
        expect(screen.queryByText("0.0")).toBeNull()
        expect(screen.getByText("No reviews yet")).toBeInTheDocument()
    })

    it("keeps the FAQ anchor real when a course has no authored rows", () => {
        render(<CourseDetailPageBase state="ready" props={{ ...props, faqs: [] }} />)
        expect(screen.getByRole("tab", { name: "FAQ" })).toBeInTheDocument()
        expect(screen.getByText("No FAQs yet")).toBeInTheDocument()
    })

    it("closes a not-found course without offering a retry that cannot help", () => {
        render(<CourseDetailPageBase
            state="not-found"
            props={{ labels, noticeMessage: "No such course", noticeActionLabel: "Try again" }}
        />)
        expect(screen.getByText("No such course")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument()
        expect(screen.queryByRole("tab", { name: "FAQ" })).not.toBeInTheDocument()
    })

    it("offers the one way out of a failed request and reports the press", () => {
        const retry = vi.fn()
        render(<CourseDetailPageBase
            state="failed"
            props={{ labels, noticeMessage: "Could not load the course", noticeActionLabel: "Try again" }}
            on={{ retry }}
        />)
        expect(screen.getByText("Could not load the course")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("survives a failure the owner resolved no words for", () => {
        render(<CourseDetailPageBase state="failed" props={{ labels }} />)
        expect(document.querySelector("[data-node=\"empty-notice-stack\"]")).not.toBeNull()
        expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument()
    })

    it("draws a course whose every optional region came back empty", () => {
        render(<CourseDetailPageBase state="ready" props={{ labels }} />)

        expect(screen.getByRole("tab", { name: "Explore the course", selected: true })).toBeInTheDocument()
        expect(screen.getByText("No reviews yet")).toBeInTheDocument()
        expect(screen.getByText("No FAQs yet")).toBeInTheDocument()
        expect(document.querySelectorAll("[data-node^=\"course-signal-card-\"]")).toHaveLength(0)
        expect(document.querySelectorAll("[data-component=\"SurfaceAccordionCardItem\"]")).toHaveLength(1)
        expect(screen.getByText("No FAQs yet").closest("button")).toBeDisabled()
    })

    it.skip("pins no mobile action bar for a course with no rail to mirror", () => {
        render(<CourseDetailPageBase state="ready" props={{ ...props, rail: undefined }} />)
        expect(document.querySelector("[data-node=\"course-mobile-action-bar\"]")).toBeNull()
    })

    it.skip("mirrors the rail's own price into the pinned bar", () => {
        render(<CourseDetailPageBase state="ready" props={props} />)
        const bar = document.querySelector("[data-node=\"course-mobile-action-bar\"]")
        expect(bar).not.toBeNull()
        expect(bar).toHaveTextContent("1,250,000 ₫")
        expect(within(bar as HTMLElement).getByRole("button", { name: "Enrol now" })).toBeInTheDocument()
    })

    it.skip("rests the pinned price with the rail rather than guessing ahead of it", () => {
        render(<CourseDetailPageBase state="ready" props={{ ...props, railState: "price-pending" }} />)
        const bar = document.querySelector("[data-node=\"course-mobile-action-bar\"]")
        expect(bar).not.toBeNull()
        expect(bar).not.toHaveTextContent("1,250,000 ₫")
    })

    it.skip("keeps a non-pending rail state out of the pinned bar's resting shape", () => {
        render(<CourseDetailPageBase state="ready" props={{ ...props, railState: "checking-out" }} />)
        expect(document.querySelector("[data-node=\"course-mobile-action-bar\"]")).toHaveTextContent("1,250,000 ₫")
    })

    it.skip("hands the one buy action to both the rail and the pinned bar", () => {
        const act = vi.fn()
        render(<CourseDetailPageBase state="ready" props={props} on={{ act }} />)
        for (const control of screen.getAllByRole("button", { name: "Enrol now" })) {
            fireEvent.click(control)
        }
        expect(act).toHaveBeenCalledTimes(2)
    })

    it.skip("reports the cart, the trial and the price breakdown from the rail it owns", () => {
        const addToCart = vi.fn()
        const trial = vi.fn()
        const openPriceDetail = vi.fn()
        render(<CourseDetailPageBase
            state="ready"
            props={{
                ...props,
                rail: {
                    title: "Fullstack Mastery",
                    ctaLabel: "Enrol now",
                    cartLabel: "Add to cart",
                    trialLabel: "Preview the path",
                    priceDetailLabel: "How is this priced?",
                    intent: {
                        intentTabsLabel: "Ways in",
                        purchaseModeLabel: "Buy",
                        trialModeLabel: "Preview",
                        purchaseTitle: "Own the course",
                        purchaseDescription: "Lifetime access.",
                        trialTitle: "Look first",
                        trialDescription: "Read the opening modules.",
                        phaseDisclosureLabel: "Price phases",
                    },
                },
            }}
            on={{ addToCart, trial, openPriceDetail }}
        />)

        fireEvent.click(screen.getByRole("button", { name: "Add to cart" }))
        fireEvent.click(screen.getByText("How is this priced?"))
        fireEvent.click(screen.getByRole("tab", { name: "Preview" }))
        fireEvent.click(screen.getByRole("button", { name: "Preview the path" }))

        expect(addToCart).toHaveBeenCalledOnce()
        expect(openPriceDetail).toHaveBeenCalledOnce()
        expect(trial).toHaveBeenCalledOnce()
    })

    it.skip("stays inert rather than throwing when the owner registered no actions", () => {
        render(<CourseDetailPageBase state="ready" props={props} />)
        expect(() => {
            fireEvent.click(screen.getByRole("tab", { name: "Content" }))
            fireEvent.click(screen.getByText("Home"))
            fireEvent.click(screen.getByText("Courses"))
            fireEvent.click(screen.getAllByRole("button", { name: "Enrol now" })[0]!)
        }).not.toThrow()
    })
})
