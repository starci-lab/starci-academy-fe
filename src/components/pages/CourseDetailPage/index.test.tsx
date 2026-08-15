import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CourseDetailPage } from "."

const mocks = vi.hoisted(() => ({
    sessionToken: "session-token" as string | undefined,
    cartRows: [] as ReadonlyArray<{ readonly courseId: string }>,
    push: vi.fn(),
    mutate: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
    checkout: vi.fn(),
    trial: vi.fn(),
}))

vi.mock("next-intl", () => ({
    useLocale: () => "vi",
    useTranslations: () => (key: string) => key,
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("swr", () => ({ useSWRConfig: () => ({ mutate: mocks.mutate }) }))
vi.mock("@/hooks/auth/useSessionToken", () => ({ useSessionToken: () => mocks.sessionToken }))
vi.mock("@/hooks", () => ({
    useQueryCourseSwr: () => ({
        data: {
            id: "course-1",
            displayId: "system-design-mastery",
            title: "System Design Mastery",
            description: "Design production systems.",
            originalPrice: 2_000_000,
            enrollmentCount: 0,
            isEnrolled: false,
            currentPhase: "earlyBird",
            pricingPhases: [{ id: "early", phase: "earlyBird", price: 1_750_000, slotAvailable: 50, orderIndex: 0 }],
            valuePropositions: [],
            prerequisites: [],
            qnas: [],
            modules: [],
        },
        mutate: vi.fn(),
    }),
    useQueryCourseReviewsSwr: () => ({ data: { total: 0, nodes: [] } }),
    useQueryMyCartSwr: () => ({ data: mocks.cartRows }),
    useMutateAddToCartSwr: () => ({ trigger: mocks.add, isMutating: false }),
    useMutateRemoveFromCartSwr: () => ({ trigger: mocks.remove, isMutating: false }),
    useMutateCoursesCheckoutSwr: () => ({ trigger: mocks.checkout, isMutating: false }),
    useMutateStartTrialSwr: () => ({ trigger: mocks.trial, isMutating: false }),
}))
vi.mock("./component", () => {
    type ConnectedActions = {
        readonly trial?: () => void
        readonly addToCart?: () => void
    }
    type ConnectedProps = {
        readonly props?: {
            readonly rail?: {
                readonly intent?: Readonly<Record<string, string>>
            }
        }
        readonly on?: ConnectedActions
    }
    return {
        _CourseDetailPage: (input: ConnectedProps) => (
            <>
                <output data-testid="rail-intent">{JSON.stringify(input.props?.rail?.intent)}</output>
                <button type="button" onClick={input.on?.trial}>Trial intent</button>
                <button type="button" onClick={input.on?.addToCart}>Cart intent</button>
            </>
        ),
    }
})

describe("CourseDetailPage commerce actions", () => {
    beforeEach(() => {
        mocks.sessionToken = "session-token"
        mocks.cartRows = []
        vi.clearAllMocks()
    })

    it("resolves all five intent labels at the connected boundary", () => {
        render(<CourseDetailPage displayId="system-design-mastery" />)
        expect(screen.getByTestId("rail-intent")).toHaveTextContent(JSON.stringify({
            purchaseTitle: "purchaseTitle",
            purchaseDescription: "purchaseDescription",
            trialTitle: "trialTitle",
            trialDescription: "trialDescription",
            phaseDisclosureLabel: "phaseDisclosureLabel",
        }))
    })

    it.each(["Trial intent", "Cart intent"])("sends a guest to authentication before %s", (intent) => {
        mocks.sessionToken = undefined
        render(<CourseDetailPage displayId="system-design-mastery" />)
        fireEvent.click(screen.getByRole("button", { name: intent }))
        expect(mocks.push).toHaveBeenCalledWith("/authentication")
        expect(mocks.trial).not.toHaveBeenCalled()
        expect(mocks.add).not.toHaveBeenCalled()
    })

    it("enters learning only after startTrial reports business success", async () => {
        mocks.trial.mockResolvedValueOnce({ data: { startTrial: { success: true } } })
        render(<CourseDetailPage displayId="system-design-mastery" />)
        fireEvent.click(screen.getByRole("button", { name: "Trial intent" }))
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/courses/system-design-mastery/learn/content"))
    })

    it("stays on the course when startTrial is rejected", async () => {
        mocks.trial.mockResolvedValueOnce({ data: { startTrial: { success: false } } })
        render(<CourseDetailPage displayId="system-design-mastery" />)
        fireEvent.click(screen.getByRole("button", { name: "Trial intent" }))
        await waitFor(() => expect(mocks.trial).toHaveBeenCalledWith({ courseId: "course-1" }))
        expect(mocks.push).not.toHaveBeenCalled()
    })

    it("refreshes shared cart state only after a successful add", async () => {
        mocks.add.mockResolvedValueOnce({ data: { addToCart: { success: true } } })
        render(<CourseDetailPage displayId="system-design-mastery" />)
        fireEvent.click(screen.getByRole("button", { name: "Cart intent" }))
        await waitFor(() => expect(mocks.mutate).toHaveBeenCalledOnce())
        expect(mocks.add).toHaveBeenCalledWith({ courseId: "course-1" })
        expect(mocks.remove).not.toHaveBeenCalled()
    })

    it("dispatches remove for an existing cart row and ignores business rejection", async () => {
        mocks.cartRows = [{ courseId: "course-1" }]
        mocks.remove.mockResolvedValueOnce({ data: { removeFromCart: { success: false } } })
        render(<CourseDetailPage displayId="system-design-mastery" />)
        fireEvent.click(screen.getByRole("button", { name: "Cart intent" }))
        await waitFor(() => expect(mocks.remove).toHaveBeenCalledWith({ courseId: "course-1" }))
        expect(mocks.add).not.toHaveBeenCalled()
        expect(mocks.mutate).not.toHaveBeenCalled()
    })
})
