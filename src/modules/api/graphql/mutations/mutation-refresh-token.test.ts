/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest"
import { mutationRefreshToken } from "./mutation-refresh-token"

const mocks = vi.hoisted(() => ({
    mutate: vi.fn(),
    createApolloClient: vi.fn(),
}))

vi.mock("../clients/create-apollo-client", () => ({
    createApolloClient: mocks.createApolloClient,
}))

beforeEach(() => {
    mocks.mutate.mockReset()
    mocks.mutate.mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ mutate: mocks.mutate })
    document.cookie = "csrf_token=signed-token; path=/"
})

describe("mutationRefreshToken", () => {
    it("sends the HttpOnly refresh cookie and mirrors the readable CSRF token", async () => {
        await mutationRefreshToken({ minValiditySeconds: 45 })
        expect(mocks.createApolloClient).toHaveBeenCalledWith(expect.objectContaining({
            withAuth: true,
            withCredentials: true,
            headers: { "x-csrf-token": "signed-token" },
        }))
    })

    it("sends the back-end TTL gate as the one request argument", async () => {
        await mutationRefreshToken({ minValiditySeconds: 45 })
        expect(mocks.mutate).toHaveBeenCalledWith(expect.objectContaining({
            variables: { request: { minValiditySeconds: 45 } },
        }))
    })
})
