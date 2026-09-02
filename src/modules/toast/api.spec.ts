import { beforeEach, describe, expect, it, vi } from "vitest"
import { runGraphQLWithToast } from "./api"

const mocks = vi.hoisted(() => ({ success: vi.fn(), danger: vi.fn() }))
vi.mock("./toast", () => ({ toast: mocks }))

describe("runGraphQLWithToast", () => {
    beforeEach(() => {
        mocks.success.mockReset()
        mocks.danger.mockReset()
    })

    it("returns false and surfaces a typed GraphQL failure", async () => {
        const result = await runGraphQLWithToast(async () => ({ success: false, message: "Offer changed" }))
        expect(result).toBe(false)
        expect(mocks.danger).toHaveBeenCalledOnce()
    })

    it("can hand off a successful write without a success toast", async () => {
        const result = await runGraphQLWithToast(async () => ({ success: true, message: "Pending", data: { checkoutUrl: "https://pay.example" } }), { showSuccessToast: false })
        expect(result).toBe(true)
        expect(mocks.success).not.toHaveBeenCalled()
    })
})
