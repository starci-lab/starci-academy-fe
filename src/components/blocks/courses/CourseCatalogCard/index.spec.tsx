import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useMutateAddToCartSwr, useQueryCoursePricePreviewSwr } from "@/hooks"
import { CourseCatalogCard } from "./index"

vi.mock("next-intl", () => ({
    useLocale: () => "en-US",
    useTranslations: () => (key: string, values?: Record<string, string | number>) =>
        values === undefined ? key : `${key}:${Object.values(values).join("|")}`,
}))

vi.mock("@/hooks", () => ({
    useMutateAddToCartSwr: vi.fn(),
    useQueryCoursePricePreviewSwr: vi.fn(),
}))

const course = {
    id: "backend-basics",
    title: "Backend basics",
    price: "990.000 ₫",
    cartLabel: "ignored",
    viewLabel: "View course",
} as const

/** The preview the server answers for a viewer whose loyalty tier does take money off. */
const personalPreview = {
    originalPriceVnd: 1290000,
    phasePriceVnd: 990000,
    discountedPriceVnd: 890000,
    discountPercent: 31,
    discountReason: "enrolledCount",
    enrolledCount: 4,
    currentPhase: "early",
}

const stubCart = (over: Record<string, unknown> = {}) => {
    const trigger = vi.fn(async () => ({ data: { addToCart: { success: true } } }))
    vi.mocked(useMutateAddToCartSwr).mockReturnValue({
        trigger,
        isMutating: false,
        ...over,
    } as never)
    return trigger
}

const stubPreview = (data?: unknown) => {
    vi.mocked(useQueryCoursePricePreviewSwr).mockReturnValue({ data, error: undefined } as never)
}

afterEach(() => {
    vi.clearAllMocks()
})

describe("CourseCatalogCard", () => {
    it("keeps the phase price the page already resolved while no better answer has arrived", () => {
        stubCart()
        stubPreview(undefined)
        render(<CourseCatalogCard course={course} />)
        expect(screen.getByText("990.000 ₫")).toBeInTheDocument()
        expect(screen.queryByText("discount:31")).not.toBeInTheDocument()
        expect(useQueryCoursePricePreviewSwr).toHaveBeenCalledWith("backend-basics")
        expect(useMutateAddToCartSwr).toHaveBeenCalledWith("backend-basics")
    })

    it("replaces the phase price once the viewer's own, cheaper answer arrives", () => {
        stubCart()
        stubPreview(personalPreview)
        render(<CourseCatalogCard course={course} />)
        expect(screen.getByText("₫890,000")).toBeInTheDocument()
        expect(screen.getByText("₫1,290,000")).toBeInTheDocument()
        expect(screen.getByText("discount:31")).toBeInTheDocument()
        expect(screen.getByText("savings:₫400,000")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "priceDetail" })).toBeInTheDocument()
    })

    it("keeps the phase price when the viewer's answer takes nothing off it", () => {
        stubCart()
        stubPreview({ ...personalPreview, discountedPriceVnd: 990000, discountPercent: 0 })
        render(<CourseCatalogCard course={course} />)
        expect(screen.getByText("990.000 ₫")).toBeInTheDocument()
        expect(screen.queryByText("discount:0")).not.toBeInTheDocument()
    })

    it("asks the server nothing at all about one of the grid's resting shapes", () => {
        stubCart()
        stubPreview(undefined)
        const { container } = render(<CourseCatalogCard state="pending" course={{ id: "resting-1" }} />)
        expect(useQueryCoursePricePreviewSwr).toHaveBeenCalledWith(undefined)
        expect(useMutateAddToCartSwr).toHaveBeenCalledWith(undefined)
        expect(container.querySelector("h2")).toBeInTheDocument()
        expect(screen.queryByRole("heading", { name: "Backend basics" })).not.toBeInTheDocument()
    })

    it("spins the cart control while this card's own add is running", () => {
        stubCart({ isMutating: true })
        stubPreview(undefined)
        render(<CourseCatalogCard course={course} />)
        expect(screen.getByRole("button", { name: "addToCart" })).toBeDisabled()
    })

    it("remembers a successful add so the control stops offering the same row twice", async () => {
        const trigger = stubCart()
        stubPreview(undefined)
        render(<CourseCatalogCard course={course} />)
        fireEvent.click(screen.getByRole("button", { name: "addToCart" }))
        expect(trigger).toHaveBeenCalledExactlyOnceWith({ courseId: "backend-basics" })
        await waitFor(() => expect(screen.getByRole("button", { name: "inCart" })).toBeDisabled())
    })

    it("leaves the control offering what it offered before a refused add", async () => {
        const trigger = vi.fn(async () => ({ data: { addToCart: { success: false } } }))
        stubCart({ trigger })
        stubPreview(undefined)
        render(<CourseCatalogCard course={course} />)
        fireEvent.click(screen.getByRole("button", { name: "addToCart" }))
        await waitFor(() => expect(trigger).toHaveBeenCalledOnce())
        expect(screen.getByRole("button", { name: "addToCart" })).toBeEnabled()
    })

    it("leaves the control alone when the add answers nothing at all", async () => {
        const trigger = vi.fn(async () => undefined)
        stubCart({ trigger })
        stubPreview(undefined)
        render(<CourseCatalogCard course={course} />)
        fireEvent.click(screen.getByRole("button", { name: "addToCart" }))
        await waitFor(() => expect(trigger).toHaveBeenCalledOnce())
        expect(screen.getByRole("button", { name: "addToCart" })).toBeEnabled()
    })

    it("reports the two journeys the page owns rather than answering them itself", () => {
        stubCart()
        stubPreview(personalPreview)
        const onView = vi.fn()
        const onOpenPriceDetail = vi.fn()
        render(<CourseCatalogCard course={course} onView={onView} onOpenPriceDetail={onOpenPriceDetail} />)
        fireEvent.click(screen.getByRole("button", { name: "View course" }))
        expect(onView).toHaveBeenCalledOnce()
        fireEvent.click(screen.getByRole("link", { name: "priceDetail" }))
        expect(onOpenPriceDetail).toHaveBeenCalledOnce()
    })
})
