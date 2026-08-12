/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { getSessionToken, setSessionToken } from "./useSessionToken"
import { refreshSession } from "./useSessionRefresh"

const mocks = vi.hoisted(() => ({ refresh: vi.fn() }))

vi.mock("@/modules/api/graphql/mutations/mutation-refresh-token", () => ({
    mutationRefreshToken: mocks.refresh,
}))

beforeEach(() => {
    setSessionToken("expired-token")
    mocks.refresh.mockReset()
})

afterEach(() => {
    setSessionToken(undefined)
})

describe("refreshSession", () => {
    it("replaces the stale access token with the cookie-backed refresh result", async () => {
        mocks.refresh.mockResolvedValue({
            data: { refreshToken: { success: true, message: "ok", data: { accessToken: "fresh-token" } } },
        })
        await refreshSession()
        expect(getSessionToken()).toBe("fresh-token")
    })

    it("ends a session whose refresh cookie can no longer renew it", async () => {
        mocks.refresh.mockResolvedValue({
            data: { refreshToken: { success: false, message: "expired" } },
        })
        await refreshSession()
        expect(getSessionToken()).toBeUndefined()
    })

    it("coalesces callers because one refresh rotates the HttpOnly cookie", async () => {
        let resolve!: (value: unknown) => void
        mocks.refresh.mockReturnValue(new Promise((done) => { resolve = done }))
        const first = refreshSession()
        const second = refreshSession()
        expect(mocks.refresh).toHaveBeenCalledTimes(1)
        resolve({ data: { refreshToken: { success: true, message: "ok", data: { accessToken: "fresh-token" } } } })
        await Promise.all([first, second])
    })
})
