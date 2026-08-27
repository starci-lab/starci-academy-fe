/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import type { CoursePricePreview } from "@/modules/api/graphql/queries/types/course-price-preview"
import { CoursePriceOverlay } from "."

/**
 * What these tests guard: the sentences beside the number. A reason printed without a reduction,
 * or a scarcity line with no next price to hurry towards, are claims the reader can check and
 * find false - and both are one falsy test away from shipping.
 */

type OverlayMockInput = {
    readonly isOpen: boolean
    readonly children: ReactNode
    readonly onDismiss: () => void
}

const mocks = vi.hoisted(() => ({ preview: vi.fn(), dismiss: vi.fn() }))

vi.mock("@/hooks", () => ({ useQueryCoursePricePreviewSwr: mocks.preview }))
vi.mock("next-intl", () => ({
    useLocale: () => "en",
    useTranslations: () => (key: string, values?: Readonly<Record<string, unknown>>) =>
        values === undefined ? key : `${key}(${Object.values(values).join(",")})`,
}))
vi.mock("./component", () => ({
    CoursePriceOverlayView: (props: OverlayMockInput) => (
        <section data-testid="surface" data-open={String(props.isOpen)}>
            {props.children}
        </section>
    ),
}))

const preview = (overrides: Partial<CoursePricePreview> = {}): CoursePricePreview => ({
    originalPriceVnd: 2_000_000,
    phasePriceVnd: 1_500_000,
    discountedPriceVnd: 1_500_000,
    discountPercent: 25,
    discountReason: "none",
    enrolledCount: 0,
    currentPhase: "earlyBird",
    nextPhase: null,
    nextPhasePriceVnd: null,
    seatsRemainingInCurrentPhase: null,
    ...overrides,
})

const answer = (data: CoursePricePreview | undefined, isLoading = false) =>
    mocks.preview.mockReturnValue({ data, isLoading })

beforeEach(() => {
    mocks.preview.mockReset()
    mocks.dismiss.mockReset()
    answer(undefined)
})

const open = (courseId = "course-1") => render(
    <CoursePriceOverlay courseId={courseId} title="System Design" isOpen onDismiss={mocks.dismiss} />,
)

describe("CoursePriceOverlay", () => {
    it("asks for nothing at all while the surface is closed", () => {
        render(<CoursePriceOverlay courseId="course-1" isOpen={false} onDismiss={mocks.dismiss} />)
        expect(mocks.preview).toHaveBeenLastCalledWith(undefined)
        expect(screen.getByTestId("surface").dataset.open).toBe("false")
    })

    it("asks for this course's own reckoning once it is on screen", () => {
        open()
        expect(mocks.preview).toHaveBeenLastCalledWith("course-1")
    })

    it("shows the guest notice instead of a reckoning when there is no answer", () => {
        open()
        expect(screen.getByText("priceDetailGuest")).toBeInTheDocument()
        expect(screen.queryByText("linePayable")).not.toBeInTheDocument()
    })

    it("rests the reckoning rather than claiming a price while it is still arriving", () => {
        answer(undefined, true)
        open()
        expect(screen.queryByText("priceDetailGuest")).not.toBeInTheDocument()
    })

    it("draws list, phase and payable and omits loyalty when nothing was taken off", () => {
        answer(preview())
        open()
        expect(screen.getByText("lineList")).toBeInTheDocument()
        expect(screen.getByText("linePhase")).toBeInTheDocument()
        expect(screen.getByText("linePayable")).toBeInTheDocument()
        expect(screen.queryByText("lineLoyalty")).not.toBeInTheDocument()
    })

    it("adds the loyalty line and names the reason once a real reduction exists", () => {
        answer(preview({ discountedPriceVnd: 1_200_000, discountReason: "enrolledCount", enrolledCount: 3 }))
        open()
        expect(screen.getByText("lineLoyalty")).toBeInTheDocument()
        expect(screen.getByText("reasonEnrolled(3)")).toBeInTheDocument()
    })

    it.each([
        ["diligent", "reasonDiligent(1)"],
        ["both", "reasonBoth(1)"],
    ] as const)("names the %s reduction with the sentence it earns", (discountReason, sentence) => {
        answer(preview({ discountedPriceVnd: 1_200_000, discountReason, enrolledCount: 1 }))
        open()
        expect(screen.getByText(sentence)).toBeInTheDocument()
    })

    it("counts nothing rather than nobody when the server omitted the enrolment count", () => {
        // The field is required in the type but optional on the wire: an older resolver that
        // stops selecting it must not turn the sentence into "reasonEnrolled(undefined)".
        const withoutCount: Record<string, unknown> = {
            ...preview({ discountedPriceVnd: 1_200_000, discountReason: "enrolledCount" }),
        }
        delete withoutCount.enrolledCount
        answer(withoutCount as unknown as CoursePricePreview)
        open()
        expect(screen.getByText("reasonEnrolled(0)")).toBeInTheDocument()
    })

    it("prints no reason for a reduction the server gave no reason for", () => {
        answer(preview({ discountedPriceVnd: 1_200_000, discountReason: "none" }))
        open()
        expect(screen.getByText("lineLoyalty")).toBeInTheDocument()
        expect(screen.queryByText(/^reason/)).not.toBeInTheDocument()
    })

    it("prints no reason when the tier took nothing off, whatever the server called it", () => {
        answer(preview({ discountReason: "diligent", enrolledCount: 9 }))
        open()
        expect(screen.queryByText(/^reason/)).not.toBeInTheDocument()
    })

    it("says nothing about hurrying when no next phase is scheduled", () => {
        answer(preview({ seatsRemainingInCurrentPhase: 4 }))
        open()
        expect(screen.queryByText(/^nextPhase/)).not.toBeInTheDocument()
        expect(screen.queryByText(/^seatsThenPrice/)).not.toBeInTheDocument()
    })

    it("names the coming price alone when the phase is not seat-bounded", () => {
        answer(preview({ nextPhasePriceVnd: 1_800_000 }))
        open()
        expect(screen.getByText(/^nextPhase\(/)).toBeInTheDocument()
    })

    it("names seats and the coming price together when both are true", () => {
        answer(preview({ nextPhasePriceVnd: 1_800_000, seatsRemainingInCurrentPhase: 4 }))
        open()
        expect(screen.getByText(/^seatsThenPrice\(4,/)).toBeInTheDocument()
    })

    it("formats every amount as whole Vietnamese dong", () => {
        answer(preview({ originalPriceVnd: 2_000_000 }))
        open()
        const money = new Intl.NumberFormat("en", { style: "currency", currency: "VND", maximumFractionDigits: 0 })
        expect(screen.getByText(money.format(2_000_000))).toBeInTheDocument()
    })
})
