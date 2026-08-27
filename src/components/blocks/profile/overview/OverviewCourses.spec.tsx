import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useOverviewEvidence } from "./useOverviewEvidence"
import { OverviewCourses } from "./OverviewCourses"

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
}))
vi.mock("./useOverviewEvidence", () => ({ useOverviewEvidence: vi.fn() }))

type Course = {
  readonly globalId: string;
  readonly label: string;
  readonly contentCompleted: number;
  readonly contentTotal: number;
  readonly challengeCompleted: number;
  readonly challengeTotal: number;
  readonly completed: number;
  readonly total: number;
};

type CourseEvidence = {
  readonly data?: ReadonlyArray<Course>;
  readonly error?: Error;
  readonly isLoading?: boolean;
};

const stub = (over: CourseEvidence) => {
    vi.mocked(useOverviewEvidence).mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        ...over,
    } as never)
}

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

        expect(
            screen.getByRole("heading", { name: "evidence.courses.label" }),
        ).toBeInTheDocument()
        expect(container.textContent).toContain("Backend fundamentals")
        expect(container.textContent).toContain("Frontend fundamentals")
        expect(
            screen.getByText("3/10 content · 1/4 challenges"),
        ).toBeInTheDocument()
    })

    it("rests two unqualified course rows while the joined evidence is in flight", () => {
        stub({ isLoading: true })
        const { container } = render(<OverviewCourses />)

        expect(screen.queryByText("Rust basics")).toBeNull()
        expect(screen.getByRole("heading")).toBeInTheDocument()
        expect(screen.queryByRole("status")).toBeNull()
        expect(container.textContent).not.toContain("content ·")
    })

    it("says the learner has joined no course yet instead of drawing an empty list", () => {
        stub({ data: [] })
        const { container } = render(<OverviewCourses />)

        expect(container.textContent).toContain("evidence.courses.empty")
        expect(screen.queryByRole("status")).toBeNull()
    })

    it("says the course evidence failed rather than claiming the learner joined nothing", () => {
        stub({ error: new Error("down") })
        const { container } = render(<OverviewCourses />)

        expect(container.textContent).toContain("evidence.error")
        expect(container.textContent).not.toContain("evidence.courses.empty")
    })
})
