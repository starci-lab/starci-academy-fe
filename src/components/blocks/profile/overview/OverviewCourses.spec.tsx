import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useOverviewEvidence } from "./useOverviewEvidence"
import { OverviewCourses } from "./OverviewCourses"

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
}))
vi.mock("./useOverviewEvidence", () => ({ useOverviewEvidence: vi.fn() }))

type Course = {
    readonly globalId: string
    readonly label: string
    readonly contentCompleted: number
    readonly contentTotal: number
    readonly challengeCompleted: number
    readonly challengeTotal: number
    readonly completed: number
    readonly total: number
}

type CourseEvidence = { readonly data?: ReadonlyArray<Course>, readonly error?: Error, readonly isLoading?: boolean }

const stub = (over: CourseEvidence) => {
    vi.mocked(useOverviewEvidence).mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        ...over,
    } as never)
}

const evidenceRows = (root: HTMLElement) =>
    Array.from(root.querySelectorAll("[data-node=\"evidence-title-subtitle-fact-row\"]"), (row) => row.textContent)

afterEach(() => {
    vi.clearAllMocks()
})

describe("OverviewCourses", () => {
    it("keeps the content and challenge qualifiers of every joined course beside its total", () => {
        stub({
            data: [
                {
                    globalId: "course-be",
                    label: "Backend fundamentals",
                    contentCompleted: 3,
                    contentTotal: 10,
                    challengeCompleted: 1,
                    challengeTotal: 4,
                    completed: 4,
                    total: 14,
                },
                {
                    globalId: "course-fe",
                    label: "Frontend fundamentals",
                    contentCompleted: 8,
                    contentTotal: 8,
                    challengeCompleted: 2,
                    challengeTotal: 2,
                    completed: 10,
                    total: 10,
                },
            ],
        })
        const { container } = render(<OverviewCourses />)

        expect(screen.getByRole("heading", { name: "evidence.courses.label" })).toBeInTheDocument()
        expect(evidenceRows(container)).toEqual([
            "Backend fundamentals3/10 content · 1/4 challenges4/14",
            "Frontend fundamentals8/8 content · 2/2 challenges10/10",
        ])
        expect(screen.getByText("3/10 content · 1/4 challenges")).toBeInTheDocument()
    })

    it("rests two unqualified course rows while the joined evidence is in flight", () => {
        stub({ isLoading: true })
        const { container } = render(<OverviewCourses />)

        expect(container.querySelectorAll("[data-node=\"evidence-title-subtitle-fact-row\"]")).toHaveLength(2)
        expect(container.querySelector("[data-node=\"evidence-title-over-subtitle\"] [data-component=\"Text\"]"))
            .toHaveAttribute("data-loading", "true")
        expect(container.querySelectorAll("[data-component=\"Badge\"]")).toHaveLength(0)
        expect(container.textContent).not.toContain("content ·")
    })

    it("says the learner has joined no course yet instead of drawing an empty list", () => {
        stub({ data: [] })
        const { container } = render(<OverviewCourses />)

        expect(evidenceRows(container)).toEqual(["evidence.courses.empty"])
        expect(container.querySelectorAll("[data-component=\"Badge\"]")).toHaveLength(0)
    })

    it("says the course evidence failed rather than claiming the learner joined nothing", () => {
        stub({ error: new Error("down") })
        const { container } = render(<OverviewCourses />)

        expect(evidenceRows(container)).toEqual(["evidence.error"])
        expect(container.textContent).not.toContain("evidence.courses.empty")
    })
})
