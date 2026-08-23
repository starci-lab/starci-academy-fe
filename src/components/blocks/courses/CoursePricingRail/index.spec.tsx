import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    course: undefined as Record<string, unknown> | undefined,
    push: vi.fn(),
    trigger: vi.fn(),
}))

vi.mock("next-intl", () => ({
    useLocale: () => "en",
    useTranslations: () => (key: string) => key,
}))
vi.mock("swr", () => ({ useSWRConfig: () => ({ mutate: vi.fn() }) }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks/auth/useSessionToken", () => ({ useSessionToken: () => undefined }))
vi.mock("@/hooks", () => ({
    useQueryCourseSwr: () => ({ data: mocks.course }),
    useQueryMyCartSwr: () => ({ data: [] }),
    useQueryCoursePricePreviewSwr: () => ({ data: undefined, isLoading: false }),
    useMutateAddToCartSwr: () => ({ trigger: mocks.trigger, isMutating: false }),
    useMutateRemoveFromCartSwr: () => ({ trigger: mocks.trigger, isMutating: false }),
    useMutateCoursesCheckoutSwr: () => ({ trigger: mocks.trigger, isMutating: false }),
    useMutateStartTrialSwr: () => ({ trigger: mocks.trigger, isMutating: false }),
}))

import { CoursePricingRailMobile } from "./index"

afterEach(() => {
    mocks.course = undefined
    vi.restoreAllMocks()
})

describe("CoursePricingRailMobile", () => {
    it("keeps the pure component boundary stable while course data settles", () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined)
        const view = render(<CoursePricingRailMobile displayId="fullstack-mastery" />)

        mocks.course = {
            id: "course-id",
            displayId: "fullstack-mastery",
            title: "Fullstack Mastery",
            originalPrice: 1_500_000,
            pricingPhases: [],
            currentPhase: null,
            isEnrolled: false,
            enrollmentCount: 13,
        }

        expect(() => view.rerender(<CoursePricingRailMobile displayId="fullstack-mastery" />)).not.toThrow()
        expect(screen.getByRole("button", { name: "enroll" })).toBeInTheDocument()
        expect(consoleError.mock.calls.flat().join(" ")).not.toContain("change in the order of Hooks")
    })
})
