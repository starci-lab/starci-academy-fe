import { act, render } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type TestInput = { blockState: string; on: { checkout: () => void; clearAll: () => void; goHome: () => void; browse: () => void } }
const mocks = vi.hoisted(() => ({
    input: undefined as TestInput | undefined,
    token: "token" as string | undefined,
    cart: { data: undefined as unknown, error: undefined as unknown, isLoading: false, mutate: vi.fn() },
    preview: { data: undefined as unknown, error: undefined as unknown },
    clear: { trigger: vi.fn() }, checkout: { trigger: vi.fn() }, cacheMutate: vi.fn(), push: vi.fn(),
}))

vi.mock("next-intl", () => ({ useLocale: () => "en", useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks/auth/useSessionToken", () => ({ useSessionToken: () => mocks.token }))
vi.mock("swr", () => ({ useSWRConfig: () => ({ mutate: mocks.cacheMutate }) }))
vi.mock("@/hooks", () => ({
    useQueryMyCartSwr: () => mocks.cart,
    useQueryCoursesCheckoutPreviewSwr: () => mocks.preview,
    useMutateClearCartSwr: () => mocks.clear,
    useMutateCoursesCheckoutSwr: () => mocks.checkout,
}))
vi.mock("./component", () => ({ CartBlockBase: (input: TestInput) => { mocks.input = input; return <output data-testid="cart" /> } }))

import { CartBlock } from "./index"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.input = undefined
    mocks.token = "token"
    mocks.cart.data = undefined
    mocks.cart.error = undefined
    mocks.cart.isLoading = false
    mocks.preview.data = undefined
    mocks.preview.error = undefined
})

describe("CartBlock", () => {
    it("maps cart states and dispatches browse, clear and checkout actions", () => {
        mocks.cart.isLoading = true
        const view = render(<CartBlock />)
        expect(mocks.input?.blockState).toBe("pending")
        mocks.cart.isLoading = false
        mocks.cart.data = []
        view.rerender(<CartBlock />)
        expect(mocks.input?.blockState).toBe("empty")
        mocks.cart.data = [{ courseId: "c1", course: { title: "Course", coverImageUrl: null } }]
        mocks.preview.data = { lines: [{ courseId: "c1", chargedVnd: 80, listVnd: 100, discountPercent: 20 }], installmentOptions: [], totalListVnd: 100, savingsVnd: 20, totalChargedVnd: 80 }
        mocks.clear.trigger.mockResolvedValue({ data: { clearCart: { success: true } } })
        mocks.checkout.trigger.mockResolvedValue({ data: { coursesCheckout: { data: { checkoutUrl: "" } } } })
        view.rerender(<CartBlock />)
        expect(mocks.input?.blockState).toBe("ready")
        act(() => { mocks.input?.on.goHome(); mocks.input?.on.browse(); mocks.input?.on.clearAll(); mocks.input?.on.checkout() })
        expect(mocks.push).toHaveBeenCalledWith("/dashboard")
        expect(mocks.clear.trigger).toHaveBeenCalled()
        expect(mocks.checkout.trigger).toHaveBeenCalled()
        mocks.token = undefined
        view.rerender(<CartBlock />)
        expect(mocks.input?.blockState).toBe("failed")
        act(() => { mocks.input?.on.browse() })
        expect(mocks.push).toHaveBeenCalledWith("/authentication")
    })
})
