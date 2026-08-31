import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useOverviewEvidence } from "./useOverviewEvidence"
import { OverviewCourses } from "./OverviewCourses"

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, string>) => values?.title === undefined ? key : `${key}:${values.title}`,
    useLocale: () => "vi",
}))
type LocalizedPathInput = { readonly locale: string; readonly href: string }
vi.mock("@/i18n/navigation", () => ({
    getPathname: ({ locale, href }: LocalizedPathInput) => `/${locale}${href}`,
}))
vi.mock("./useOverviewEvidence", () => ({ useOverviewEvidence: vi.fn() }))

type Course = {
  readonly globalId: string;
  readonly path: string;
  readonly label: string;
  readonly thumbnailUrl?: string | null;
  readonly contentCompleted: number;
  readonly contentTotal: number;
  readonly challengeCompleted: number;
  readonly challengeTotal: number;
  readonly completed: number;
  readonly total: number;
  readonly completionPercent: number;
  readonly isEnrolled: boolean;
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
                    path: "/courses/backend-fundamentals",
                    label: "Backend fundamentals",
                    thumbnailUrl: "https://cdn.test/backend.png",
                    contentCompleted: 3,
                    contentTotal: 10,
                    challengeCompleted: 1,
                    challengeTotal: 4,
                    completed: 4,
                    total: 14,
                    completionPercent: 29,
                    isEnrolled: true,
                },
                {
                    globalId: "course-fe",
                    path: "/courses/frontend-fundamentals",
                    label: "Frontend fundamentals",
                    contentCompleted: 8,
                    contentTotal: 8,
                    challengeCompleted: 2,
                    challengeTotal: 2,
                    completed: 10,
                    total: 10,
                    completionPercent: 100,
                    isEnrolled: true,
                },
            ],
        })
        const { container } = render(<OverviewCourses />)

        expect(
            screen.getByRole("heading", { name: "evidence.courses.label" }),
        ).toBeInTheDocument()
        expect(container.textContent).toContain("Backend fundamentals")
        expect(container.textContent).toContain("Frontend fundamentals")
        expect(screen.getByText("progress.content 3/10 · progress.challenge 1/4")).toBeInTheDocument()
        expect(container.querySelector("[data-artwork=\"true\"]")).toBeInTheDocument()
        expect(container.querySelector("[data-grammar-surface-list=\"true\"]")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Backend fundamentals" })).toHaveAttribute("href", "/vi/courses/backend-fundamentals")
        expect(screen.getByRole("link", { name: "Frontend fundamentals" })).toHaveAttribute("href", "/vi/courses/frontend-fundamentals")
        expect(screen.getAllByRole("progressbar")).toHaveLength(2)
        expect(screen.getByRole("progressbar", { name: "catalog.progressAria:Backend fundamentals" })).toHaveAttribute("aria-valuenow", "29")
        expect(screen.getByText("Backend fundamentals")).toHaveAttribute("data-press-label", "true")
        const qualifier = screen.getByText("progress.content 3/10 · progress.challenge 1/4").parentElement
        expect(qualifier).toHaveClass("min-w-0", "max-w-full", "whitespace-normal", "break-words")
        expect(qualifier?.closest("a")).toBeInTheDocument()
    })

    it("rests two unqualified course rows while the joined evidence is in flight", () => {
        stub({ isLoading: true })
        const { container } = render(<OverviewCourses />)

        expect(screen.queryByText("Rust basics")).toBeNull()
        expect(screen.getByRole("heading")).toBeInTheDocument()
        expect(screen.queryByRole("status")).toBeNull()
        expect(container.textContent).not.toContain("content ·")
        expect(screen.queryByRole("link")).toBeNull()
        expect(screen.queryByRole("progressbar")).toBeNull()
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
