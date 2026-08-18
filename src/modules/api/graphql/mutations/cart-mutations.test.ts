import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import { mutationAddToCart } from "./mutation-add-to-cart"
import { mutationClearCart } from "./mutation-clear-cart"
import { mutationRemoveFromCart } from "./mutation-remove-from-cart"
import { mutationCoursesCheckout } from "./mutation-courses-checkout"
import { mutationStartTrial } from "./mutation-start-trial"

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), createApolloClient: vi.fn() }))

vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.mutate.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ mutate: mocks.mutate })
})

const sentDocument = (index = 0) => print(mocks.mutate.mock.calls[index][0].mutation)

describe("mutationAddToCart", () => {
    it("selects the cart row identity the cart badge reads back", async () => {
        await mutationAddToCart({ courseId: "course-1" })
        const document = sentDocument()
        expect(document).toContain("addToCart(request: $request)")
        expect(document).toContain("courseId")
        expect(document).toContain("id")
    })

    it("uses an authenticated client with no transport overrides when options are omitted", async () => {
        const response = await mutationAddToCart({ courseId: "course-1" })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({ request: { courseId: "course-1" } })
        expect(response).toEqual({ data: undefined })
    })

    it("merges supplied transport options over the authenticated default", async () => {
        const signal = new AbortController().signal
        await mutationAddToCart({ courseId: "course-2" }, { headers: { "x-trace": "a" }, signal, debug: true })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: { "x-trace": "a" },
            signal,
            debug: true,
        })
    })

    it("returns the envelope the transport resolved with", async () => {
        mocks.mutate.mockResolvedValue({ data: { addToCart: { success: true, message: "ok", data: { id: "row-1", courseId: "course-1" } } } })
        await expect(mutationAddToCart({ courseId: "course-1" })).resolves.toEqual({
            data: { addToCart: { success: true, message: "ok", data: { id: "row-1", courseId: "course-1" } } },
        })
    })
})

describe("mutationClearCart", () => {
    it("sends no variables at all, because the token is the argument", async () => {
        await mutationClearCart()
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        expect(mocks.mutate.mock.calls[0][0]).not.toHaveProperty("variables")
        expect(sentDocument()).toContain("removedCount")
    })

    it("still merges transport options when the caller supplies them", async () => {
        await mutationClearCart({ debug: true })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true, debug: true })
    })

    it("returns the removed-row count envelope unchanged", async () => {
        mocks.mutate.mockResolvedValue({ data: { clearCart: { success: true, message: "ok", data: { removedCount: 3 } } } })
        await expect(mutationClearCart()).resolves.toEqual({
            data: { clearCart: { success: true, message: "ok", data: { removedCount: 3 } } },
        })
    })
})

describe("mutationRemoveFromCart", () => {
    it("selects the removed flag that separates 'already gone' from 'just removed'", async () => {
        await mutationRemoveFromCart({ courseId: "course-3" })
        expect(sentDocument()).toContain("removed")
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({ request: { courseId: "course-3" } })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
    })

    it("forwards an abort signal for a row that unmounts mid-flight", async () => {
        const signal = new AbortController().signal
        await mutationRemoveFromCart({ courseId: "course-3" }, { signal })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true, signal })
    })

    it("propagates transport failure to the pressing surface", async () => {
        mocks.mutate.mockRejectedValue(new Error("offline"))
        await expect(mutationRemoveFromCart({ courseId: "course-3" })).rejects.toThrow("offline")
    })
})

describe("mutationCoursesCheckout", () => {
    it("selects the provider redirect fields the buyer is sent to", async () => {
        await mutationCoursesCheckout({ courseIds: ["course-1"], paymentType: "sepay" })
        const document = sentDocument()
        expect(document).toContain("checkoutUrl")
        expect(document).toContain("referenceId")
        expect(document).toContain("transactionId")
        expect(document).toContain("checkoutFields")
    })

    it("sends the order exactly as given and never invents an installment schedule", async () => {
        const request = {
            courseIds: ["course-1", "course-2"],
            paymentType: "payos",
            returnUrl: "https://app/ok",
            cancelUrl: "https://app/no",
        }
        await mutationCoursesCheckout(request)
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({ request })
        expect(mocks.mutate.mock.calls[0][0].variables.request).not.toHaveProperty("installmentMonths")
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
    })

    it("merges transport options when the caller traces the checkout", async () => {
        await mutationCoursesCheckout({ courseIds: ["course-1"], paymentType: "sepay" }, { headers: { "x-trace": "checkout" } })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true, headers: { "x-trace": "checkout" } })
    })
})

describe("mutationStartTrial", () => {
    it("asks for the enrollment flag the preview gate reads", async () => {
        await mutationStartTrial({ courseId: "course-9" })
        expect(sentDocument()).toContain("isEnrolled")
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({ request: { courseId: "course-9" } })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
    })

    it("merges transport options for the preview enrollment", async () => {
        await mutationStartTrial({ courseId: "course-9" }, { debug: true, headers: { "x-trace": "trial" } })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            debug: true,
            headers: { "x-trace": "trial" },
        })
    })

    it("propagates a rejected trial start", async () => {
        mocks.mutate.mockRejectedValue(new Error("forbidden"))
        await expect(mutationStartTrial({ courseId: "course-9" })).rejects.toThrow("forbidden")
    })
})
