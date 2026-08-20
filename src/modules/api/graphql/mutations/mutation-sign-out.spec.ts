import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import { mutationSignOut } from "./mutation-sign-out"

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), createApolloClient: vi.fn() }))

vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    document.cookie = "csrf_token=csrf%20value"
    mocks.mutate.mockReset().mockResolvedValue({ data: { signOut: { success: true } } })
    mocks.createApolloClient.mockReset().mockReturnValue({ mutate: mocks.mutate })
})

describe("mutationSignOut", () => {
    it("uses authenticated cookie transport and forwards the CSRF token", async () => {
        await mutationSignOut()

        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            withCredentials: true,
            headers: { "x-csrf-token": "csrf value" },
        })
        const request = mocks.mutate.mock.calls[0]?.[0]
        expect(print(request.mutation)).toContain("mutation SignOut")
        expect(print(request.mutation)).toContain("signOut")
    })

    it("sends no CSRF header at all when the browser holds no such cookie", async () => {
        vi.spyOn(document, "cookie", "get").mockReturnValue("theme=dark")
        await mutationSignOut()
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            withCredentials: true,
            headers: { "x-csrf-token": undefined },
        })
        vi.restoreAllMocks()
    })
})
