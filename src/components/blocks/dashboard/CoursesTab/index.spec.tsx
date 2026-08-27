/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import {
    useQueryCoursePricePreviewSwr,
    useQueryMyCoursesSwr,
    useQueryMyUpcomingLivestreamsSwr,
    useQueryRecommendedCoursesSwr,
    useQueryResolveRouteSwr,
} from "@/hooks"
import { CoursesTab } from "./index"

/**
 * What these tests guard - that ONE price surface serves the whole list.
 *
 * Mounted per row it would be one focus trap per row, of which only one can ever be open, so the
 * tab holds a single surface and the list underneath only reports which course was asked about.
 * The tab is therefore the smallest thing that can get this wrong, and the assertions are that the
 * surface is absent until a row asks, names the course that asked, and goes away again.
 */

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) =>
        values === undefined ? key : `${key}:${Object.values(values).join(",")}`,
    useLocale: () => "en-US",
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("@/hooks", () => ({
    useQueryMyCoursesSwr: vi.fn(),
    useQueryRecommendedCoursesSwr: vi.fn(),
    useQueryMyUpcomingLivestreamsSwr: vi.fn(),
    useQueryResolveRouteSwr: vi.fn(),
    useQueryCoursePricePreviewSwr: vi.fn(),
}))

/** One settled SWR answer, shaped the way the barrel hooks return it. */
const answer = (over: Partial<{ data: unknown, error: unknown }>) => ({
    data: undefined,
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
    ...over,
}) as never

/** One recommendation as the server sends it. */
const course = {
    displayId: "rust-basics",
    title: "Rust basics",
    thumbnailUrl: null,
    discountedPriceVnd: 400000,
    originalPriceVnd: 500000,
    discountPercent: 20,
    discountReason: "enrolledCount",
    enrolledCount: 42,
}

/** Wire every request the three blocks and the price surface make. */
const wire = () => {
    vi.mocked(useQueryMyCoursesSwr).mockReturnValue(answer({
        data: [{
            globalId: "course-1",
            label: "Ownership in depth",
            thumbnailUrl: null,
            contentCompleted: 1,
            contentTotal: 4,
            challengeCompleted: 0,
            challengeTotal: 1,
            completed: 0,
            total: 2,
            completionPercent: 25,
            isEnrolled: true,
        }],
    }))
    vi.mocked(useQueryRecommendedCoursesSwr).mockReturnValue(answer({ data: [course] }))
    vi.mocked(useQueryMyUpcomingLivestreamsSwr).mockReturnValue(answer({
        data: [{
            courseGlobalId: "course-1",
            nextStartAt: "2026-09-12T10:00:00.000Z",
            sessionTitle: "Kickoff",
            courseTitle: "Ownership in depth",
        }],
    }))
    vi.mocked(useQueryResolveRouteSwr).mockReturnValue({ trigger: vi.fn() } as never)
    vi.mocked(useQueryCoursePricePreviewSwr).mockReturnValue(answer({ data: undefined }))
}

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
})

describe("CoursesTab", () => {
    it("arranges the three learning blocks in one fixed order", () => {
        wire()

        const { container } = render(<CoursesTab />)
        const content = container.textContent ?? ""
        expect(content).toContain("Ownership in depth")
        // Progress first, then what to buy next, then what is happening live.
        expect(content.indexOf("Ownership in depth")).toBeLessThan(content.indexOf("Rust basics"))
        expect(content.indexOf("Rust basics")).toBeLessThan(content.indexOf("Kickoff"))
    })

    it("mounts no price surface until a row asks about its price", () => {
        wire()

        render(<CoursesTab />)
        expect(screen.queryByRole("dialog")).toBeNull()
        expect(vi.mocked(useQueryCoursePricePreviewSwr)).toHaveBeenLastCalledWith(undefined)
    })

    it("opens one surface for the course that asked, and asks the price for that course", () => {
        wire()

        render(<CoursesTab />)
        fireEvent.click(screen.getByText("priceDetail"))

        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(vi.mocked(useQueryCoursePricePreviewSwr)).toHaveBeenLastCalledWith("rust-basics")
        expect(screen.getAllByRole("dialog")).toHaveLength(1)
    })

    it("takes the surface back down, and stops asking, once the reader dismisses it", () => {
        wire()

        render(<CoursesTab />)
        fireEvent.click(screen.getByText("priceDetail"))
        expect(screen.getByRole("dialog")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Close" }))
        expect(screen.queryByRole("dialog")).toBeNull()
        expect(vi.mocked(useQueryCoursePricePreviewSwr)).toHaveBeenLastCalledWith(undefined)
    })
})
