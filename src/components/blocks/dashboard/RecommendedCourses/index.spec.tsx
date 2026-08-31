/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { useQueryRecommendedCoursesSwr } from "@/hooks"
import { RecommendedCourses } from "./index"

/**
 * What these tests guard - that a price is never drawn twice over, and never drawn short.
 *
 * A discounted row has to carry three separate facts (what it costs now, what it cost, what that
 * saves) and an undiscounted row must carry none of them - a struck-through price equal to the
 * live one is a lie a reader can see. Both shapes are asserted from the rendered row.
 */

const push = vi.fn()

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) =>
        values === undefined ? key : `${key}:${Object.values(values).join(",")}`,
    useLocale: () => "en-US",
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/hooks", () => ({ useQueryRecommendedCoursesSwr: vi.fn() }))

/** One settled SWR answer, shaped the way the barrel hook returns it. */
const answer = (over: Partial<{ data: unknown, error: unknown, mutate: () => void }>) => ({
    data: undefined,
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
    ...over,
}) as never

/** One recommendation as the server sends it. */
const course = (over: Partial<Record<string, unknown>> = {}) => ({
    displayId: "rust-basics",
    title: "Rust basics",
    thumbnailUrl: "https://cdn.test/rust.png",
    discountedPriceVnd: 400000,
    originalPriceVnd: 500000,
    discountPercent: 20,
    discountReason: "launch",
    enrolledCount: 42,
    ...over,
})

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
})

describe("RecommendedCourses", () => {
    it("offers the request again when the suggestions could not be read", () => {
        const mutate = vi.fn()
        vi.mocked(useQueryRecommendedCoursesSwr).mockReturnValue(answer({ error: new Error("down"), mutate }))

        render(<RecommendedCourses />)
        expect(screen.getByText("failed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "retry" }))
        expect(mutate).toHaveBeenCalledOnce()
    })

    it("keeps showing the suggestions it already has when a refresh fails", () => {
        vi.mocked(useQueryRecommendedCoursesSwr).mockReturnValue(answer({
            error: new Error("stale"),
            data: [course()],
        }))

        render(<RecommendedCourses />)
        expect(screen.getByText("Rust basics")).toBeInTheDocument()
        expect(screen.queryByText("failed")).toBeNull()
    })

    it("holds three resting rows while the suggestions are on their way", () => {
        vi.mocked(useQueryRecommendedCoursesSwr).mockReturnValue(answer({ data: undefined }))

        const { container } = render(<RecommendedCourses />)
        expect(screen.getByText("heading")).toBeInTheDocument()
        expect(container.querySelectorAll("button")).toHaveLength(0)
        expect(screen.getByText("heading")).toBeInTheDocument()
    })

    it("keeps a list surface when there is nothing to suggest", () => {
        vi.mocked(useQueryRecommendedCoursesSwr).mockReturnValue(answer({ data: [] }))

        render(<RecommendedCourses />)
        expect(screen.getByText("empty")).toBeInTheDocument()
    })

    it("prices a discounted course three ways and says why it is being suggested", () => {
        vi.mocked(useQueryRecommendedCoursesSwr).mockReturnValue(answer({ data: [course()] }))

        const { container } = render(<RecommendedCourses />)
        expect(screen.getByText("₫400,000")).toBeInTheDocument()
        const struck = container.querySelector("[data-superseded=\"true\"]")
        expect(struck).toHaveTextContent("₫500,000")
        expect(screen.getByText("−20%")).toBeInTheDocument()
        expect(screen.getByText("savings:₫100,000")).toBeInTheDocument()
        expect(screen.getByText("reason:42")).toBeInTheDocument()
    })

    it("shows one price and no saving when the course is not discounted", () => {
        vi.mocked(useQueryRecommendedCoursesSwr).mockReturnValue(answer({
            data: [course({ discountPercent: 0, originalPriceVnd: 400000, discountReason: "none", thumbnailUrl: null })],
        }))

        const { container } = render(<RecommendedCourses />)
        expect(screen.getByText("₫400,000")).toBeInTheDocument()
        expect(container.querySelector("[data-superseded=\"true\"]")).toBeNull()
        expect(screen.queryByText(/^savings:/)).toBeNull()
        expect(screen.queryByText(/^reason:/)).toBeNull()
        // No artwork, so the mark falls back to the course glyph rather than an empty image.
        expect(container.querySelector("img")).toBeNull()
    })

    it("travels to the course the reader picked", () => {
        vi.mocked(useQueryRecommendedCoursesSwr).mockReturnValue(answer({ data: [course()] }))

        render(<RecommendedCourses />)
        fireEvent.click(screen.getByRole("button", { name: "Rust basics" }))
        expect(push).toHaveBeenCalledWith("/courses/rust-basics")
    })

    it("reports which course was asked about instead of mounting a surface of its own", () => {
        const onOpenPriceDetail = vi.fn()
        vi.mocked(useQueryRecommendedCoursesSwr).mockReturnValue(answer({ data: [course()] }))

        render(<RecommendedCourses onOpenPriceDetail={onOpenPriceDetail} />)
        fireEvent.click(screen.getByText("priceDetail"))
        expect(onOpenPriceDetail).toHaveBeenCalledWith("rust-basics")
        expect(push).not.toHaveBeenCalled()
    })

    it("still draws the question when no surrounding surface is listening", () => {
        vi.mocked(useQueryRecommendedCoursesSwr).mockReturnValue(answer({ data: [course()] }))

        render(<RecommendedCourses />)
        fireEvent.click(screen.getByText("priceDetail"))
        expect(push).not.toHaveBeenCalled()
        expect(screen.getByText("priceDetail")).toBeInTheDocument()
    })
})
