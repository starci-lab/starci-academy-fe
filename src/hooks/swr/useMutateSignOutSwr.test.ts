import { beforeEach, describe, expect, it, vi } from "vitest"
import { MUTATE_SIGN_OUT_SWR_KEY, useMutateSignOutSwr } from "./useMutateSignOutSwr"

const mocks = vi.hoisted(() => ({ useSWRMutation: vi.fn(), mutationSignOut: vi.fn() }))

vi.mock("swr/mutation", () => ({ default: mocks.useSWRMutation }))
vi.mock("@/modules/api/graphql/mutations/mutation-sign-out", () => ({
    mutationSignOut: mocks.mutationSignOut,
}))

beforeEach(() => {
    mocks.useSWRMutation.mockReset().mockReturnValue({ trigger: vi.fn() })
    mocks.mutationSignOut.mockReset()
})

describe("useMutateSignOutSwr", () => {
    it("returns the confirmed sign-out response", async () => {
        mocks.mutationSignOut.mockResolvedValue({ data: { signOut: { success: true, message: "Signed out" } } })
        useMutateSignOutSwr()

        expect(mocks.useSWRMutation).toHaveBeenCalledWith(MUTATE_SIGN_OUT_SWR_KEY, expect.any(Function))
        const fetcher = mocks.useSWRMutation.mock.calls[0]?.[1]
        await expect(fetcher()).resolves.toMatchObject({ success: true })
    })

    it("rejects an unconfirmed sign-out without clearing local ownership", async () => {
        mocks.mutationSignOut.mockResolvedValue({ data: { signOut: { success: false, message: "Denied" } } })
        useMutateSignOutSwr()

        const fetcher = mocks.useSWRMutation.mock.calls[0]?.[1]
        await expect(fetcher()).rejects.toThrow("Denied")
    })
})
