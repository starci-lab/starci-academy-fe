import { act, render } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type TestInput = {
    blockState: string
    data: { planName?: string; purchaseState: string; isSignedOut: boolean; payment?: { isOpen: boolean } }
    on: { goHome: () => void; purchase: () => void; retry: () => void; pay: () => void; dismissPayment: () => void }
}
const mocks = vi.hoisted(() => ({
    input: undefined as TestInput | undefined,
    token: "token" as string | undefined,
    offer: { data: undefined as unknown, isLoading: false, error: undefined as unknown, mutate: vi.fn() },
    subscription: { data: undefined as unknown, isLoading: false, error: undefined as unknown, mutate: vi.fn() },
    purchase: { trigger: vi.fn(), isMutating: false },
    push: vi.fn(),
    searchParams: new URLSearchParams(),
}))

vi.mock("next-intl", () => ({ useLocale: () => "en", useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("next/navigation", () => ({ useSearchParams: () => mocks.searchParams }))
vi.mock("@/hooks/auth/useSessionToken", () => ({ useSessionToken: () => mocks.token }))
vi.mock("@/modules/toast/hooks", () => ({
    useGraphQLWithToast: () => async (action: () => Promise<unknown>) => {
        await action()
        return true
    },
}))
vi.mock("@/hooks", () => ({
    useQueryProOfferSwr: () => mocks.offer,
    useQueryMyProSubscriptionSwr: () => mocks.subscription,
    useMutatePurchaseProSubscriptionSwr: () => mocks.purchase,
}))
vi.mock("./component", () => ({
    ProSubscriptionBlockBase: (input: TestInput) => { mocks.input = input; return <output data-testid="pro-subscription" /> },
}))

import { ProSubscriptionBlock } from "./index"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.input = undefined
    mocks.token = "token"
    mocks.offer.data = undefined
    mocks.offer.isLoading = false
    mocks.offer.error = undefined
    mocks.subscription.data = undefined
    mocks.subscription.isLoading = false
    mocks.subscription.error = undefined
    mocks.purchase.isMutating = false
    mocks.searchParams = new URLSearchParams()
})

describe("ProSubscriptionBlock", () => {
    it("maps offer and subscription reads to the pending, ready and eligible states", () => {
        mocks.offer.isLoading = true
        const view = render(<ProSubscriptionBlock />)
        expect(mocks.input?.blockState).toBe("pending")

        mocks.offer.isLoading = false
        mocks.offer.data = { enabled: true, priceVnd: 229000, displayName: "StarCi Pro" }
        mocks.subscription.data = { active: false, subscription: undefined }
        view.rerender(<ProSubscriptionBlock />)
        expect(mocks.input?.blockState).toBe("ready")
        expect(mocks.input?.data.purchaseState).toBe("eligible")
        expect(mocks.input?.data.isSignedOut).toBe(false)
    })

    it("reports a failed block state when the offer cannot load", () => {
        mocks.offer.error = new Error("offer down")
        render(<ProSubscriptionBlock />)
        expect(mocks.input?.blockState).toBe("failed")
    })

    it("reports an active subscriber and suppresses another purchase attempt", () => {
        mocks.offer.data = { enabled: true, priceVnd: 229000, displayName: "StarCi Pro" }
        mocks.subscription.data = { active: true, subscription: undefined }
        render(<ProSubscriptionBlock />)
        expect(mocks.input?.data.purchaseState).toBe("active")
    })

    it("routes a signed-out purchase intent to authentication instead of opening checkout", () => {
        mocks.token = undefined
        mocks.offer.data = { enabled: true, priceVnd: 229000, displayName: "StarCi Pro" }
        render(<ProSubscriptionBlock />)
        act(() => { mocks.input?.on.purchase() })
        expect(mocks.push).toHaveBeenCalledWith("/authentication")
        expect(mocks.input?.data.payment?.isOpen).not.toBe(true)
    })

    it("opens the checkout surface for a signed-in purchase intent", () => {
        mocks.offer.data = { enabled: true, priceVnd: 229000, displayName: "StarCi Pro" }
        mocks.subscription.data = { active: false, subscription: undefined }
        render(<ProSubscriptionBlock />)
        act(() => { mocks.input?.on.purchase() })
        expect(mocks.input?.data.payment?.isOpen).toBe(true)
    })

    it("navigates home and retries the offer and subscription reads", () => {
        mocks.offer.data = { enabled: true, priceVnd: 229000, displayName: "StarCi Pro" }
        mocks.subscription.data = { active: false, subscription: undefined }
        render(<ProSubscriptionBlock />)
        act(() => { mocks.input?.on.goHome() })
        expect(mocks.push).toHaveBeenCalledWith("/")
        act(() => { mocks.input?.on.retry() })
        expect(mocks.offer.mutate).toHaveBeenCalledOnce()
        expect(mocks.subscription.mutate).toHaveBeenCalledOnce()
    })
})
