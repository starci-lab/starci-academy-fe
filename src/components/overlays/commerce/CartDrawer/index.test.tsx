import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CartDrawer } from "."

/**
 * What these tests guard.
 *
 * A SIGNED-OUT READER HAS NO EMPTY BASKET, THEY HAVE NO BASKET. The cart query is viewer-scoped, so
 * without a token its key is null and it never fires - leaving no data and no error, which an
 * unguarded read turns into "your basket is empty". That situation is a refusal with its own copy
 * and its own way out.
 *
 * BOTH WAYS THROUGH CLOSE THE PANEL FIRST, because a drawer left open over the page it just
 * navigated to is a backdrop the reader has to dismiss before reading what they asked for.
 */

const mocks = vi.hoisted(() => ({
    token: "session-token" as string | undefined,
    cart: undefined as unknown,
    cartLoading: false,
    cartError: undefined as unknown,
    cartMutate: vi.fn(),
    preview: undefined as unknown,
    previewError: undefined as unknown,
    push: vi.fn(),
}))

vi.mock("next-intl", () => ({
    useLocale: () => "vi",
    useTranslations: () => (key: string, values?: Readonly<Record<string, unknown>>) => (
        values === undefined ? key : `${key}:${JSON.stringify(values)}`
    ),
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks/auth/useSessionToken", () => ({ useSessionToken: () => mocks.token }))
vi.mock("@/hooks", () => ({
    useQueryMyCartSwr: () => ({
        data: mocks.cart,
        isLoading: mocks.cartLoading,
        error: mocks.cartError,
        mutate: mocks.cartMutate,
    }),
    useQueryCoursesCheckoutPreviewSwr: () => ({ data: mocks.preview, error: mocks.previewError }),
}))

type DrawerStub = {
    readonly state: string
    readonly props: Readonly<Record<string, unknown>>
    readonly on?: Readonly<Record<string, (() => void) | undefined>>
}

vi.mock("./component", () => ({
    _CartDrawer: (input: DrawerStub) => (
        <>
            <output data-testid="state">{input.state}</output>
            <output data-testid="props">{JSON.stringify(input.props)}</output>
            <button type="button" onClick={input.on?.checkout}>checkout</button>
            <button type="button" onClick={input.on?.viewFullCart}>view full cart</button>
            <button type="button" onClick={input.on?.browse}>browse</button>
            <button type="button" onClick={input.on?.dismiss}>dismiss</button>
        </>
    ),
}))

const money = new Intl.NumberFormat("vi", { style: "currency", currency: "VND", maximumFractionDigits: 0 })

const resolved = () => JSON.parse(screen.getByTestId("props").textContent ?? "{}") as {
    readonly labels: Readonly<Record<string, string>>
    readonly lines: ReadonlyArray<Readonly<Record<string, string | null>>>
    readonly subtotal?: string
    readonly savings?: string
    readonly total?: string
    readonly hasPricingFailed?: boolean
}

const cartRows = [{ courseId: "course-1", course: { title: "System Design Mastery", coverImageUrl: "https://cdn/x.png" } }]

describe("CartDrawer", () => {
    beforeEach(() => {
        mocks.token = "session-token"
        mocks.cart = cartRows
        mocks.cartLoading = false
        mocks.cartError = undefined
        mocks.preview = undefined
        mocks.previewError = undefined
        vi.clearAllMocks()
    })

    it("refuses the basket for a signed-out reader rather than calling it empty", () => {
        mocks.token = undefined
        mocks.cart = undefined
        render(<CartDrawer isOpen onDismiss={vi.fn()} />)

        expect(screen.getByTestId("state")).toHaveTextContent("failed")
        expect(resolved().labels.failedMessage).toBe("signedOutMessage")
        expect(resolved().labels.failedAction).toBe("signedOutAction")
    })

    it("sends a signed-out reader to authentication instead of the catalogue", () => {
        mocks.token = undefined
        mocks.cart = undefined
        const onDismiss = vi.fn()
        render(<CartDrawer isOpen onDismiss={onDismiss} />)

        fireEvent.click(screen.getByRole("button", { name: "browse" }))
        expect(mocks.push).toHaveBeenCalledWith("/authentication")
        expect(onDismiss).not.toHaveBeenCalled()
    })

    it("asks again rather than navigating when a signed-in read failed", () => {
        mocks.cart = undefined
        mocks.cartError = new Error("network")
        render(<CartDrawer isOpen onDismiss={vi.fn()} />)

        expect(screen.getByTestId("state")).toHaveTextContent("failed")
        expect(resolved().labels.failedMessage).toBe("failedMessage")
        fireEvent.click(screen.getByRole("button", { name: "browse" }))
        expect(mocks.cartMutate).toHaveBeenCalledOnce()
        expect(mocks.push).not.toHaveBeenCalled()
    })

    it("closes the panel before sending an empty basket to the catalogue", () => {
        mocks.cart = []
        const onDismiss = vi.fn()
        render(<CartDrawer isOpen onDismiss={onDismiss} />)

        expect(screen.getByTestId("state")).toHaveTextContent("empty")
        fireEvent.click(screen.getByRole("button", { name: "browse" }))
        expect(onDismiss).toHaveBeenCalledOnce()
        expect(mocks.push).toHaveBeenCalledWith("/courses")
    })

    it("rests while the basket is still being read", () => {
        mocks.cart = undefined
        mocks.cartLoading = true
        render(<CartDrawer isOpen onDismiss={vi.fn()} />)
        expect(screen.getByTestId("state")).toHaveTextContent("pending")
    })

    it("prices each line from the shared checkout preview", () => {
        mocks.preview = {
            lines: [{ courseId: "course-1", chargedVnd: 1_400_000, listVnd: 2_000_000, discountPercent: 30 }],
            totalListVnd: 2_000_000,
            savingsVnd: 600_000,
            totalChargedVnd: 1_400_000,
        }
        render(<CartDrawer isOpen onDismiss={vi.fn()} />)

        expect(screen.getByTestId("state")).toHaveTextContent("ready")
        expect(resolved().lines[0]).toMatchObject({
            courseId: "course-1",
            title: "System Design Mastery",
            cover: "https://cdn/x.png",
            price: money.format(1_400_000),
            originalPrice: money.format(2_000_000),
            discountLabel: "discount:{\"percent\":30}",
        })
        expect(resolved().subtotal).toBe(money.format(2_000_000))
        expect(resolved().savings).toBe(`-${money.format(600_000)}`)
        expect(resolved().total).toBe(money.format(1_400_000))
        expect(resolved().labels.title).toBe("drawerTitle:{\"count\":1}")
    })

    it("shows no struck-through price and no saving when the preview took nothing off", () => {
        mocks.cart = [{ courseId: "course-1", course: { title: "System Design Mastery", coverImageUrl: null } }]
        mocks.preview = {
            lines: [{ courseId: "course-1", chargedVnd: 2_000_000, listVnd: 2_000_000, discountPercent: 0 }],
            totalListVnd: 2_000_000,
            savingsVnd: 0,
            totalChargedVnd: 2_000_000,
        }
        render(<CartDrawer isOpen onDismiss={vi.fn()} />)

        expect(resolved().lines[0].originalPrice).toBeUndefined()
        expect(resolved().lines[0].discountLabel).toBeUndefined()
        expect(resolved().lines[0].cover).toBeNull()
        expect(resolved().savings).toBeUndefined()
    })

    it("leaves a line unpriced while the preview has not answered for it", () => {
        mocks.preview = null
        render(<CartDrawer isOpen onDismiss={vi.fn()} />)

        expect(resolved().lines[0].price).toBeUndefined()
        expect(resolved().subtotal).toBeUndefined()
        expect(resolved().total).toBeUndefined()
    })

    it("reports a failed pricing read without hiding the lines", () => {
        mocks.previewError = new Error("network")
        render(<CartDrawer isOpen onDismiss={vi.fn()} />)

        expect(resolved().hasPricingFailed).toBe(true)
        expect(resolved().lines).toHaveLength(1)
    })

    it("closes the panel before both ways through to the deep review", () => {
        const onDismiss = vi.fn()
        render(<CartDrawer isOpen onDismiss={onDismiss} />)

        fireEvent.click(screen.getByRole("button", { name: "checkout" }))
        expect(onDismiss).toHaveBeenCalledTimes(1)
        expect(mocks.push).toHaveBeenLastCalledWith("/cart")

        fireEvent.click(screen.getByRole("button", { name: "view full cart" }))
        expect(onDismiss).toHaveBeenCalledTimes(2)
        expect(mocks.push).toHaveBeenLastCalledWith("/cart")
    })

    it("hands the vendor's own way out straight back to the shell", () => {
        const onDismiss = vi.fn()
        render(<CartDrawer isOpen onDismiss={onDismiss} />)

        fireEvent.click(screen.getByRole("button", { name: "dismiss" }))
        expect(onDismiss).toHaveBeenCalledOnce()
        expect(mocks.push).not.toHaveBeenCalled()
    })
})
