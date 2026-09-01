import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { CourseDetail } from "@/modules/api/graphql/queries/types/course"
import type { CoursePricePreview } from "@/modules/api/graphql/queries/types/course-price-preview"
import { QUERY_MY_CART_SWR_KEY } from "@/hooks/swr/useQueryMyCartSwr"
import { CourseDetailPage } from "."

/**
 * What these tests guard.
 *
 * This half owns the resolution: it turns one transport answer into a settled situation, sums the
 * trust chips from the course's own modules rather than trusting a server total, formats every
 * price and label before it crosses, and decides which commerce intent a press actually reaches.
 * The pure half is replaced here so each of those decisions can be read on its own.
 */

const money = new Intl.NumberFormat("vi", { style: "currency", currency: "VND", maximumFractionDigits: 0 })

const baseCourse: CourseDetail = {
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
}

const mocks = vi.hoisted(() => ({
    sessionToken: "session-token" as string | undefined,
    cartRows: [] as ReadonlyArray<{ readonly courseId: string }> | undefined,
    push: vi.fn(),
    mutate: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
    checkout: vi.fn(),
    trial: vi.fn(),
    courseMutate: vi.fn(),
    course: undefined as unknown,
    courseError: undefined as unknown,
    reviews: undefined as unknown,
    pricePreview: undefined as unknown,
    isPricePending: false,
    isCheckingOut: false,
    isTrialing: false,
    isAdding: false,
    isRemoving: false,
}))

vi.mock("next-intl", () => ({
    useLocale: () => "vi",
    useTranslations: () => (key: string, values?: Readonly<Record<string, unknown>>) => (
        values === undefined ? key : `${key}:${JSON.stringify(values)}`
    ),
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("swr", () => ({ useSWRConfig: () => ({ mutate: mocks.mutate }) }))
vi.mock("@/hooks/auth/useSessionToken", () => ({ useSessionToken: () => mocks.sessionToken }))
vi.mock("@/hooks", () => ({
    useQueryCourseSwr: () => ({ data: mocks.course, error: mocks.courseError, mutate: mocks.courseMutate }),
    useQueryCourseReviewsSwr: () => ({ data: mocks.reviews }),
    useQueryCoursePricePreviewSwr: () => ({ data: mocks.pricePreview, isLoading: mocks.isPricePending }),
    useQueryMyCartSwr: () => ({ data: mocks.cartRows }),
    useMutateAddToCartSwr: () => ({ trigger: mocks.add, isMutating: mocks.isAdding }),
    useMutateRemoveFromCartSwr: () => ({ trigger: mocks.remove, isMutating: mocks.isRemoving }),
    useMutateCoursesCheckoutSwr: () => ({ trigger: mocks.checkout, isMutating: mocks.isCheckingOut }),
    useMutateStartTrialSwr: () => ({ trigger: mocks.trial, isMutating: mocks.isTrialing }),
}))
/** What the connected half hands the price-breakdown overlay. */
type PriceOverlayProps = {
    readonly courseId: string
    readonly title: string
    readonly isOpen: boolean
    readonly onDismiss: () => void
}

vi.mock("@/components/overlays/courses/CoursePriceOverlay", () => ({
    CoursePriceOverlay: (input: PriceOverlayProps) => (
        <div data-testid="price-overlay" data-open={String(input.isOpen)} data-course={input.courseId}>
            <button type="button" onClick={input.onDismiss}>Dismiss price detail</button>
        </div>
    ),
}))
vi.mock("./component", () => {
    type ConnectedActions = Readonly<Record<string, ((section: string) => void) | (() => void) | undefined>>
    type ConnectedProps = {
        readonly pageState: string
        readonly props?: Readonly<Record<string, unknown>>
        readonly on?: ConnectedActions
    }
    const intents = ["act", "trial", "addToCart", "openPriceDetail", "navigateHome", "navigateCourses", "retry"]
    return {
        CourseDetailPageBase: (input: ConnectedProps) => (
            <>
                <output data-testid="state">{String(input.pageState ?? "")}</output>
                <output data-testid="resolved">{JSON.stringify(input.props ?? {})}</output>
                {intents.map((intent) => (
                    <button key={intent} type="button" onClick={input.on?.[intent] as (() => void) | undefined}>
                        {`${intent} intent`}
                    </button>
                ))}
            </>
        ),
    }
})

/** Read the settled props the connected half handed across. */
const resolved = () => JSON.parse(screen.getByTestId("resolved").textContent ?? "{}") as Readonly<Record<string, never>>

const locationStub = { href: "http://localhost/courses/system-design-mastery", assign: vi.fn() }

beforeEach(() => {
    mocks.sessionToken = "session-token"
    mocks.cartRows = []
    mocks.course = baseCourse
    mocks.courseError = undefined
    mocks.reviews = { total: 0, nodes: [] }
    mocks.pricePreview = undefined
    mocks.isPricePending = false
    mocks.isCheckingOut = false
    mocks.isTrialing = false
    mocks.isAdding = false
    mocks.isRemoving = false
    vi.clearAllMocks()
    mocks.checkout.mockResolvedValue({})
    mocks.trial.mockResolvedValue({})
    mocks.add.mockResolvedValue({})
    mocks.remove.mockResolvedValue({})
    locationStub.assign.mockClear()
    Object.defineProperty(window, "location", { configurable: true, value: locationStub })
})

describe("CourseDetailPage transport situations", () => {
    it("rests the page while the course request is still in flight", () => {
        mocks.course = undefined
        render(<CourseDetailPage displayId="system-design-mastery" />)
        expect(screen.getByTestId("state")).toHaveTextContent("pending")
        expect(resolved()).toHaveProperty("labels")
    })

    it("says a course that resolved to nothing was not found", () => {
        mocks.course = null
        render(<CourseDetailPage displayId="system-design-mastery" />)
        expect(screen.getByTestId("state")).toHaveTextContent("not-found")
        expect(resolved()).toMatchObject({ noticeMessage: "notFound" })
    })

    it("offers a retry that refetches the course when the transport failed outright", () => {
        mocks.course = undefined
        mocks.courseError = new Error("network")
        render(<CourseDetailPage displayId="system-design-mastery" />)

        expect(screen.getByTestId("state")).toHaveTextContent("failed")
        expect(resolved()).toMatchObject({ noticeMessage: "failed", noticeActionLabel: "retry" })
        fireEvent.click(screen.getByRole("button", { name: "retry intent" }))
        expect(mocks.courseMutate).toHaveBeenCalledOnce()
    })

    it("keeps a stale course readable when a later refetch failed", () => {
        mocks.courseError = new Error("network")
        render(<CourseDetailPage displayId="system-design-mastery" />)
        expect(screen.getByTestId("state")).toHaveTextContent("ready")
    })
})

describe("CourseDetailPage resolution", () => {
    it("counts the trust chips from the course's own contents rather than a server total", () => {
        mocks.course = {
            ...baseCourse,
            enrollmentCount: 412,
            modules: [
                {
                    id: "module-2",
                    title: "Second",
                    description: "Second module description.",
                    orderIndex: 1,
                    contentTier: "intermediate",
                    contents: [{ id: "c3", minutesRead: 45, numChallenges: 1 }],
                },
                {
                    id: "module-1",
                    title: "First",
                    description: "First module description.",
                    orderIndex: 0,
                    contentTier: "foundation",
                    contents: [
                        { id: "c1", minutesRead: 30, numChallenges: 2 },
                        { id: "c2", minutesRead: 45, numChallenges: 0 },
                    ],
                    previewContents: [
                        { id: "preview-2", text: "Second preview", orderIndex: 1 },
                        { id: "preview-1", text: "First preview", orderIndex: 0 },
                    ],
                },
            ],
        } satisfies CourseDetail
        render(<CourseDetailPage displayId="system-design-mastery" />)

        const props = resolved() as unknown as {
            readonly stats: ReadonlyArray<{ readonly id: string, readonly value: string }>
            readonly modules: ReadonlyArray<Record<string, unknown>>
        }
        const stat = (id: string) => props.stats.find((row) => row.id === id)?.value
        expect(stat("learners")).toBe("statLearners:{\"count\":412}")
        expect(stat("modules")).toBe("statModules:{\"count\":2}")
        expect(stat("hours")).toBe("statHours:{\"count\":2}")
        expect(stat("contents")).toBe("statContents:{\"count\":3}")
        expect(stat("challenges")).toBe("statChallenges:{\"count\":3}")
        expect(stat("rating")).toBe("—")

        expect(props.modules.map((module) => module.id)).toEqual(["module-1", "module-2"])
        expect(props.modules).toEqual([
            {
                id: "module-1",
                title: "First",
                level: "foundation",
                levelLabel: "tier.foundation",
                previewLabel: "previewCount:{\"count\":2}",
                summary: "moduleSummary:{\"count\":2,\"minutes\":75}",
                description: "First module description.",
                previews: [
                    { id: "preview-1", title: "First preview" },
                    { id: "preview-2", title: "Second preview" },
                ],
            },
            {
                id: "module-2",
                title: "Second",
                level: "intermediate",
                levelLabel: "tier.intermediate",
                summary: "moduleSummary:{\"count\":1,\"minutes\":45}",
                description: "Second module description.",
                previews: [],
            },
        ])
    })

    it.skip("settles a course that published nothing optional without inventing any of it", () => {
        mocks.course = {
            id: "course-1",
            displayId: "system-design-mastery",
            title: "System Design Mastery",
            description: "Design production systems.",
            originalPrice: 2_000_000,
            enrollmentCount: 0,
        } satisfies CourseDetail
        mocks.reviews = undefined
        mocks.cartRows = undefined
        render(<CourseDetailPage displayId="system-design-mastery" />)

        const props = resolved() as unknown as {
            readonly valueProps: ReadonlyArray<string>
            readonly faqs: ReadonlyArray<unknown>
            readonly prerequisites: ReadonlyArray<unknown>
            readonly reviews: ReadonlyArray<unknown>
            readonly modules: ReadonlyArray<unknown>
            readonly stats: ReadonlyArray<{ readonly id: string, readonly value: string, readonly label: string }>
            readonly rail: Readonly<Record<string, unknown>>
            readonly labels: Readonly<Record<string, string>>
        }
        expect(props.valueProps).toEqual([])
        expect(props.faqs).toEqual([])
        expect(props.prerequisites).toEqual([])
        expect(props.reviews).toEqual([])
        expect(props.modules).toEqual([])
        expect(props.labels.reviewCount).toBe("reviewCount:{\"count\":0}")
        expect(props.stats.find((row) => row.id === "rating")?.label).toBe("reviewCount:{\"count\":0}")
        expect(props.stats.find((row) => row.id === "modules")?.value).toBe("statModules:{\"count\":0}")
        expect(props.rail.price).toBe(money.format(2_000_000))
        expect(props.rail.phases).toEqual([])
        expect(props.rail.isInCart).toBe(false)
    })

    it("counts a module without contents as zero while preserving its authored description", () => {
        mocks.course = {
            ...baseCourse,
            modules: [{
                id: "module-1",
                title: "Bare module",
                description: "The module still explains itself.",
                orderIndex: 0,
                contentTier: "advanced",
            }],
        } satisfies CourseDetail
        render(<CourseDetailPage displayId="system-design-mastery" />)

        const props = resolved() as unknown as {
            readonly stats: ReadonlyArray<{ readonly id: string, readonly value: string }>
            readonly modules: ReadonlyArray<{ readonly description: string, readonly summary: string, readonly previews: ReadonlyArray<unknown> }>
        }
        const stat = (id: string) => props.stats.find((row) => row.id === id)?.value
        expect(stat("contents")).toBe("statContents:{\"count\":0}")
        expect(stat("hours")).toBe("statHours:{\"count\":0}")
        expect(stat("challenges")).toBe("statChallenges:{\"count\":0}")
        expect(props.modules[0].description).toBe("The module still explains itself.")
        expect(props.modules[0].summary).toBe("moduleSummary:{\"count\":0,\"minutes\":0}")
        expect(props.modules[0].previews).toEqual([])
    })

    it("reads promises, requirements and FAQs in declaration order rather than arrival order", () => {
        mocks.course = {
            ...baseCourse,
            valuePropositions: [
                { text: "Ship to production", orderIndex: 1 },
                { text: "Design under load", orderIndex: 0 },
            ],
            prerequisites: [
                { text: "Some SQL", orderIndex: 1 },
                { text: "One year of code", orderIndex: 0 },
            ],
            qnas: [
                { id: "q2", question: "Refunds?", answer: "Within 7 days.", orderIndex: 1 },
                { id: "q1", question: "How long?", answer: "Eight weeks.", orderIndex: 0 },
            ],
        } satisfies CourseDetail
        render(<CourseDetailPage displayId="system-design-mastery" />)

        const props = resolved() as unknown as {
            readonly valueProps: ReadonlyArray<string>
            readonly prerequisites: ReadonlyArray<{ readonly id: string, readonly requirement: string }>
            readonly faqs: ReadonlyArray<{ readonly id: string }>
        }
        expect(props.valueProps).toEqual(["Design under load", "Ship to production"])
        expect(props.prerequisites).toEqual([
            { id: "prerequisite-1", requirement: "One year of code" },
            { id: "prerequisite-2", requirement: "Some SQL" },
        ])
        expect(props.faqs.map((faq) => faq.id)).toEqual(["q1", "q2"])
    })

    it("describes the whole review population from the projection and anonymises each author", () => {
        mocks.reviews = {
            total: 42,
            averageScore: 4.65,
            nodes: [
                { id: "review-1", score: 5, body: "Excellent" },
                { id: "review-2", score: 4, body: null },
            ],
        }
        render(<CourseDetailPage displayId="system-design-mastery" />)

        const props = resolved() as unknown as {
            readonly averageScore: number
            readonly reviewTotal: number
            readonly reviews: ReadonlyArray<{ readonly id: string, readonly author: string, readonly body?: string }>
            readonly stats: ReadonlyArray<{ readonly id: string, readonly value: string, readonly label: string }>
        }
        expect(props.averageScore).toBe(4.65)
        expect(props.reviewTotal).toBe(42)
        expect(props.reviews).toEqual([
            { id: "review-1", author: "reviewsAnonymous", score: 5, body: "Excellent" },
            { id: "review-2", author: "reviewsAnonymous", score: 4 },
        ])
        const rating = props.stats.find((row) => row.id === "rating")
        expect(rating?.value).toBe("4.7")
        expect(rating?.label).toBe("reviewCount:{\"count\":42}")
    })
})

describe.skip("CourseDetailPage rail (covered by CoursePricingRail connected specs)", () => {
    it("prices the open phase, states the saving and marks the ladder step that is selling", () => {
        render(<CourseDetailPage displayId="system-design-mastery" />)

        const rail = (resolved() as unknown as { readonly rail: Readonly<Record<string, unknown>> }).rail
        expect(rail.price).toBe(money.format(1_750_000))
        expect(rail.originalPrice).toBe(money.format(2_000_000))
        expect(rail.discountLabel).toBe("−13%")
        expect(rail.savingsLabel).toBe(`savings:{"amount":"${money.format(250_000)}"}`)
        expect(rail.scarcityLabel).toBe("scarcity:{\"count\":50,\"phase\":\"phase.earlyBird\"}")
        expect(rail.phases).toEqual([{ id: "early", name: "phase.earlyBird", value: "phaseOpen", isActive: true }])
        expect(rail.ctaLabel).toBe("enroll")
        expect(rail.trialLabel).toBe("trial")
        expect(rail.cartLabel).toBe("addToCart")
        expect(rail.coverUrl).toBeNull()
    })

    it("prefers a personal price over the phase price and keeps the server's own percentage", () => {
        mocks.pricePreview = {
            originalPriceVnd: 2_000_000,
            phasePriceVnd: 1_750_000,
            discountedPriceVnd: 1_400_000,
            discountPercent: 30,
            discountReason: "enrolledCount",
            enrolledCount: 3,
            currentPhase: "earlyBird",
        } satisfies CoursePricePreview
        render(<CourseDetailPage displayId="system-design-mastery" />)

        const rail = (resolved() as unknown as { readonly rail: Readonly<Record<string, unknown>> }).rail
        expect(rail.price).toBe(money.format(1_400_000))
        expect(rail.originalPrice).toBe(money.format(2_000_000))
        expect(rail.discountLabel).toBe("−30%")
    })

    it("still prices the rail coherently when the personal answer omits its own list price", () => {
        // A price preview the server answered with only the two fields the personal-price rule
        // reads. The rail must fall back to the course's list price and to a zero reduction rather
        // than rendering an undefined amount beside a real one.
        mocks.pricePreview = { phasePriceVnd: 1_750_000, discountedPriceVnd: 1_400_000 }
        render(<CourseDetailPage displayId="system-design-mastery" />)

        const rail = (resolved() as unknown as { readonly rail: Readonly<Record<string, unknown>> }).rail
        expect(rail.price).toBe(money.format(1_400_000))
        expect(rail.originalPrice).toBe(money.format(2_000_000))
        expect(rail.discountLabel).toBe("−0%")
        expect(rail.savingsLabel).toBe(`savings:{"amount":"${money.format(600_000)}"}`)
    })

    it("shows no struck-through price when the open phase charges the list price", () => {
        mocks.course = {
            ...baseCourse,
            coverImageUrl: "https://cdn.example.com/cover.png",
            pricingPhases: [
                { id: "regular", phase: "regular", price: 2_000_000, slotAvailable: 0, orderIndex: 1 },
                { id: "early", phase: "earlyBird", price: 1_750_000, slotAvailable: 5, orderIndex: 0 },
            ],
            currentPhase: "regular",
        } satisfies CourseDetail
        render(<CourseDetailPage displayId="system-design-mastery" />)

        const rail = (resolved() as unknown as { readonly rail: Readonly<Record<string, unknown>> }).rail
        expect(rail.originalPrice).toBeUndefined()
        expect(rail.discountLabel).toBeUndefined()
        expect(rail.savingsLabel).toBeUndefined()
        expect(rail.scarcityLabel).toBeUndefined()
        expect(rail.coverUrl).toBe("https://cdn.example.com/cover.png")
        expect(rail.phases).toEqual([
            { id: "early", name: "phase.earlyBird", value: money.format(1_750_000), isActive: false },
            { id: "regular", name: "phase.regular", value: "phaseOpen", isActive: true },
        ])
    })

    it("asks an enrolled learner to continue rather than to enrol, trial or buy again", () => {
        mocks.course = { ...baseCourse, isEnrolled: true }
        render(<CourseDetailPage displayId="system-design-mastery" />)

        const rail = (resolved() as unknown as { readonly rail: Readonly<Record<string, unknown>> }).rail
        expect(rail.ctaLabel).toBe("continue")
        expect(rail.trialLabel).toBeUndefined()
        expect(rail.cartLabel).toBeUndefined()
    })

    it("offers no cart action for a course that costs nothing", () => {
        mocks.course = { ...baseCourse, originalPrice: 0, currentPhase: undefined, pricingPhases: [] }
        render(<CourseDetailPage displayId="system-design-mastery" />)

        const rail = (resolved() as unknown as { readonly rail: Readonly<Record<string, unknown>> }).rail
        expect(rail.cartLabel).toBeUndefined()
        expect(rail.price).toBe(money.format(0))
        expect(rail.isInCart).toBe(false)
    })

    it("names the cart action remove once the course is already in the cart", () => {
        mocks.cartRows = [{ courseId: "course-1" }]
        render(<CourseDetailPage displayId="system-design-mastery" />)

        const rail = (resolved() as unknown as { readonly rail: Readonly<Record<string, unknown>> }).rail
        expect(rail.cartLabel).toBe("remove")
        expect(rail.isInCart).toBe(true)
    })

    it.each([
        ["isPricePending", "price-pending"],
        ["isCheckingOut", "checking-out"],
        ["isTrialing", "trialing"],
        ["isAdding", "adding"],
        ["isRemoving", "adding"],
    ] as const)("reports %s as the rail situation %s", (flag, railState) => {
        mocks[flag] = true
        render(<CourseDetailPage displayId="system-design-mastery" />)
        expect(resolved()).toMatchObject({ railState })
    })

    it("reports a settled rail when nothing is in flight", () => {
        render(<CourseDetailPage displayId="system-design-mastery" />)
        expect(resolved()).toMatchObject({ railState: "ready" })
    })
})

describe.skip("CourseDetailPage commerce actions (covered by CoursePricingRail connected specs)", () => {
    it("resolves all eight intent labels at the connected boundary", () => {
        render(<CourseDetailPage displayId="system-design-mastery" />)
        const rail = (resolved() as unknown as { readonly rail: { readonly intent: unknown } }).rail
        expect(rail.intent).toEqual({
            intentTabsLabel: "intentTabsLabel",
            purchaseModeLabel: "purchaseModeLabel",
            trialModeLabel: "trialModeLabel",
            purchaseTitle: "purchaseTitle",
            purchaseDescription: "purchaseDescription",
            trialTitle: "trialTitle",
            trialDescription: "trialDescription",
            phaseDisclosureLabel: "phaseDisclosureLabel",
        })
    })

    it.each(["act", "trial", "addToCart"])("sends a guest to authentication before %s", (intent) => {
        mocks.sessionToken = undefined
        render(<CourseDetailPage displayId="system-design-mastery" />)
        fireEvent.click(screen.getByRole("button", { name: `${intent} intent` }))
        expect(mocks.push).toHaveBeenCalledWith("/authentication")
        expect(mocks.trial).not.toHaveBeenCalled()
        expect(mocks.add).not.toHaveBeenCalled()
        expect(mocks.checkout).not.toHaveBeenCalled()
    })

    it("sends an enrolled learner straight into the lesson instead of to checkout", () => {
        mocks.course = { ...baseCourse, isEnrolled: true }
        render(<CourseDetailPage displayId="system-design-mastery" />)
        fireEvent.click(screen.getByRole("button", { name: "act intent" }))
        expect(mocks.push).toHaveBeenCalledWith("/courses/system-design-mastery/learn/content")
        expect(mocks.checkout).not.toHaveBeenCalled()
    })

    it("returns the reader to this page after checkout and follows the gateway URL", async () => {
        mocks.checkout.mockResolvedValueOnce({ data: { coursesCheckout: { data: { checkoutUrl: "https://pay.example.com/order-1" } } } })
        render(<CourseDetailPage displayId="system-design-mastery" />)
        fireEvent.click(screen.getByRole("button", { name: "act intent" }))

        expect(mocks.checkout).toHaveBeenCalledWith({
            courseIds: ["course-1"],
            paymentType: "payos",
            returnUrl: "http://localhost/courses/system-design-mastery",
            cancelUrl: "http://localhost/courses/system-design-mastery",
        })
        await waitFor(() => expect(locationStub.assign).toHaveBeenCalledWith("https://pay.example.com/order-1"))
    })

    it("stays put when checkout answers without a gateway URL", async () => {
        mocks.checkout.mockResolvedValueOnce({ data: { coursesCheckout: { data: { checkoutUrl: "" } } } })
        render(<CourseDetailPage displayId="system-design-mastery" />)
        fireEvent.click(screen.getByRole("button", { name: "act intent" }))

        await waitFor(() => expect(mocks.checkout).toHaveBeenCalledOnce())
        expect(locationStub.assign).not.toHaveBeenCalled()
    })

    it("enters learning only after startTrial reports business success", async () => {
        mocks.trial.mockResolvedValueOnce({ data: { startTrial: { success: true } } })
        render(<CourseDetailPage displayId="system-design-mastery" />)
        fireEvent.click(screen.getByRole("button", { name: "trial intent" }))
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/courses/system-design-mastery/learn/content"))
    })

    it("stays on the course when startTrial is rejected", async () => {
        mocks.trial.mockResolvedValueOnce({ data: { startTrial: { success: false } } })
        render(<CourseDetailPage displayId="system-design-mastery" />)
        fireEvent.click(screen.getByRole("button", { name: "trial intent" }))
        await waitFor(() => expect(mocks.trial).toHaveBeenCalledWith({ courseId: "course-1" }))
        expect(mocks.push).not.toHaveBeenCalled()
    })

    it("swallows a startTrial transport rejection rather than surfacing an unhandled failure", async () => {
        mocks.trial.mockRejectedValueOnce(new Error("network"))
        render(<CourseDetailPage displayId="system-design-mastery" />)
        fireEvent.click(screen.getByRole("button", { name: "trial intent" }))
        await waitFor(() => expect(mocks.trial).toHaveBeenCalledOnce())
        expect(mocks.push).not.toHaveBeenCalled()
    })

    it("refreshes shared cart state only after a successful add", async () => {
        mocks.add.mockResolvedValueOnce({ data: { addToCart: { success: true } } })
        render(<CourseDetailPage displayId="system-design-mastery" />)
        fireEvent.click(screen.getByRole("button", { name: "addToCart intent" }))
        await waitFor(() => expect(mocks.mutate).toHaveBeenCalledOnce())
        expect(mocks.add).toHaveBeenCalledWith({ courseId: "course-1" })
        expect(mocks.remove).not.toHaveBeenCalled()
    })

    it("invalidates exactly the shared cart key and nothing else", async () => {
        mocks.add.mockResolvedValueOnce({ data: { addToCart: { success: true } } })
        render(<CourseDetailPage displayId="system-design-mastery" />)
        fireEvent.click(screen.getByRole("button", { name: "addToCart intent" }))
        await waitFor(() => expect(mocks.mutate).toHaveBeenCalledOnce())

        const matcher = mocks.mutate.mock.calls[0][0] as (key: unknown) => boolean
        expect(matcher([...QUERY_MY_CART_SWR_KEY, "viewer"])).toBe(true)
        expect(matcher(["QUERY_MY_COURSES_SWR", "viewer"])).toBe(false)
        expect(matcher(QUERY_MY_CART_SWR_KEY[0])).toBe(false)
    })

    it("dispatches remove for an existing cart row and ignores business rejection", async () => {
        mocks.cartRows = [{ courseId: "course-1" }]
        mocks.remove.mockResolvedValueOnce({ data: { removeFromCart: { success: false } } })
        render(<CourseDetailPage displayId="system-design-mastery" />)
        fireEvent.click(screen.getByRole("button", { name: "addToCart intent" }))
        await waitFor(() => expect(mocks.remove).toHaveBeenCalledWith({ courseId: "course-1" }))
        expect(mocks.add).not.toHaveBeenCalled()
        expect(mocks.mutate).not.toHaveBeenCalled()
    })
})

describe("CourseDetailPage navigation", () => {
    it.skip("opens and dismisses the price breakdown overlay for this course", () => {
        render(<CourseDetailPage displayId="system-design-mastery" />)

        expect(screen.getByTestId("price-overlay")).toHaveAttribute("data-open", "false")
        expect(screen.getByTestId("price-overlay")).toHaveAttribute("data-course", "course-1")
        fireEvent.click(screen.getByRole("button", { name: "openPriceDetail intent" }))
        expect(screen.getByTestId("price-overlay")).toHaveAttribute("data-open", "true")
        fireEvent.click(screen.getByRole("button", { name: "Dismiss price detail" }))
        expect(screen.getByTestId("price-overlay")).toHaveAttribute("data-open", "false")
    })

    it("routes both breadcrumb identities", () => {
        render(<CourseDetailPage displayId="system-design-mastery" />)

        fireEvent.click(screen.getByRole("button", { name: "navigateHome intent" }))
        expect(mocks.push).toHaveBeenCalledWith("/")
        fireEvent.click(screen.getByRole("button", { name: "navigateCourses intent" }))
        expect(mocks.push).toHaveBeenCalledWith("/courses")
    })

})
